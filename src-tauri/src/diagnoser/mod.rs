pub mod rules;

use crate::models::system::SystemReport;
use crate::models::diagnosis::DiagnosisReport;
use chrono::Local;

pub fn run_diagnosis(report: &SystemReport) -> DiagnosisReport {
    let findings = rules::run_rules(report);
    let health_score = DiagnosisReport::calculate_score(&findings);
    let summary = DiagnosisReport::generate_summary(&findings, health_score);
    let generated_at = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    DiagnosisReport {
        findings,
        health_score,
        summary,
        generated_at,
    }
}
