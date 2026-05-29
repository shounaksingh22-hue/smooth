use crate::models::system::SystemReport;
use crate::models::diagnosis::Suggestion;

pub fn run_rules(report: &SystemReport) -> Vec<Suggestion> {
    let mut findings = Vec::new();

    // 1. HDD Check
    if report.hardware.disk_type == "HDD" {
        findings.push(Suggestion {
            id: "hdd_detected".to_string(),
            title: "Mechanical HDD Detected".to_string(),
            description: "Your system drive is a mechanical hard disk drive (HDD). Modern OSs are optimized for SSDs.".to_string(),
            category: "storage".to_string(),
            risk_level: "high".to_string(),
            estimated_gain: "Massive speedup".to_string(),
            estimated_gain_bytes: None,
            details: "An HDD causes slow app launches, long boot times, and lag during multitasking.".to_string(),
            dry_run_preview: "N/A - Requires hardware upgrade".to_string(),
            enabled: false,
            impact_score: 95,
        });
    }

    // 2. Storage Capacity Check
    if report.storage.total_bytes > 0 {
        let free_percent = (report.storage.available_bytes as f64 / report.storage.total_bytes as f64) * 100.0;
        if free_percent < 10.0 {
            findings.push(Suggestion {
                id: "storage_critical".to_string(),
                title: "Disk Space Critically Low".to_string(),
                description: format!("Your system drive has only {:.1}% free space.", free_percent),
                category: "storage".to_string(),
                risk_level: "high".to_string(),
                estimated_gain: "Reclaim Space".to_string(),
                estimated_gain_bytes: None,
                details: "A full disk slows down the OS, prevents writing caches, and blocks updates.".to_string(),
                dry_run_preview: "Run a storage cleanup immediately".to_string(),
                enabled: true,
                impact_score: 90,
            });
        } else if free_percent < 20.0 {
            findings.push(Suggestion {
                id: "storage_warning".to_string(),
                title: "Disk Space Running Low".to_string(),
                description: format!("Your system drive has {:.1}% free space remaining.", free_percent),
                category: "storage".to_string(),
                risk_level: "medium".to_string(),
                estimated_gain: "Reclaim Space".to_string(),
                estimated_gain_bytes: None,
                details: "Performance may degrade if free space drops below 10%.".to_string(),
                dry_run_preview: "Clean up caches and Recycle Bin".to_string(),
                enabled: true,
                impact_score: 60,
            });
        }
    }

    // 3. Memory Pressure / Usage Check
    let mem_press = report.memory.memory_pressure.to_lowercase();
    let mem_usage_percent = if report.memory.total_bytes > 0 {
        (report.memory.used_bytes as f64 / report.memory.total_bytes as f64) * 100.0
    } else {
        0.0
    };

    if mem_press.contains("critical") {
        findings.push(Suggestion {
            id: "memory_pressure_critical".to_string(),
            title: "Memory Pressure is Critical".to_string(),
            description: "Your OS is struggling to allocate RAM for apps.".to_string(),
            category: "memory".to_string(),
            risk_level: "high".to_string(),
            estimated_gain: "Improve app responsiveness".to_string(),
            estimated_gain_bytes: None,
            details: "Causes frequent disk swapping and severe application lag.".to_string(),
            dry_run_preview: "Close high-memory applications and clear inactive memory".to_string(),
            enabled: true,
            impact_score: 85,
        });
    } else if mem_press.contains("warning") || mem_usage_percent > 85.0 {
        findings.push(Suggestion {
            id: "memory_pressure_warning".to_string(),
            title: "High Memory Usage".to_string(),
            description: format!("Your system is using {:.1}% of its physical memory.", mem_usage_percent),
            category: "memory".to_string(),
            risk_level: "medium".to_string(),
            estimated_gain: "Reduce lag".to_string(),
            estimated_gain_bytes: None,
            details: "Little room left for new apps, which may lead to slower performance.".to_string(),
            dry_run_preview: "Review and close background applications".to_string(),
            enabled: true,
            impact_score: 55,
        });
    }

    // 4. Swap Usage Check
    if report.memory.swap_used_bytes > 2_000_000_000 {
        findings.push(Suggestion {
            id: "high_swap_usage".to_string(),
            title: "High Swap Usage Detected".to_string(),
            description: format!("System is using {:.2} GB of virtual swap.", report.memory.swap_used_bytes as f64 / 1_000_000_000.0),
            category: "memory".to_string(),
            risk_level: "medium".to_string(),
            estimated_gain: "Preserve SSD longevity".to_string(),
            estimated_gain_bytes: None,
            details: "Frequent reading/writing of swap memory can slow down systems and wear down SSDs.".to_string(),
            dry_run_preview: "Free up physical memory to reduce swap utilization".to_string(),
            enabled: true,
            impact_score: 50,
        });
    }

    // 5. CPU High Usage Check
    if report.cpu.overall_usage_percent > 80.0 {
        findings.push(Suggestion {
            id: "cpu_usage_critical".to_string(),
            title: "CPU Load Critically High".to_string(),
            description: format!("Overall CPU usage is at {:.1}%.", report.cpu.overall_usage_percent),
            category: "cpu".to_string(),
            risk_level: "high".to_string(),
            estimated_gain: "Reduce heat and lag".to_string(),
            estimated_gain_bytes: None,
            details: "Processor is heavily loaded, causing lag and heating issues.".to_string(),
            dry_run_preview: "Identify and close CPU-heavy processes".to_string(),
            enabled: false,
            impact_score: 90,
        });
    }

    // 6. Excessive Startup / Login Items Check
    let startup_count = report.startup_items.len();
    if startup_count > 12 {
        findings.push(Suggestion {
            id: "startup_items_excessive".to_string(),
            title: "Too Many Startup Items".to_string(),
            description: format!("{} background agents configured to start at boot.", startup_count),
            category: "startup".to_string(),
            risk_level: "low".to_string(),
            estimated_gain: "Faster Boot Times".to_string(),
            estimated_gain_bytes: None,
            details: "Significantly slows down system startup and wastes background CPU/RAM.".to_string(),
            dry_run_preview: "Will disable unnecessary launch agents and login items".to_string(),
            enabled: true,
            impact_score: 40,
        });
    }

    findings
}
