use crate::models::system::{MemoryInfo, ProcessInfo};
use crate::platform::Platform;
use sysinfo::{System, ProcessRefreshKind, RefreshKind};

pub fn analyze() -> (MemoryInfo, Vec<ProcessInfo>) {
    // We only need to refresh memory and processes to be fast
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing()
            .with_memory(sysinfo::MemoryRefreshKind::nothing().with_ram().with_swap())
            .with_processes(ProcessRefreshKind::nothing().with_memory().with_cpu())
    );
    sys.refresh_all();

    let total_bytes = sys.total_memory();
    let free_bytes = sys.free_memory();
    let used_bytes = sys.used_memory();
    let available_bytes = sys.available_memory();

    let swap_total_bytes = sys.total_swap();
    let swap_used_bytes = sys.used_swap();

    let usage_percent = if total_bytes > 0 {
        (used_bytes as f64 / total_bytes as f64) * 100.0
    } else {
        0.0
    };

    let swap_usage_percent = if swap_total_bytes > 0 {
        (swap_used_bytes as f64 / swap_total_bytes as f64) * 100.0
    } else {
        0.0
    };

    let pressure_level = Platform::memory_pressure();

    let memory_info = MemoryInfo {
        total_bytes,
        used_bytes,
        free_bytes,
        available_bytes,
        swap_total_bytes,
        swap_used_bytes,
        usage_percent,
        swap_usage_percent,
        pressure_level,
    };

    // Gather process memory consumption
    let mut processes = Vec::new();
    for (pid, process) in sys.processes() {
        let mem_bytes = process.memory();
        let mem_percent = if total_bytes > 0 {
            (mem_bytes as f32 / total_bytes as f32) * 100.0
        } else {
            0.0
        };

        processes.push(ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string_lossy().to_string(),
            cpu_percent: process.cpu_usage(),
            memory_percent: mem_percent,
        });
    }

    // Sort by memory percent descending
    processes.sort_by(|a, b| b.memory_percent.partial_cmp(&a.memory_percent).unwrap_or(std::cmp::Ordering::Equal));
    processes.truncate(15);

    (memory_info, processes)
}
