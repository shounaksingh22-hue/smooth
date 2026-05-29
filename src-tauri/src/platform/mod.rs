#[cfg(target_os = "macos")]
pub mod mac;

#[cfg(target_os = "windows")]
pub mod windows;

use crate::models::system::StartupItem;

/// Cross-platform interface for OS-specific operations.
pub struct Platform;

impl Platform {
    /// Detect whether the primary disk is an SSD.
    pub fn is_ssd() -> bool {
        #[cfg(target_os = "macos")]
        {
            mac::is_ssd()
        }
        #[cfg(target_os = "windows")]
        {
            windows::is_ssd()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            false
        }
    }

    /// Get the OS version string.
    pub fn os_version() -> String {
        #[cfg(target_os = "macos")]
        {
            mac::os_version()
        }
        #[cfg(target_os = "windows")]
        {
            windows::os_version()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            "Unknown".to_string()
        }
    }

    /// Get the hardware model identifier.
    pub fn hardware_model() -> String {
        #[cfg(target_os = "macos")]
        {
            mac::hardware_model()
        }
        #[cfg(target_os = "windows")]
        {
            windows::hardware_model()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            "Unknown".to_string()
        }
    }

    /// Get the memory pressure level.
    pub fn memory_pressure() -> String {
        #[cfg(target_os = "macos")]
        {
            mac::memory_pressure()
        }
        #[cfg(target_os = "windows")]
        {
            windows::memory_pressure()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            "Unknown".to_string()
        }
    }

    /// List startup / login items.
    pub fn startup_items() -> Vec<StartupItem> {
        #[cfg(target_os = "macos")]
        {
            mac::startup_items()
        }
        #[cfg(target_os = "windows")]
        {
            windows::startup_items()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            Vec::new()
        }
    }

    /// Get cache directories to scan for cleanup.
    pub fn cache_directories() -> Vec<std::path::PathBuf> {
        #[cfg(target_os = "macos")]
        {
            mac::cache_directories()
        }
        #[cfg(target_os = "windows")]
        {
            windows::cache_directories()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            Vec::new()
        }
    }

    /// Get log directories to scan for cleanup.
    pub fn log_directories() -> Vec<std::path::PathBuf> {
        #[cfg(target_os = "macos")]
        {
            mac::log_directories()
        }
        #[cfg(target_os = "windows")]
        {
            windows::log_directories()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            Vec::new()
        }
    }

    /// Get temp directories to scan for cleanup.
    pub fn temp_directories() -> Vec<std::path::PathBuf> {
        #[cfg(target_os = "macos")]
        {
            mac::temp_directories()
        }
        #[cfg(target_os = "windows")]
        {
            windows::temp_directories()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            Vec::new()
        }
    }

    /// Get browser cache directories.
    pub fn browser_cache_directories() -> Vec<std::path::PathBuf> {
        #[cfg(target_os = "macos")]
        {
            mac::browser_cache_directories()
        }
        #[cfg(target_os = "windows")]
        {
            windows::browser_cache_directories()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            Vec::new()
        }
    }
}
