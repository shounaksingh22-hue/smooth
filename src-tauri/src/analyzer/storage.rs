use crate::models::system::{StorageInfo, StorageBreakdown, CacheEntry};
use crate::platform::Platform;
use sysinfo::Disks;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use bytesize::ByteSize;

pub fn analyze() -> StorageInfo {
    let disks_list = Disks::new_with_refreshed_list();
    
    // Find the primary system drive (mounted at "/" on Mac/Unix, or containing "C:" on Windows)
    let system_disk = disks_list.iter().find(|disk| {
        let mp = disk.mount_point().to_string_lossy().to_lowercase();
        mp == "/" || mp == "c:\\" || mp.starts_with("c:")
    }).or_else(|| disks_list.first()); // fallback to first disk

    let (total_bytes, available_bytes, used_bytes, mount_point, file_system) = if let Some(disk) = system_disk {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total.saturating_sub(available);
        (
            total,
            available,
            used,
            disk.mount_point().to_string_lossy().to_string(),
            disk.file_system().to_string_lossy().to_string(),
        )
    } else {
        (0, 0, 0, "/".to_string(), "APFS".to_string())
    };

    // Calculate Storage Breakdown
    // 1. Caches (actual scan - usually fast)
    let mut caches_size = 0;
    for dir in Platform::cache_directories() {
        let (s, _) = get_dir_size(dir);
        caches_size += s;
    }
    
    // 2. Applications (let's scan /Applications on macOS to get actual size, or estimate)
    let mut apps_size = 0;
    #[cfg(target_os = "macos")]
    {
        let apps_dir = Path::new("/Applications");
        if apps_dir.exists() {
            // Fast shallow scan
            for entry in WalkDir::new(apps_dir)
                .max_depth(2)
                .follow_links(false)
                .into_iter()
                .filter_map(|e| e.ok())
            {
                if let Ok(meta) = entry.metadata() {
                    if meta.is_file() {
                        apps_size += meta.len();
                    }
                }
            }
        }
    }
    if apps_size == 0 {
        apps_size = (used_bytes as f64 * 0.15) as u64; // 15% fallback estimate
    }

    // 3. System Files (estimate: 25% of used space)
    let system_size = (used_bytes as f64 * 0.25) as u64;

    // 4. User Documents (estimate: 20% of used space)
    let docs_size = (used_bytes as f64 * 0.20) as u64;

    // 5. Media (estimate: 25% of used space)
    let media_size = (used_bytes as f64 * 0.25) as u64;

    // 6. Other (remaining used bytes)
    let sum_known = caches_size + apps_size + system_size + docs_size + media_size;
    let other_size = used_bytes.saturating_sub(sum_known);

    let breakdown = StorageBreakdown {
        system: system_size,
        applications: apps_size,
        documents: docs_size,
        media: media_size,
        caches: caches_size,
        other: other_size,
    };

    StorageInfo {
        total_bytes,
        used_bytes,
        available_bytes,
        mount_point,
        file_system,
        breakdown,
    }
}

/// Helper to get directory size recursively (in bytes)
pub fn get_dir_size<P: AsRef<Path>>(path: P) -> (u64, usize) {
    let mut size = 0;
    let mut count = 0;
    
    let path_ref = path.as_ref();
    if !path_ref.exists() {
        return (0, 0);
    }

    for entry in WalkDir::new(path_ref)
        .max_depth(5) // Limit depth to prevent hanging on huge folders
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if let Ok(metadata) = entry.metadata() {
            if metadata.is_file() {
                size += metadata.len();
                count += 1;
            }
        }
    }
    (size, count)
}

/// Scan caches, logs, temp folders, dev junk for scan commands
pub fn get_cache_report() -> Vec<CacheEntry> {
    let mut entries = Vec::new();

    // Caches
    let mut cache_size = 0;
    let mut cache_count = 0;
    for dir in Platform::cache_directories() {
        let (s, c) = get_dir_size(dir);
        cache_size += s;
        cache_count += c;
    }
    entries.push(CacheEntry {
        name: "Application Caches".to_string(),
        category: "UserCache".to_string(),
        bytes: cache_size,
        display_size: ByteSize(cache_size).to_string(),
        count: cache_count,
    });

    // Logs
    let mut logs_size = 0;
    let mut logs_count = 0;
    for dir in Platform::log_directories() {
        let (s, c) = get_dir_size(dir);
        logs_size += s;
        logs_count += c;
    }
    entries.push(CacheEntry {
        name: "Log Files".to_string(),
        category: "Logs".to_string(),
        bytes: logs_size,
        display_size: ByteSize(logs_size).to_string(),
        count: logs_count,
    });

    // Temp Files
    let mut temp_size = 0;
    let mut temp_count = 0;
    for dir in Platform::temp_directories() {
        let (s, c) = get_dir_size(dir);
        temp_size += s;
        temp_count += c;
    }
    entries.push(CacheEntry {
        name: "Temporary Files".to_string(),
        category: "TempFiles".to_string(),
        bytes: temp_size,
        display_size: ByteSize(temp_size).to_string(),
        count: temp_count,
    });

    // Browser Caches
    let mut browser_size = 0;
    let mut browser_count = 0;
    for dir in Platform::browser_cache_directories() {
        let (s, c) = get_dir_size(dir);
        browser_size += s;
        browser_count += c;
    }
    entries.push(CacheEntry {
        name: "Browser Caches".to_string(),
        category: "BrowserCache".to_string(),
        bytes: browser_size,
        display_size: ByteSize(browser_size).to_string(),
        count: browser_count,
    });

    // Trash / Recycle Bin
    let mut trash_size = 0;
    let mut trash_count = 0;
    let trash_paths = get_trash_paths();
    for dir in trash_paths {
        let (s, c) = get_dir_size(dir);
        trash_size += s;
        trash_count += c;
    }
    entries.push(CacheEntry {
        name: "Trash / Recycle Bin".to_string(),
        category: "Trash".to_string(),
        bytes: trash_size,
        display_size: ByteSize(trash_size).to_string(),
        count: trash_count,
    });

    entries
}

fn get_trash_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    #[cfg(target_os = "macos")]
    {
        if let Some(home) = dirs::home_dir() {
            paths.push(home.join(".Trash"));
        }
    }
    #[cfg(target_os = "windows")]
    {
        paths.push(PathBuf::from(r"C:\$Recycle.Bin"));
    }
    paths
}
