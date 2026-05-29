/* ========================================================================
   Diagnosis Types — Issue detection and suggestions
   ======================================================================== */

export type RiskLevel = "safe" | "low" | "medium" | "high";
export type Category = "storage" | "memory" | "cpu" | "startup" | "system" | "network";

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: Category;
  risk_level: RiskLevel;
  estimated_gain: string;
  estimated_gain_bytes?: number;
  details: string;
  dry_run_preview: string;
  enabled: boolean;
  impact_score: number; // 0–100
}

export interface DiagnosisResult {
  suggestions: Suggestion[];
  overall_health_score: number; // 0–100
  scan_duration_ms: number;
  summary: string;
}

/* ---- Category Metadata ---- */
export const CATEGORY_META: Record<Category, { label: string; color: string; icon: string }> = {
  storage: { label: "Storage", color: "#10b981", icon: "HardDrive" },
  memory: { label: "Memory", color: "#14b8a6", icon: "MemoryStick" },
  cpu: { label: "CPU", color: "#f59e0b", icon: "Cpu" },
  startup: { label: "Startup", color: "#8b5cf6", icon: "Zap" },
  system: { label: "System", color: "#3b82f6", icon: "Settings" },
  network: { label: "Network", color: "#ec4899", icon: "Wifi" },
};

export const RISK_META: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  safe: { label: "Safe", color: "#34d399", bgColor: "rgba(52, 211, 153, 0.1)" },
  low: { label: "Low Risk", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" },
  medium: { label: "Medium Risk", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)" },
  high: { label: "High Risk", color: "#f43f5e", bgColor: "rgba(244, 63, 94, 0.1)" },
};

/* ---- Mock Data ---- */
export const MOCK_DIAGNOSIS: DiagnosisResult = {
  overall_health_score: 62,
  scan_duration_ms: 3420,
  summary: "Found 8 optimization opportunities that could free up 18.4 GB and improve performance.",
  suggestions: [
    {
      id: "cache-cleanup",
      title: "Clear Application Caches",
      description: "Remove cached data from browsers, Xcode, and other apps that has accumulated over time.",
      category: "storage",
      risk_level: "safe",
      estimated_gain: "8.2 GB",
      estimated_gain_bytes: 8804682956,
      details: "Includes browser caches (3.1 GB), Xcode derived data (4.2 GB), and npm cache (0.9 GB).",
      dry_run_preview: "Will delete: ~/Library/Caches/*, ~/Library/Developer/Xcode/DerivedData/*",
      enabled: true,
      impact_score: 85,
    },
    {
      id: "log-cleanup",
      title: "Clear Old Log Files",
      description: "Remove system and application log files older than 30 days.",
      category: "storage",
      risk_level: "safe",
      estimated_gain: "2.1 GB",
      estimated_gain_bytes: 2254857830,
      details: "System logs, crash reports, and diagnostic reports consuming unnecessary space.",
      dry_run_preview: "Will delete: ~/Library/Logs/*, /var/log/*.old",
      enabled: true,
      impact_score: 70,
    },
    {
      id: "docker-cleanup",
      title: "Prune Docker Resources",
      description: "Remove unused Docker images, containers, and volumes.",
      category: "storage",
      risk_level: "low",
      estimated_gain: "5.8 GB",
      estimated_gain_bytes: 6227020800,
      details: "12 unused images, 5 stopped containers, and 3 dangling volumes found.",
      dry_run_preview: "Will run: docker system prune -a --volumes",
      enabled: true,
      impact_score: 75,
    },
    {
      id: "disable-docker-startup",
      title: "Disable Docker Desktop at Login",
      description: "Docker Desktop starts automatically and uses 800+ MB RAM even when idle.",
      category: "startup",
      risk_level: "safe",
      estimated_gain: "~800 MB RAM",
      details: "Docker Desktop runs in the background consuming significant memory. Start it only when needed.",
      dry_run_preview: "Will remove Docker Desktop from Login Items",
      enabled: true,
      impact_score: 60,
    },
    {
      id: "disable-adobe-startup",
      title: "Disable Adobe Creative Cloud at Login",
      description: "Adobe CC helper processes consume CPU and memory in the background.",
      category: "startup",
      risk_level: "safe",
      estimated_gain: "~400 MB RAM",
      details: "Multiple Adobe background processes detected using resources.",
      dry_run_preview: "Will disable Adobe Creative Cloud launch agents",
      enabled: true,
      impact_score: 55,
    },
    {
      id: "memory-heavy-apps",
      title: "Close Memory-Heavy Applications",
      description: "Google Chrome is using 2 GB of memory with 47 tabs open.",
      category: "memory",
      risk_level: "medium",
      estimated_gain: "~1.5 GB RAM",
      details: "Suggest closing unused tabs or using a tab suspender extension.",
      dry_run_preview: "Will show list of memory-heavy tabs for manual review",
      enabled: false,
      impact_score: 50,
    },
    {
      id: "dns-cache-flush",
      title: "Flush DNS Cache",
      description: "Stale DNS entries may slow down network requests.",
      category: "network",
      risk_level: "safe",
      estimated_gain: "Faster DNS resolution",
      details: "DNS cache has 2,847 entries. Flushing can resolve connectivity issues.",
      dry_run_preview: "Will run: sudo dscacheutil -flushcache",
      enabled: true,
      impact_score: 30,
    },
    {
      id: "spotlight-reindex",
      title: "Rebuild Spotlight Index",
      description: "Spotlight index may be corrupted, causing slow searches and high CPU usage.",
      category: "system",
      risk_level: "medium",
      estimated_gain: "Lower CPU usage",
      details: "mdworker process has been consuming high CPU. Rebuilding the index may resolve this.",
      dry_run_preview: "Will run: mdutil -E /",
      enabled: false,
      impact_score: 40,
    },
  ],
};
