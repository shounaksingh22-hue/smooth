use crate::models::system::SystemReport;
use crate::models::diagnosis::{DiagnosisFinding, Severity, DiagnosisCategory};

pub fn run_rules(report: &SystemReport) -> Vec<DiagnosisFinding> {
    let mut findings = Vec::new();

    // 1. HDD Check
    if !report.storage.is_ssd {
        findings.push(DiagnosisFinding {
            id: "hdd_detected".to_string(),
            title: "Mechanical HDD Detected".to_string(),
            description: "Your system drive is a mechanical hard disk drive (HDD). Modern operating systems are optimized for Solid State Drives (SSDs). An HDD will cause slow app launches, long boot times, and lag during multitasking.".to_string(),
            severity: Severity::Warning,
            category: DiagnosisCategory::Storage,
            recommendation: "Upgrading your system drive to an SSD will provide a massive performance boost that software cleanups cannot match.".to_string(),
            auto_fixable: false,
        });
    }

    // 2. Storage Capacity Check
    if report.storage.total_capacity_bytes > 0 {
        let free_percent = (report.storage.total_available_bytes as f64 / report.storage.total_capacity_bytes as f64) * 100.0;
        if free_percent < 10.0 {
            findings.push(DiagnosisFinding {
                id: "storage_critical".to_string(),
                title: "Disk Space Critically Low".to_string(),
                description: format!("Your system drive has only {:.1}% free space. A full disk slows down the OS, prevents writing caches, and blocks system updates.", free_percent),
                severity: Severity::Critical,
                category: DiagnosisCategory::Storage,
                recommendation: "Run a storage cleanup immediately, empty your trash, and remove unused application files or downloads.".to_string(),
                auto_fixable: true,
            });
        } else if free_percent < 20.0 {
            findings.push(DiagnosisFinding {
                id: "storage_warning".to_string(),
                title: "Disk Space Running Low".to_string(),
                description: format!("Your system drive has {:.1}% free space remaining. Performance may begin to degrade if free space drops below 10%.", free_percent),
                severity: Severity::Warning,
                category: DiagnosisCategory::Storage,
                recommendation: "Consider cleaning up temporary caches and emptying your Recycle Bin/Trash.",
                auto_fixable: true,
            });
        }
    }

    // 3. Memory Pressure / Usage Check
    let mem_press = report.memory.pressure_level.to_lowercase();
    if mem_press.contains("critical") {
        findings.push(DiagnosisFinding {
            id: "memory_pressure_critical".to_string(),
            title: "Memory Pressure is Critical".to_string(),
            description: "Your operating system is struggling to allocate RAM for running apps. This causes frequent disk swapping and severe application lag.".to_string(),
            severity: Severity::Critical,
            category: DiagnosisCategory::Memory,
            recommendation: "Close high-memory applications and clear inactive memory.",
            auto_fixable: true,
        });
    } else if mem_press.contains("warning") || report.memory.usage_percent > 85.0 {
        findings.push(DiagnosisFinding {
            id: "memory_pressure_warning".to_string(),
            title: "High Memory Usage".to_string(),
            description: format!("Your system is using {:.1}% of its physical memory. There is little room left for new applications, which may lead to slower performance.", report.memory.usage_percent),
            severity: Severity::Warning,
            category: DiagnosisCategory::Memory,
            recommendation: "Review running processes and close background applications that are consuming significant RAM.",
            auto_fixable: true,
        });
    }

    // 4. Swap Usage Check (for SSD longevity and memory pressure)
    if report.memory.swap_used_bytes > 2_000_000_000 { // > 2 GB swap
        findings.push(DiagnosisFinding {
            id: "high_swap_usage".to_string(),
            title: "High Swap Usage Detected".to_string(),
            description: format!("Your system is using {:.2} GB of virtual swap memory on your disk. Frequent reading/writing of swap memory can slow down systems and wear down SSDs.", report.memory.swap_used_bytes as f64 / 1_000_000_000.0),
            severity: Severity::Warning,
            category: DiagnosisCategory::Memory,
            recommendation: "Free up physical memory to reduce swap utilization.",
            auto_fixable: true,
        });
    }

    // 5. CPU High Usage Check
    if report.cpu.global_usage_percent > 80.0 {
        findings.push(DiagnosisFinding {
            id: "cpu_usage_critical".to_string(),
            title: "CPU Load Critically High".to_string(),
            description: format!("Overall CPU usage is at {:.1}%. This indicates that the processor is heavily loaded, which will cause lag and heating issues.", report.cpu.global_usage_percent),
            severity: Severity::Critical,
            category: DiagnosisCategory::Cpu,
            recommendation: "Identify and close the processes consuming the most CPU cycles.",
            auto_fixable: false,
        });
    }

    // 6. Excessive Startup / Login Items Check
    let startup_count = report.startup_items.len();
    if startup_count > 12 {
        findings.push(DiagnosisFinding {
            id: "startup_items_excessive".to_string(),
            title: "Too Many Startup Items".to_string(),
            description: format!("There are {} background agents or login items configured to start when your system boots. This significantly slows down system startup and wastes background CPU/RAM.", startup_count),
            severity: Severity::Warning,
            category: DiagnosisCategory::Startup,
            recommendation: "Disable unnecessary launch agents and login items to speed up boot times.",
            auto_fixable: true,
        });
    }

    findings
}
