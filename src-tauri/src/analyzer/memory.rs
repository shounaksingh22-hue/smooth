use crate::models::system::{MemoryInfo, ProcessInfo};
use crate::platform::Platform;
use sysinfo::{System, ProcessRefreshKind, RefreshKind};

pub fn analyze() -> MemoryInfo {
    // We only need to refresh memory and processes to be fast
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing()
            .with_memory(sysinfo::MemoryRefreshKind::nothing().with_ram().with_swap())
            .with_processes(ProcessRefreshKind::nothing().with_memory().with_cpu())
    );
    sys.refresh_all();

    let total_bytes = sys.total_memory();
    let used_bytes = sys.used_memory();
    let available_bytes = sys.available_memory();

    let swap_total_bytes = sys.total_swap();
    let swap_used_bytes = sys.used_swap();

    let memory_pressure = Platform::memory_pressure();

    // Gather process memory consumption
    let mut top_consumers = Vec::new();
    for (pid, process) in sys.processes() {
        let mem_bytes = process.memory();
        
        let status = match process.status() {
            sysinfo::ProcessStatus::Run => "Running",
            sysinfo::ProcessStatus::Sleep => "Sleeping",
            sysinfo::ProcessStatus::Idle => "Idle",
            _ => "Sleeping",
        }.to_string();

        top_consumers.push(ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string_lossy().to_string(),
            cpu_percent: process.cpu_usage(),
            memory_bytes: mem_bytes,
            status,
        });
    }

    // Sort by memory bytes descending
    top_consumers.sort_by(|a, b| b.memory_bytes.cmp(&a.memory_bytes));
    top_consumers.truncate(15);

    MemoryInfo {
        total_bytes,
        used_bytes,
        available_bytes,
        swap_total_bytes,
        swap_used_bytes,
        memory_pressure,
        top_consumers,
    }
}
