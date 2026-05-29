use crate::models::system::{CpuInfo, ProcessInfo};
use sysinfo::{System, ProcessRefreshKind, RefreshKind};

pub fn analyze() -> CpuInfo {
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing()
            .with_cpu(sysinfo::CpuRefreshKind::nothing().with_cpu_usage())
            .with_processes(ProcessRefreshKind::nothing().with_cpu().with_memory())
    );
    
    // We need to sleep briefly or measure twice to get accurate CPU usage from sysinfo.
    sys.refresh_all();
    std::thread::sleep(std::time::Duration::from_millis(100));
    sys.refresh_all();

    let overall_usage_percent = sys.global_cpu_usage() as f64;
    let per_core_usage: Vec<f32> = sys.cpus().iter().map(|cpu| cpu.cpu_usage()).collect();
    let uptime_seconds = System::uptime();

    let mut top_processes = Vec::new();
    for (pid, process) in sys.processes() {
        let mem_bytes = process.memory();
        
        let status = match process.status() {
            sysinfo::ProcessStatus::Run => "Running",
            sysinfo::ProcessStatus::Sleep => "Sleeping",
            sysinfo::ProcessStatus::Idle => "Idle",
            _ => "Sleeping",
        }.to_string();

        top_processes.push(ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string_lossy().to_string(),
            cpu_percent: process.cpu_usage(),
            memory_bytes: mem_bytes,
            status,
        });
    }

    // Sort by CPU usage descending
    top_processes.sort_by(|a, b| b.cpu_percent.partial_cmp(&a.cpu_percent).unwrap_or(std::cmp::Ordering::Equal));
    top_processes.truncate(15);

    CpuInfo {
        overall_usage_percent,
        per_core_usage,
        top_processes,
        temperature_celsius: None, // No permission-free lightweight cross-platform query, fallback to null is standard
        uptime_seconds,
    }
}
