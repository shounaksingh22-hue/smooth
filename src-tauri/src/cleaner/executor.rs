use crate::models::cleanup::{CleanupCategory, CleanupRequest, CleanupResult};
use crate::platform::Platform;
use crate::analyzer::storage::get_dir_size;
use crate::logger::ActionLogger;
use chrono::Local;
use bytesize::ByteSize;
use std::path::{Path, PathBuf};
use tauri::State;

pub fn execute_cleanup_batch(
    req: CleanupRequest,
    logger: &ActionLogger,
) -> CleanupResult {
    let mut categories_cleaned = Vec::new();
    let mut bytes_freed = 0;
    let mut files_removed = 0;
    let mut errors = Vec::new();

    for cat in &req.categories {
        // Downloads is manual review only, never clean automatically
        if *cat == CleanupCategory::Downloads {
            errors.push("Downloads folder cannot be cleaned automatically. Please review manually.".to_string());
            continue;
        }

        let dirs_to_clean = match cat {
            CleanupCategory::UserCache | CleanupCategory::SystemCache => Platform::cache_directories(),
            CleanupCategory::BrowserCache => Platform::browser_cache_directories(),
            CleanupCategory::Logs => Platform::log_directories(),
            CleanupCategory::TempFiles => Platform::temp_directories(),
            CleanupCategory::Trash => get_trash_paths(),
            _ => Vec::new(),
        };

        let mut cat_bytes_freed = 0;
        let mut cat_files_removed = 0;

        for dir in dirs_to_clean {
            if !is_path_safe_to_clean(&dir) {
                let err_msg = format!("Blocked cleaning unsafe path: {:?}", dir);
                logger.log(&format!("{:?}", cat), &dir.to_string_lossy(), "skip", "BLOCKED - Unsafe Path");
                errors.push(err_msg);
                continue;
            }

            if !dir.exists() {
                continue;
            }

            // We clean the CONTENTS of the directory, not the directory itself.
            if let Ok(entries) = std::fs::read_dir(&dir) {
                for entry in entries.flatten() {
                    let entry_path = entry.path();
                    let (size, count) = get_dir_size(&entry_path);
                    
                    let method = if req.use_trash { "move to trash" } else { "permanent delete" };
                    let action_name = format!("{:?}", cat);

                    let clean_success = if req.use_trash {
                        // Move to Trash
                        match trash::delete(&entry_path) {
                            Ok(_) => true,
                            Err(e) => {
                                // Fallback to permanent delete if trash fails
                                match delete_path_permanently(&entry_path) {
                                    Ok(_) => true,
                                    Err(_) => {
                                        let err_msg = format!("Failed to move to Trash or delete: {:?}. Error: {:?}", entry_path, e);
                                        errors.push(err_msg);
                                        false
                                    }
                                }
                            }
                        }
                    } else {
                        // Permanent Delete
                        match delete_path_permanently(&entry_path) {
                            Ok(_) => true,
                            Err(e) => {
                                let err_msg = format!("Failed to delete: {:?}. Error: {:?}", entry_path, e);
                                errors.push(err_msg);
                                false
                            }
                        }
                    };

                    if clean_success {
                        cat_bytes_freed += size;
                        cat_files_removed += count.max(1);
                        logger.log(
                            &action_name,
                            &entry_path.to_string_lossy(),
                            method,
                            &format!("SUCCESS - Freed {}", ByteSize(size)),
                        );
                    } else {
                        logger.log(
                            &action_name,
                            &entry_path.to_string_lossy(),
                            method,
                            "FAILED",
                        );
                    }
                }
            }
        }

        bytes_freed += cat_bytes_freed;
        files_removed += cat_files_removed;
        categories_cleaned.push(cat.clone());
    }

    CleanupResult {
        categories_cleaned,
        bytes_freed,
        bytes_freed_display: ByteSize(bytes_freed).to_string(),
        files_removed,
        errors,
        completed_at: Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
    }
}

fn delete_path_permanently(path: &Path) -> std::io::Result<()> {
    if path.is_file() || path.is_symlink() {
        std::fs::remove_file(path)
    } else if path.is_dir() {
        std::fs::remove_dir_all(path)
    } else {
        Ok(())
    }
}

fn is_path_safe_to_clean(path: &Path) -> bool {
    let path_str = path.to_string_lossy().to_lowercase();
    
    // Hard check for user profile root or core documents folders
    if path_str.contains("documents")
        || path_str.contains("desktop")
        || path_str.contains("pictures")
        || path_str.contains("movies")
        || path_str.contains("music")
        || path_str.contains("onedrive")
        || path_str.contains("dropbox")
        || path_str.contains("google drive")
        || path_str.contains("icloud")
    {
        return false;
    }

    // Never touch system roots or profiles
    if path_str == "c:\\windows"
        || path_str == "c:\\windows\\system32"
        || path_str == "c:\\users"
        || path_str == "/system"
        || path_str == "/usr"
        || path_str == "/var"
    {
        return false;
    }

    // Path must contain cache, log, temp, or recycle bin / trash directories to be allowed
    path_str.contains("cache")
        || path_str.contains("log")
        || path_str.contains("temp")
        || path_str.contains("recycle.bin")
        || path_str.contains(".trash")
        || path_str.ends_with("tmp")
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
