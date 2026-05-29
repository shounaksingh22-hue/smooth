use crate::models::system::HardwareInfo;
use crate::platform::Platform;
use sysinfo::System;

pub fn analyze() -> HardwareInfo {
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpus = sys.cpus();
    let cpu_brand = if !cpus.is_empty() {
        cpus[0].brand().trim().to_string()
    } else {
        "Unknown CPU".to_string()
    };

    let cpu_cores = sys.physical_core_count().unwrap_or(cpus.len());
    let cpu_threads = cpus.len();
    
    // Get CPU frequency from first core in MHz
    let cpu_frequency_mhz = cpus.first().map(|cpu| cpu.frequency()).unwrap_or(0);

    let architecture = if cfg!(target_arch = "x86_64") {
        "x86_64".to_string()
    } else if cfg!(target_arch = "aarch64") {
        "aarch64".to_string()
    } else {
        "Unknown".to_string()
    };

    let total_memory_bytes = sys.total_memory();
    let machine_model = Platform::hardware_model();

    // Query GPU Name
    let gpu_name = get_gpu_name();

    // Determine disk type
    let disk_type = if Platform::is_ssd() {
        if cfg!(target_os = "macos") {
            "NVMe".to_string()
        } else {
            "SSD".to_string()
        }
    } else {
        "HDD".to_string()
    };

    HardwareInfo {
        cpu_brand,
        cpu_cores,
        cpu_threads,
        cpu_frequency_mhz,
        gpu_name,
        total_memory_bytes,
        disk_type,
        machine_model,
        architecture,
    }
}

fn get_gpu_name() -> String {
    #[cfg(target_os = "macos")]
    {
        if let Ok(output) = std::process::Command::new("system_profiler")
            .args(&["SPDisplaysDataType"])
            .output()
        {
            let stdout_str = String::from_utf8_lossy(&output.stdout);
            for line in stdout_str.lines() {
                if line.contains("Chipset Model:") {
                    if let Some(val) = line.split(':').nth(1) {
                        return val.trim().to_string();
                    }
                }
            }
        }
        "Apple GPU".to_string()
    }
    #[cfg(target_os = "windows")]
    {
        // Default on Windows if no direct command
        "Intel/NVIDIA/AMD Graphics".to_string()
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        "Integrated Graphics".to_string()
    }
}
