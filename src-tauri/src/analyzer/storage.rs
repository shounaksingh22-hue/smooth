use crate::models::system::{StorageInfo, DiskInfo, CacheEntry};
use crate::platform::Platform;
use sysinfo::Disks;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use bytesize::ByteSize;

pub fn analyze() -> StorageInfo {
    // 1. Scan Disks
    let disks_list = Disks::new_with_refreshed_list();
    let mut disks = Vec::new();
    let mut total_capacity_bytes = 0;
    let mut total_available_bytes = 0;
    let mut total_used_bytes = 0;

    for disk in &disks_list {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total.saturating_sub(available);
        let usage_percent = if total > 0 {
            (used as f64 / total as f64) * 100.0
        } else {
            0.0
        };

        total_capacity_bytes += total;
        total_available_bytes += available;
        total_used_bytes += used;

        disks.push(DiskInfo {
            name: disk.name().to_string_lossy().to_string(),
            mount_point: disk.mount_point().to_string_lossy().to_string(),
            file_system: disk.file_system().to_string_lossy().to_string(),
            total_bytes: total,
            available_bytes: available,
            used_bytes: used,
            usage_percent,
            is_removable: disk.is_removable(),
        });
    }

    let usage_percent = if total_capacity_bytes > 0 {
        (total_used_bytes as f64 / total_capacity_bytes as f64) * 100.0
    } else {
        0.0
    };

    let is_ssd = Platform::is_ssd();

    StorageInfo {
        disks,
        total_capacity_bytes,
        total_available_bytes,
        total_used_bytes,
        usage_percent,
        is_ssd,
    }
}

/// Helper to get directory size recursively (in bytes)
pub fn get_dir_size<P: AsRef<Path>>(path: P) -> (u64, usize) {
    let mut size = 0;
    let mut count = 0;
    
    // Validate path to avoid entering system-critical or endless symlink loops
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

/// Scan caches, logs, temp folders, dev junk
pub fn get_cache_report() -> Vec<CacheEntry> {
    let mut entries = Vec::new();

    // 1. User/System Caches
    let mut cache_size = 0;
    let mut cache_count = 0;
    for dir in Platform::cache_directories() {
        let (s, c) = get_dir_size(dir);
        cache_size += s;
        cache_count += c;
    }
    entries.push(CacheEntry {
        name: "Application Caches".to_string(),
        category: "Caches".to_string(),
        bytes: cache_size,
        display_size: ByteSize(cache_size).to_string(),
        count: cache_count,
    });

    // 2. Logs
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

    // 3. Temp Files
    let mut temp_size = 0;
    let mut temp_count = 0;
    for dir in Platform::temp_directories() {
        let (s, c) = get_dir_size(dir);
        temp_size += s;
        temp_count += c;
    }
    entries.push(CacheEntry {
        name: "Temporary Files".to_string(),
        category: "Temp".to_string(),
        bytes: temp_size,
        display_size: ByteSize(temp_size).to_string(),
        count: temp_count,
    });

    // 4. Browser Caches
    let mut browser_size = 0;
    let mut browser_count = 0;
    for dir in Platform::browser_cache_directories() {
        let (s, c) = get_dir_size(dir);
        browser_size += s;
        browser_count += c;
    }
    entries.push(CacheEntry {
        name: "Browser Caches".to_string(),
        category: "BrowserCaches".to_string(),
        bytes: browser_size,
        display_size: ByteSize(browser_size).to_string(),
        count: browser_count,
    });

    // 5. Trash / Recycle Bin
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
