use crate::models::system::SystemReport;
use crate::models::diagnosis::DiagnosisReport;
use crate::diagnoser::run_diagnosis;

#[tauri::command]
pub fn execute_diagnosis(report: SystemReport) -> Result<DiagnosisReport, String> {
    Ok(run_diagnosis(&report))
}
