use serde::{Deserialize, Serialize};

/// Top-level system report combining all analysis results.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SystemReport {
    pub hardware: HardwareInfo,
    pub storage: StorageInfo,
    pub memory: MemoryInfo,
    pub cpu: CpuInfo,
    pub startup_items: Vec<StartupItem>,
    pub os: OsInfo,
    pub generated_at: String,
}

/// Hardware information about the machine.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct HardwareInfo {
    pub cpu_brand: String,
    pub cpu_cores: usize,
    pub cpu_threads: usize,
    pub cpu_frequency_mhz: u64,
    pub gpu_name: String,
    pub total_memory_bytes: u64,
    pub disk_type: String, // "SSD" | "HDD" | "NVMe" | "Unknown"
    pub machine_model: String,
    pub architecture: String,
}

/// Disk / storage information.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StorageInfo {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub available_bytes: u64,
    pub mount_point: String,
    pub file_system: String,
    pub breakdown: StorageBreakdown,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StorageBreakdown {
    pub system: u64,
    pub applications: u64,
    pub documents: u64,
    pub media: u64,
    pub caches: u64,
    pub other: u64,
}

/// Live memory usage information.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MemoryInfo {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub available_bytes: u64,
    pub swap_total_bytes: u64,
    pub swap_used_bytes: u64,
    pub memory_pressure: String, // "Normal" | "Warning" | "Critical"
    pub top_consumers: Vec<ProcessInfo>,
}

/// CPU usage snapshot.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CpuInfo {
    pub overall_usage_percent: f64,
    pub per_core_usage: Vec<f32>,
    pub top_processes: Vec<ProcessInfo>,
    pub temperature_celsius: Option<f64>,
    pub uptime_seconds: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_percent: f32,
    pub memory_bytes: u64,
    pub status: String, // "Running" | "Sleeping" | "Idle" | "Zombie"
}

/// A startup / login item.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StartupItem {
    pub name: String,
    pub path: String,
    pub enabled: bool,
    pub impact: String, // "High" | "Medium" | "Low"
    pub category: String, // "LoginItem" | "LaunchAgent" | "LaunchDaemon" | "ScheduledTask"
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct OsInfo {
    pub name: String,
    pub version: String,
    pub build: String,
    pub hostname: String,
    pub kernel_version: String,
}

/// A cache or registry directory entry
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CacheEntry {
    pub name: String,
    pub category: String,
    pub bytes: u64,
    pub display_size: String,
    pub count: usize,
}
