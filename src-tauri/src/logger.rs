use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use chrono::Local;
use std::sync::{Mutex, Arc};

#[derive(Clone)]
pub struct ActionLogger {
    log_file_path: Arc<Mutex<PathBuf>>,
}

impl ActionLogger {
    pub fn new(app_local_data_dir: PathBuf) -> Self {
        // Ensure the directory exists
        if !app_local_data_dir.exists() {
            let _ = std::fs::create_dir_all(&app_local_data_dir);
        }
        let log_file_path = app_local_data_dir.join("action_log.txt");
        Self {
            log_file_path: Arc::new(Mutex::new(log_file_path)),
        }
    }

    pub fn log(&self, action: &str, target: &str, method: &str, result: &str) {
        if let Ok(path) = self.log_file_path.lock() {
            let now = Local::now().format("%Y-%m-%d %H:%M:%S");
            let log_entry = format!(
                "[{}] ACTION: {}\n[{}] TARGET: {}\n[{}] METHOD: {}\n[{}] RESULT: {}\n[{}] ---\n",
                now, action, now, target, now, method, now, result, now
            );

            if let Ok(mut file) = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&*path)
            {
                let _ = file.write_all(log_entry.as_bytes());
            }
        }
    }

    pub fn read_log(&self) -> Result<String, String> {
        if let Ok(path) = self.log_file_path.lock() {
            if !path.exists() {
                return Ok("No actions logged yet.".to_string());
            }
            std::fs::read_to_string(&*path).map_err(|e| e.to_string())
        } else {
            Err("Failed to acquire log lock".to_string())
        }
    }
}
