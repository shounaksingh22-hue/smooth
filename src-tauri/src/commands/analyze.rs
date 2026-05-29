use crate::models::system::SystemReport;
use crate::analyzer::run_full_analysis;

#[tauri::command]
pub async fn analyze_system() -> Result<SystemReport, String> {
    // Run CPU, Memory, Disk, Startup analysis.
    // Use tokio task spawning to run CPU in background thread to avoid blocking main thread.
    let report = tokio::task::spawn_blocking(move || {
        run_full_analysis()
    })
    .await
    .map_err(|e| e.to_string())?;

    Ok(report)
}
