/* ========================================================================
   System Types — Represents all data from Rust backend analysis
   ======================================================================== */

export interface SystemInfo {
  hardware: HardwareInfo;
  storage: StorageInfo;
  memory: MemoryInfo;
  cpu: CpuInfo;
  startup_items: StartupItem[];
  os: OsInfo;
}

export interface HardwareInfo {
  cpu_brand: string;
  cpu_cores: number;
  cpu_threads: number;
  cpu_frequency_mhz: number;
  gpu_name: string;
  total_memory_bytes: number;
  disk_type: "SSD" | "HDD" | "NVMe" | "Unknown";
  machine_model: string;
  architecture: string;
}

export interface StorageInfo {
  total_bytes: number;
  used_bytes: number;
  available_bytes: number;
  mount_point: string;
  file_system: string;
  breakdown: StorageBreakdown;
}

export interface StorageBreakdown {
  system: number;
  applications: number;
  documents: number;
  media: number;
  caches: number;
  other: number;
}

export interface MemoryInfo {
  total_bytes: number;
  used_bytes: number;
  available_bytes: number;
  swap_total_bytes: number;
  swap_used_bytes: number;
  memory_pressure: "Normal" | "Warning" | "Critical";
  top_consumers: ProcessInfo[];
}

export interface CpuInfo {
  overall_usage_percent: number;
  per_core_usage: number[];
  top_processes: ProcessInfo[];
  temperature_celsius: number | null;
  uptime_seconds: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_bytes: number;
  status: "Running" | "Sleeping" | "Idle" | "Zombie";
}

export interface StartupItem {
  name: string;
  path: string;
  enabled: boolean;
  impact: "High" | "Medium" | "Low";
  category: "LoginItem" | "LaunchAgent" | "LaunchDaemon" | "ScheduledTask";
}

export interface OsInfo {
  name: string;
  version: string;
  build: string;
  hostname: string;
  kernel_version: string;
}

/* ---- Mock data for development ---- */
export const MOCK_SYSTEM_INFO: SystemInfo = {
  hardware: {
    cpu_brand: "Apple M2 Pro",
    cpu_cores: 10,
    cpu_threads: 10,
    cpu_frequency_mhz: 3490,
    gpu_name: "Apple M2 Pro (16-core GPU)",
    total_memory_bytes: 17179869184,
    disk_type: "NVMe",
    machine_model: "MacBook Pro (14-inch, 2023)",
    architecture: "arm64",
  },
  storage: {
    total_bytes: 494384795648,
    used_bytes: 312475238400,
    available_bytes: 181909557248,
    mount_point: "/",
    file_system: "APFS",
    breakdown: {
      system: 15728640000,
      applications: 52428800000,
      documents: 78643200000,
      media: 104857600000,
      caches: 31457280000,
      other: 29360128400,
    },
  },
  memory: {
    total_bytes: 17179869184,
    used_bytes: 12884901888,
    available_bytes: 4294967296,
    swap_total_bytes: 4294967296,
    swap_used_bytes: 1073741824,
    memory_pressure: "Warning",
    top_consumers: [
      { pid: 1234, name: "Google Chrome", cpu_percent: 12.5, memory_bytes: 2147483648, status: "Running" },
      { pid: 5678, name: "Xcode", cpu_percent: 8.3, memory_bytes: 1610612736, status: "Running" },
      { pid: 9012, name: "Figma", cpu_percent: 5.1, memory_bytes: 1073741824, status: "Running" },
      { pid: 3456, name: "Docker Desktop", cpu_percent: 3.2, memory_bytes: 858993459, status: "Running" },
      { pid: 7890, name: "Slack", cpu_percent: 1.8, memory_bytes: 536870912, status: "Running" },
    ],
  },
  cpu: {
    overall_usage_percent: 34.2,
    per_core_usage: [45, 32, 67, 21, 55, 18, 42, 29, 38, 15],
    top_processes: [
      { pid: 1234, name: "Google Chrome", cpu_percent: 12.5, memory_bytes: 2147483648, status: "Running" },
      { pid: 5678, name: "Xcode", cpu_percent: 8.3, memory_bytes: 1610612736, status: "Running" },
      { pid: 9012, name: "Figma", cpu_percent: 5.1, memory_bytes: 1073741824, status: "Running" },
      { pid: 3456, name: "Docker Desktop", cpu_percent: 3.2, memory_bytes: 858993459, status: "Running" },
      { pid: 7890, name: "Slack", cpu_percent: 1.8, memory_bytes: 536870912, status: "Running" },
    ],
    temperature_celsius: 52.3,
    uptime_seconds: 345600,
  },
  startup_items: [
    { name: "Spotify", path: "/Applications/Spotify.app", enabled: true, impact: "Medium", category: "LoginItem" },
    { name: "Docker Desktop", path: "/Applications/Docker.app", enabled: true, impact: "High", category: "LoginItem" },
    { name: "Alfred", path: "/Applications/Alfred 5.app", enabled: true, impact: "Low", category: "LoginItem" },
    { name: "Dropbox", path: "/Applications/Dropbox.app", enabled: true, impact: "High", category: "LaunchAgent" },
    { name: "Google Updater", path: "/Library/LaunchAgents/com.google.updater", enabled: true, impact: "Low", category: "LaunchAgent" },
    { name: "Adobe Creative Cloud", path: "/Applications/Adobe CC", enabled: true, impact: "High", category: "LoginItem" },
  ],
  os: {
    name: "macOS",
    version: "15.2",
    build: "24C101",
    hostname: "MacBook-Pro",
    kernel_version: "Darwin 24.2.0",
  },
};
