use crate::models::cleanup::{CleanupRequest, CleanupResult, CleanupScanResult};
use crate::cleaner::actions::scan_cleanable_items;
use crate::cleaner::executor::execute_cleanup_batch;
use crate::logger::ActionLogger;
use crate::models::system::StartupItem;
use crate::platform::Platform;
use tauri::State;

#[tauri::command]
pub async fn scan_cleanup() -> Result<CleanupScanResult, String> {
    let result = tokio::task::spawn_blocking(move || {
        scan_cleanable_items()
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub async fn execute_cleanup(
    req: CleanupRequest,
    logger: State<'_, ActionLogger>,
) -> Result<CleanupResult, String> {
    let logger_clone = logger.inner().clone();
    let result = tokio::task::spawn_blocking(move || {
        execute_cleanup_batch(req, &logger_clone)
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub fn get_action_log(logger: State<'_, ActionLogger>) -> Result<String, String> {
    logger.read_log()
}

#[tauri::command]
pub fn disable_startup_item(item: StartupItem) -> Result<(), String> {
    // Platform-specific disable action
    #[cfg(target_os = "macos")]
    {
        // For launch agent plist: we write Disabled=true
        let path = std::path::Path::new(&item.path);
        if path.exists() {
            if let Ok(mut contents) = std::fs::read_to_string(path) {
                if !contents.contains("<key>Disabled</key>") {
                    // Inject key into plist
                    contents = contents.replace(
                        "<dict>",
                        "<dict>\n\t<key>Disabled</key>\n\t<true/>"
                    );
                    let _ = std::fs::write(path, contents);
                }
            }
        }
        Ok(())
    }
    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;

        // Check HKCU
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        if let Ok(key) = hkcu.open_subkey_with_flags(
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
            KEY_WRITE,
        ) {
            if key.delete_value(&item.name).is_ok() {
                return Ok(());
            }
        }

        // Check HKLM (usually needs admin, but let's try)
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        if let Ok(key) = hklm.open_subkey_with_flags(
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
            KEY_WRITE,
        ) {
            if key.delete_value(&item.name).is_ok() {
                return Ok(());
            }
        }

        // Startup folder file
        let path = std::path::Path::new(&item.path);
        if path.exists() {
            let _ = std::fs::remove_file(path);
        }

        Ok(())
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Ok(())
    }
}
