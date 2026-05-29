pub mod hardware;
pub mod storage;
pub mod memory;
pub mod cpu;
pub mod startup;

use crate::models::system::SystemReport;
use chrono::Local;

pub fn run_full_analysis() -> SystemReport {
    let hardware = hardware::analyze();
    let storage = storage::analyze();
    let (memory, memory_processes) = memory::analyze();
    let mut cpu = cpu::analyze();
    
    // Inject memory processes if needed or keep both separate. 
    // In our SystemReport model, cpu has cpu_info.top_processes which is sorted by CPU.
    // memory_processes are processes sorted by Memory.
    // Let's make sure CpuInfo top processes are sorted by CPU, which is done in cpu::analyze().

    let startup_items = startup::analyze();
    let generated_at = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    SystemReport {
        hardware,
        storage,
        memory,
        cpu,
        startup_items,
        generated_at,
    }
}
