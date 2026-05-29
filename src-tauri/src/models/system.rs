use bytesize::ByteSize;
use serde::{Deserialize, Serialize};

/// Top-level system report combining all analysis results.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SystemReport {
    pub hardware: HardwareInfo,
    pub storage: StorageInfo,
    pub memory: MemoryInfo,
    pub cpu: CpuInfo,
    pub startup_items: Vec<StartupItem>,
    pub generated_at: String,
}

/// Hardware information about the machine.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct HardwareInfo {
    pub hostname: String,
    pub os_name: String,
    pub os_version: String,
    pub kernel_version: String,
    pub model: String,
    pub cpu_brand: String,
    pub cpu_arch: String,
    pub physical_cores: usize,
    pub logical_cores: usize,
    pub total_memory_bytes: u64,
    pub total_memory_display: String,
}

/// Disk / storage information.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StorageInfo {
    pub disks: Vec<DiskInfo>,
    pub total_capacity_bytes: u64,
    pub total_available_bytes: u64,
    pub total_used_bytes: u64,
    pub usage_percent: f64,
    pub is_ssd: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub file_system: String,
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub used_bytes: u64,
    pub usage_percent: f64,
    pub is_removable: bool,
}

/// Live memory usage information.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MemoryInfo {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub free_bytes: u64,
    pub available_bytes: u64,
    pub swap_total_bytes: u64,
    pub swap_used_bytes: u64,
    pub usage_percent: f64,
    pub swap_usage_percent: f64,
    pub pressure_level: String,
}

/// CPU usage snapshot.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CpuInfo {
    pub global_usage_percent: f32,
    pub per_core_usage: Vec<f32>,
    pub top_processes: Vec<ProcessInfo>,
    pub load_average: LoadAverage,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_percent: f32,
    pub memory_percent: f32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LoadAverage {
    pub one_min: f64,
    pub five_min: f64,
    pub fifteen_min: f64,
}

/// A startup / login item.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StartupItem {
    pub name: String,
    pub path: String,
    pub enabled: bool,
    pub source: String,
}

impl StorageInfo {
    /// Human-readable display helpers.
    pub fn total_capacity_display(&self) -> String {
        ByteSize(self.total_capacity_bytes).to_string()
    }

    pub fn total_available_display(&self) -> String {
        ByteSize(self.total_available_bytes).to_string()
    }
}
