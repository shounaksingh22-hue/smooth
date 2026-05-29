use crate::models::system::HardwareInfo;
use crate::platform::Platform;
use sysinfo::System;

pub fn analyze() -> HardwareInfo {
    let mut sys = System::new_all();
    sys.refresh_all();

    let hostname = System::host_name().unwrap_or_else(|| "Unknown".to_string());
    
    // Use platform overrides or sysinfo fallbacks
    let os_name = System::name().unwrap_or_else(|| "Unknown OS".to_string());
    let os_version = Platform::os_version();
    let kernel_version = System::kernel_version().unwrap_or_else(|| "Unknown".to_string());
    let model = Platform::hardware_model();

    let cpus = sys.cpus();
    let cpu_brand = if !cpus.is_empty() {
        cpus[0].brand().trim().to_string()
    } else {
        "Unknown CPU".to_string()
    };
    
    let cpu_arch = if cfg!(target_arch = "x86_64") {
        "x86_64".to_string()
    } else if cfg!(target_arch = "aarch64") {
        "aarch64".to_string()
    } else {
        "Unknown".to_string()
    };

    let physical_cores = sys.physical_core_count().unwrap_or(cpus.len());
    let logical_cores = cpus.len();
    let total_memory_bytes = sys.total_memory();
    let total_memory_display = bytesize::ByteSize(total_memory_bytes).to_string();

    HardwareInfo {
        hostname,
        os_name,
        os_version,
        kernel_version,
        model,
        cpu_brand,
        cpu_arch,
        physical_cores,
        logical_cores,
        total_memory_bytes,
        total_memory_display,
    }
}
