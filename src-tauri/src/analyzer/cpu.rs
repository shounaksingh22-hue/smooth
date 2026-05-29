use crate::models::system::{CpuInfo, ProcessInfo, LoadAverage};
use sysinfo::{System, ProcessRefreshKind, RefreshKind};

pub fn analyze() -> CpuInfo {
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing()
            .with_cpu(sysinfo::CpuRefreshKind::nothing().with_cpu_usage())
            .with_processes(ProcessRefreshKind::nothing().with_cpu().with_memory())
    );
    
    // We need to sleep briefly or measure twice to get accurate CPU usage from sysinfo.
    // However, since Tauri commands are async, we can do a quick sleep of 100ms.
    sys.refresh_all();
    std::thread::sleep(std::time::Duration::from_millis(100));
    sys.refresh_all();

    let global_usage_percent = sys.global_cpu_usage();
    let per_core_usage: Vec<f32> = sys.cpus().iter().map(|cpu| cpu.cpu_usage()).collect();

    let load_avg = System::load_average();
    let load_average = LoadAverage {
        one_min: load_avg.one,
        five_min: load_avg.five,
        fifteen_min: load_avg.fifteen,
    };

    let mut processes = Vec::new();
    let total_memory = sys.total_memory();

    for (pid, process) in sys.processes() {
        let mem_bytes = process.memory();
        let mem_percent = if total_memory > 0 {
            (mem_bytes as f32 / total_memory as f32) * 100.0
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

    // Sort by CPU usage descending
    processes.sort_by(|a, b| b.cpu_percent.partial_cmp(&a.cpu_percent).unwrap_or(std::cmp::Ordering::Equal));
    processes.truncate(15);

    CpuInfo {
        global_usage_percent,
        per_core_usage,
        top_processes: processes,
        load_average,
    }
}
