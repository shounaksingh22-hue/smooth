use crate::models::system::SystemReport;
use crate::models::diagnosis::DiagnosisResult;
use crate::diagnoser::run_diagnosis;

#[tauri::command]
pub fn execute_diagnosis(report: SystemReport) -> Result<DiagnosisResult, String> {
    Ok(run_diagnosis(&report))
}
