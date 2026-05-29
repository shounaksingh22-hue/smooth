use serde::{Deserialize, Serialize};

/// A category of cleanable items.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum CleanupCategory {
    SystemCache,
    UserCache,
    BrowserCache,
    Logs,
    Trash,
    Downloads,
    TempFiles,
}

impl CleanupCategory {
    pub fn display_name(&self) -> &str {
        match self {
            CleanupCategory::SystemCache => "System Caches",
            CleanupCategory::UserCache => "User Application Caches",
            CleanupCategory::BrowserCache => "Browser Caches",
            CleanupCategory::Logs => "System & Application Logs",
            CleanupCategory::Trash => "Trash",
            CleanupCategory::TempFiles => "Temporary Files",
            CleanupCategory::Downloads => "Old Downloads",
        }
    }
}

/// A group of files that can be cleaned.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CleanableItem {
    pub category: CleanupCategory,
    pub display_name: String,
    pub description: String,
    pub paths: Vec<String>,
    pub total_size_bytes: u64,
    pub total_size_display: String,
    pub file_count: usize,
    pub safe_to_clean: bool,
}

/// Scan result showing what can be cleaned.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CleanupScanResult {
    pub items: Vec<CleanableItem>,
    pub total_reclaimable_bytes: u64,
    pub total_reclaimable_display: String,
    pub total_file_count: usize,
    pub scanned_at: String,
}

/// Request from the frontend specifying which categories to clean.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CleanupRequest {
    pub categories: Vec<CleanupCategory>,
    pub use_trash: bool,
}

/// Result of a cleanup operation.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CleanupResult {
    pub categories_cleaned: Vec<CleanupCategory>,
    pub bytes_freed: u64,
    pub bytes_freed_display: String,
    pub files_removed: usize,
    pub errors: Vec<String>,
    pub completed_at: String,
}
