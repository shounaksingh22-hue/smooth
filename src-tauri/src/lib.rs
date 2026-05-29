pub mod models;
pub mod platform;
pub mod analyzer;
pub mod diagnoser;
pub mod cleaner;
pub mod commands;
pub mod logger;

use crate::commands::analyze::analyze_system;
use crate::commands::diagnose::execute_diagnosis;
use crate::commands::cleanup::{scan_cleanup, execute_cleanup, get_action_log, disable_startup_item};
use crate::logger::ActionLogger;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let local_data_dir = app.path().app_local_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("./data"));
            app.manage(ActionLogger::new(local_data_dir));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            analyze_system,
            execute_diagnosis,
            scan_cleanup,
            execute_cleanup,
            get_action_log,
            disable_startup_item
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
