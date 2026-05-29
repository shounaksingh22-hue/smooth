#![cfg(target_os = "macos")]

use crate::models::system::StartupItem;
use std::path::PathBuf;
use std::process::Command;

/// Detect if the primary disk is an SSD using `diskutil info disk0`.
pub fn is_ssd() -> bool {
    let output = Command::new("diskutil")
        .args(["info", "disk0"])
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout);
            // Look for "Solid State" in the output
            text.lines().any(|line| {
                let lower = line.to_lowercase();
                (lower.contains("solid state") && lower.contains("yes"))
                    || (lower.contains("medium type") && lower.contains("ssd"))
                    || (lower.contains("device / media name") && lower.contains("ssd"))
            })
        }
        Err(_) => false,
    }
}

/// Get macOS version using `sw_vers`.
pub fn os_version() -> String {
    let product_name = Command::new("sw_vers")
        .arg("-productName")
        .output()
        .ok()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| "macOS".to_string());

    let product_version = Command::new("sw_vers")
        .arg("-productVersion")
        .output()
        .ok()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| "Unknown".to_string());

    let build_version = Command::new("sw_vers")
        .arg("-buildVersion")
        .output()
        .ok()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| "".to_string());

    if build_version.is_empty() {
        format!("{} {}", product_name, product_version)
    } else {
        format!("{} {} ({})", product_name, product_version, build_version)
    }
}

/// Get hardware model using `sysctl -n hw.model`.
pub fn hardware_model() -> String {
    Command::new("sysctl")
        .args(["-n", "hw.model"])
        .output()
        .ok()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| "Unknown Mac".to_string())
}

/// Get memory pressure level using `memory_pressure -Q`.
pub fn memory_pressure() -> String {
    let output = Command::new("memory_pressure")
        .arg("-Q")
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout).to_string()
                + &String::from_utf8_lossy(&out.stderr);
            let lower = text.to_lowercase();
            if lower.contains("critical") {
                "Critical".to_string()
            } else if lower.contains("warn") {
                "Warning".to_string()
            } else if lower.contains("normal") {
                "Normal".to_string()
            } else {
                // Try parsing "The system has N% memory available"
                // or any percentage mention
                "Normal".to_string()
            }
        }
        Err(_) => "Unknown".to_string(),
    }
}

/// List macOS startup / login items from LaunchAgents.
pub fn startup_items() -> Vec<StartupItem> {
    let mut items = Vec::new();

    // User LaunchAgents
    if let Some(home) = dirs::home_dir() {
        let user_agents = home.join("Library/LaunchAgents");
        if user_agents.exists() {
            if let Ok(entries) = std::fs::read_dir(&user_agents) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.extension().and_then(|e| e.to_str()) == Some("plist") {
                        let name = path
                            .file_stem()
                            .and_then(|s| s.to_str())
                            .unwrap_or("Unknown")
                            .to_string();
                        let enabled = is_launch_agent_enabled(&path);
                        items.push(StartupItem {
                            name,
                            path: path.to_string_lossy().to_string(),
                            enabled,
                            impact: "Medium".to_string(),
                            category: "LaunchAgent".to_string(),
                        });
                    }
                }
            }
        }
    }

    // System LaunchAgents (read-only, for display)
    let system_agents = PathBuf::from("/Library/LaunchAgents");
    if system_agents.exists() {
        if let Ok(entries) = std::fs::read_dir(&system_agents) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|e| e.to_str()) == Some("plist") {
                    let name = path
                        .file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("Unknown")
                        .to_string();
                    let enabled = is_launch_agent_enabled(&path);
                    items.push(StartupItem {
                        name,
                        path: path.to_string_lossy().to_string(),
                        enabled,
                        impact: "Low".to_string(),
                        category: "LaunchAgent".to_string(),
                    });
                }
            }
        }
    }

    items
}

/// Check if a LaunchAgent plist has Disabled=true.
fn is_launch_agent_enabled(path: &std::path::Path) -> bool {
    // Read the plist and look for <key>Disabled</key><true/>
    match std::fs::read_to_string(path) {
        Ok(contents) => !contents.contains("<key>Disabled</key>")
            || !contents.contains("<true/>"),
        Err(_) => true, // Assume enabled if we can't read
    }
}

/// macOS cache directories to scan.
pub fn cache_directories() -> Vec<PathBuf> {
    let mut dirs_list = Vec::new();

    if let Some(home) = dirs::home_dir() {
        dirs_list.push(home.join("Library/Caches"));
    }

    // System-level caches that are user-readable
    let system_caches = PathBuf::from("/Library/Caches");
    if system_caches.exists() {
        dirs_list.push(system_caches);
    }

    dirs_list
}

/// macOS log directories to scan.
pub fn log_directories() -> Vec<PathBuf> {
    let mut dirs_list = Vec::new();

    if let Some(home) = dirs::home_dir() {
        dirs_list.push(home.join("Library/Logs"));
    }

    let var_log = PathBuf::from("/var/log");
    if var_log.exists() {
        dirs_list.push(var_log);
    }

    dirs_list
}

/// macOS temp directories.
pub fn temp_directories() -> Vec<PathBuf> {
    let mut dirs_list = vec![std::env::temp_dir()];

    let private_tmp = PathBuf::from("/private/tmp");
    if private_tmp.exists() {
        dirs_list.push(private_tmp);
    }

    // Deduplicate (std::env::temp_dir() may point to /private/tmp variants)
    dirs_list.sort();
    dirs_list.dedup();

    dirs_list
}

/// macOS browser cache directories.
pub fn browser_cache_directories() -> Vec<PathBuf> {
    let mut dirs_list = Vec::new();

    if let Some(home) = dirs::home_dir() {
        // Safari
        let safari_cache = home.join("Library/Caches/com.apple.Safari");
        if safari_cache.exists() {
            dirs_list.push(safari_cache);
        }

        // Chrome
        let chrome_cache =
            home.join("Library/Caches/Google/Chrome/Default/Cache");
        if chrome_cache.exists() {
            dirs_list.push(chrome_cache);
        }
        let chrome_cache2 =
            home.join("Library/Caches/Google/Chrome");
        if chrome_cache2.exists() && !dirs_list.iter().any(|d| d.starts_with(&chrome_cache2)) {
            dirs_list.push(chrome_cache2);
        }

        // Firefox
        let firefox_caches = home.join("Library/Caches/Firefox");
        if firefox_caches.exists() {
            dirs_list.push(firefox_caches);
        }

        // Microsoft Edge
        let edge_cache = home.join("Library/Caches/Microsoft Edge");
        if edge_cache.exists() {
            dirs_list.push(edge_cache);
        }

        // Arc
        let arc_cache = home.join("Library/Caches/company.thebrowser.Browser");
        if arc_cache.exists() {
            dirs_list.push(arc_cache);
        }

        // Brave
        let brave_cache = home.join("Library/Caches/BraveSoftware/Brave-Browser");
        if brave_cache.exists() {
            dirs_list.push(brave_cache);
        }
    }

    dirs_list
}
