import { SystemInfo } from "../types/system";
import { MaintenancePlan, MaintenanceTip, TipPriority } from "../types/maintenance";
import { formatBytes } from "./formatters";

/*
  The maintenance advisor turns one real analysis into specific advice. Every
  tip is gated on a measured signal and cites the number that triggered it, so
  it never produces generic filler. If nothing warrants attention, it says so.
  This runs over the same SystemInfo on every platform, in the preview and in
  the real app, so what you see is always derived from real data.
*/

const GIB = 1024 ** 3;

const BROWSERS: [string, string][] = [
  ["google chrome", "Chrome"],
  ["chromium", "Chrome"],
  ["chrome", "Chrome"],
  ["safari", "Safari"],
  ["firefox", "Firefox"],
  ["microsoft edge", "Edge"],
  ["edge", "Edge"],
  ["brave", "Brave"],
  ["arc", "Arc"],
  ["opera", "Opera"],
  ["vivaldi", "Vivaldi"],
];

function matchBrowser(name: string): string | null {
  const n = name.toLowerCase();
  for (const [needle, label] of BROWSERS) if (n.includes(needle)) return label;
  return null;
}

function joinAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function tip(
  id: string,
  title: string,
  body: string,
  category: string,
  priority: TipPriority,
  impact: string
): MaintenanceTip {
  return { id, title, body, category, priority, impact };
}

export function buildMaintenancePlan(info: SystemInfo): MaintenancePlan {
  const tips: MaintenanceTip[] = [];

  const ramGb = info.hardware.total_memory_bytes / GIB;
  const totalDisk = info.storage.total_bytes || 1;
  const freePct = (info.storage.available_bytes / totalDisk) * 100;
  const pressure = (info.memory.memory_pressure || "").toLowerCase();
  const pressureHigh = pressure.includes("critical") || pressure.includes("warning");
  const startup = info.startup_items ?? [];
  const highStartup = startup.filter((s) => s.impact === "High");
  const uptimeDays = (info.cpu.uptime_seconds || 0) / 86400;
  const caches = info.storage.breakdown?.caches ?? 0;
  const swapUsed = info.memory.swap_used_bytes ?? 0;

  // Which browsers are among the heaviest processes, and which is the largest?
  const heavy = [...(info.memory.top_consumers ?? []), ...(info.cpu.top_processes ?? [])];
  const browsers: string[] = [];
  let topBrowser: { name: string; mem: number } | null = null;
  for (const p of heavy) {
    const label = matchBrowser(p.name || "");
    if (!label) continue;
    if (!browsers.includes(label)) browsers.push(label);
    if (!topBrowser || (p.memory_bytes || 0) > topBrowser.mem) {
      topBrowser = { name: label, mem: p.memory_bytes || 0 };
    }
  }

  // 1. Low RAM with more than one browser open: the most personal tip
  if (ramGb <= 8.5 && browsers.length >= 2) {
    tips.push(
      tip(
        "ram_one_browser",
        "Run one browser at a time",
        `With ${Math.round(ramGb)} GB of RAM, running ${joinAnd(
          browsers
        )} at the same time is likely your biggest day to day slowdown. Pick one as your main browser and quit the other.`,
        "memory",
        "high",
        "Less swapping, snappier apps"
      )
    );
  } else if (!pressureHigh && topBrowser && topBrowser.mem >= 1.5 * GIB) {
    tips.push(
      tip(
        "browser_heavy",
        `${topBrowser.name} is your heaviest app`,
        `${topBrowser.name} is using ${formatBytes(
          topBrowser.mem
        )} right now. Closing unused tabs or adding a tab suspender frees the most memory in one move.`,
        "browser",
        "medium",
        "Frees the most memory per click"
      )
    );
  }

  // 2. Mechanical drive
  if (info.hardware.disk_type === "HDD") {
    tips.push(
      tip(
        "ssd_upgrade",
        "An SSD is your biggest upgrade",
        "This machine runs on a mechanical hard drive. Moving to an SSD is the single change that makes it feel new. Until then, keep the drive under 80 percent full.",
        "hardware",
        "high",
        "Largest possible speedup"
      )
    );
  }

  // 3. Free space
  if (freePct < 15) {
    tips.push(
      tip(
        "free_low",
        "Free up some breathing room",
        `Your drive is ${Math.round(
          freePct
        )} percent free. Machines slow down sharply below 15 percent because they run out of room to work with. Clearing caches now buys back space.`,
        "storage",
        "high",
        "Stops slowdowns and stalls"
      )
    );
  } else if (freePct < 25) {
    tips.push(
      tip(
        "free_watch",
        "Keep an eye on disk space",
        `You are at ${Math.round(
          freePct
        )} percent free. Try to stay above 15 percent so the system always has room to work.`,
        "storage",
        "low",
        "Prevents future slowdowns"
      )
    );
  }

  // 4. Memory pressure right now
  if (pressureHigh) {
    const top = (info.memory.top_consumers ?? [])[0];
    const detail = top ? ` Your heaviest app is ${top.name} at ${formatBytes(top.memory_bytes)}.` : "";
    tips.push(
      tip(
        "mem_pressure",
        "Memory is under pressure",
        `Memory pressure is ${info.memory.memory_pressure}.${detail} Closing what you are not actively using frees it up the fastest.`,
        "memory",
        pressure.includes("critical") ? "high" : "medium",
        "Reduces lag and stalls"
      )
    );
  }

  // 5. Heavy swap
  if (swapUsed >= 2 * GIB) {
    tips.push(
      tip(
        "swap",
        "Your system is leaning on swap",
        `About ${formatBytes(
          swapUsed
        )} has spilled from RAM onto the disk, which is far slower than memory. Freeing apps, or adding RAM, removes that bottleneck.`,
        "memory",
        "medium",
        "Less disk thrash"
      )
    );
  }

  // 6. Startup load
  if (startup.length > 8 || highStartup.length >= 2) {
    const body =
      highStartup.length >= 2
        ? `Several heavy apps launch at login (${joinAnd(
            highStartup.slice(0, 3).map((s) => s.name)
          )}). Turning off the ones you do not need every day shortens boot and frees background memory.`
        : `${startup.length} apps start automatically at login. Turning off the ones you do not need every day shortens boot and frees background memory.`;
    tips.push(tip("startup", "Trim what launches at login", body, "startup", "medium", "Faster boots, less background load"));
  }

  // 7. Long uptime
  if (uptimeDays >= 7) {
    tips.push(
      tip(
        "uptime",
        "A restart is overdue",
        `This machine has been running for ${Math.round(
          uptimeDays
        )} days. A restart clears memory and resets background processes, and it is the easiest fix on this list.`,
        "habit",
        "medium",
        "Clears memory buildup"
      )
    );
  }

  // 8. Caches piling up
  if (caches >= 5 * GIB) {
    tips.push(
      tip(
        "caches",
        "Caches are adding up",
        `You are holding ${formatBytes(
          caches
        )} of caches. A cleanup every few weeks keeps that from creeping back, and it is completely reversible.`,
        "storage",
        "low",
        "Keeps space reclaimed"
      )
    );
  }

  const rank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  tips.sort((a, b) => (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3));

  const high = tips.filter((t) => t.priority === "high").length;
  let headline: string;
  if (tips.length === 0) {
    headline = "Based on this scan, your machine is in good shape. Nothing needs attention right now.";
  } else if (high > 0) {
    headline = `Based on this scan, your ${high} biggest ${high === 1 ? "win is" : "wins are"} at the top.`;
  } else {
    headline = "Based on this scan, here are a few small habits that will keep things smooth.";
  }

  return { tips, headline };
}
