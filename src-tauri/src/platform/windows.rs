#![cfg(target_os = "windows")]

use crate::models::system::StartupItem;
use std::path::PathBuf;
use std::process::Command;

/// Detect if the primary disk is an SSD using PowerShell.
pub fn is_ssd() -> bool {
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "Get-PhysicalDisk | Where-Object { $_.DeviceID -eq '0' } | Select-Object -ExpandProperty MediaType",
        ])
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout);
            text.trim().eq_ignore_ascii_case("SSD")
        }
        Err(_) => false,
    }
}

/// Get Windows version using PowerShell.
pub fn os_version() -> String {
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "[System.Environment]::OSVersion.VersionString",
        ])
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if text.is_empty() {
                "Windows (Unknown Version)".to_string()
            } else {
                text
            }
        }
        Err(_) => "Windows (Unknown Version)".to_string(),
    }
}

/// Get Windows hardware model.
pub fn hardware_model() -> String {
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "(Get-CimInstance -ClassName Win32_ComputerSystem).Model",
        ])
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if text.is_empty() {
                "Unknown PC".to_string()
            } else {
                text
            }
        }
        Err(_) => "Unknown PC".to_string(),
    }
}

/// Get memory pressure (commit charge percentage on Windows).
pub fn memory_pressure() -> String {
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "$os = Get-CimInstance Win32_OperatingSystem; [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize * 100, 1)",
        ])
        .output();

    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if let Ok(pct) = text.parse::<f64>() {
                if pct > 90.0 {
                    "Critical".to_string()
                } else if pct > 75.0 {
                    "Warning".to_string()
                } else {
                    "Normal".to_string()
                }
            } else {
                "Normal".to_string()
            }
        }
        Err(_) => "Unknown".to_string(),
    }
}

/// List Windows startup items using the registry.
pub fn startup_items() -> Vec<StartupItem> {
    let mut items = Vec::new();

    // Read from registry using the winreg crate
    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;

        let registry_paths = [
            (
                HKEY_CURRENT_USER,
                r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
                "HKCU Run",
            ),
            (
                HKEY_LOCAL_MACHINE,
                r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
                "HKLM Run",
            ),
            (
                HKEY_CURRENT_USER,
                r"SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce",
                "HKCU RunOnce",
            ),
        ];

        for (hkey, subkey, source) in &registry_paths {
            if let Ok(key) = RegKey::predef(*hkey).open_subkey(subkey) {
                for value in key.enum_values().flatten() {
                    let (name, reg_value) = value;
                    let path = format!("{}", reg_value);
                    items.push(StartupItem {
                        name,
                        path,
                        enabled: true,
                        source: source.to_string(),
                    });
                }
            }
        }
    }

    // Also check the Startup folder
    if let Some(startup_dir) = dirs::data_dir() {
        let startup_folder = startup_dir
            .parent()
            .unwrap_or(&startup_dir)
            .join(r"Microsoft\Windows\Start Menu\Programs\Startup");

        if startup_folder.exists() {
            if let Ok(entries) = std::fs::read_dir(&startup_folder) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    let name = path
                        .file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("Unknown")
                        .to_string();
                    items.push(StartupItem {
                        name,
                        path: path.to_string_lossy().to_string(),
                        enabled: true,
                        source: "Startup Folder".to_string(),
                    });
                }
            }
        }
    }

    items
}

/// Windows cache directories to scan.
pub fn cache_directories() -> Vec<PathBuf> {
    let mut dirs_list = Vec::new();

    if let Some(local_data) = dirs::data_local_dir() {
        let temp = local_data.join("Temp");
        if temp.exists() {
            dirs_list.push(temp);
        }
    }

    if let Some(cache) = dirs::cache_dir() {
        if cache.exists() {
            dirs_list.push(cache);
        }
    }

    dirs_list
}

/// Windows log directories to scan.
pub fn log_directories() -> Vec<PathBuf> {
    let mut dirs_list = Vec::new();

    // Windows logs in %LOCALAPPDATA%\CrashDumps
    if let Some(local_data) = dirs::data_local_dir() {
        let crash_dumps = local_data.join("CrashDumps");
        if crash_dumps.exists() {
            dirs_list.push(crash_dumps);
        }
    }

    // Windows event logs (read-only, just for scanning size)
    let win_logs = PathBuf::from(r"C:\Windows\Logs");
    if win_logs.exists() {
        dirs_list.push(win_logs);
    }

    dirs_list
}

/// Windows temp directories.
pub fn temp_directories() -> Vec<PathBuf> {
    let mut dirs_list = vec![std::env::temp_dir()];

    let win_temp = PathBuf::from(r"C:\Windows\Temp");
    if win_temp.exists() {
        dirs_list.push(win_temp);
    }

    dirs_list.sort();
    dirs_list.dedup();
    dirs_list
}

/// Windows browser cache directories.
pub fn browser_cache_directories() -> Vec<PathBuf> {
    let mut dirs_list = Vec::new();

    if let Some(local_data) = dirs::data_local_dir() {
        // Chrome
        let chrome = local_data.join(r"Google\Chrome\User Data\Default\Cache");
        if chrome.exists() {
            dirs_list.push(chrome);
        }

        // Edge
        let edge = local_data.join(r"Microsoft\Edge\User Data\Default\Cache");
        if edge.exists() {
            dirs_list.push(edge);
        }

        // Firefox
        let firefox_profiles = local_data.join(r"Mozilla\Firefox\Profiles");
        if firefox_profiles.exists() {
            if let Ok(entries) = std::fs::read_dir(&firefox_profiles) {
                for entry in entries.flatten() {
                    let cache = entry.path().join("cache2");
                    if cache.exists() {
                        dirs_list.push(cache);
                    }
                }
            }
        }

        // Brave
        let brave = local_data.join(r"BraveSoftware\Brave-Browser\User Data\Default\Cache");
        if brave.exists() {
            dirs_list.push(brave);
        }
    }

    dirs_list
}
