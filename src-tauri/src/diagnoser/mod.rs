pub mod rules;

use crate::models::system::SystemReport;
use crate::models::diagnosis::DiagnosisResult;

pub fn run_diagnosis(report: &SystemReport) -> DiagnosisResult {
    let start = std::time::Instant::now();
    let suggestions = rules::run_rules(report);
    let overall_health_score = DiagnosisResult::calculate_score(&suggestions);
    let summary = DiagnosisResult::generate_summary(&suggestions, overall_health_score);
    let scan_duration_ms = start.elapsed().as_millis() as u64;

    DiagnosisResult {
        suggestions,
        overall_health_score,
        scan_duration_ms,
        summary,
    }
}
