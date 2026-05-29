pub mod hardware;
pub mod storage;
pub mod memory;
pub mod cpu;
pub mod startup;

use crate::models::system::{SystemReport, OsInfo};
use sysinfo::System;
use chrono::Local;

pub fn run_full_analysis() -> SystemReport {
    let hardware = hardware::analyze();
    let storage = storage::analyze();
    let memory = memory::analyze();
    let cpu = cpu::analyze();
    let startup_items = startup::analyze();
    
    // Gather OS information
    let name = System::name().unwrap_or_else(|| "Unknown".to_string());
    let version = System::os_version().unwrap_or_else(|| "Unknown".to_string());
    let kernel_version = System::kernel_version().unwrap_or_else(|| "Unknown".to_string());
    let hostname = System::host_name().unwrap_or_else(|| "localhost".to_string());
    
    // Attempt to extract build version on Mac from Platform::os_version()
    let os_ver_string = crate::platform::Platform::os_version();
    let build = if os_ver_string.contains("(") && os_ver_string.contains(")") {
        os_ver_string
            .split('(')
            .nth(1)
            .unwrap_or("")
            .replace(')', "")
            .trim()
            .to_string()
    } else {
        "".to_string()
    };

    let os = OsInfo {
        name,
        version,
        build,
        hostname,
        kernel_version,
    };

    let generated_at = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    SystemReport {
        hardware,
        storage,
        memory,
        cpu,
        startup_items,
        os,
        generated_at,
    }
}
