use serde::{Deserialize, Serialize};

/// Severity level for a diagnosis finding.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum Severity {
    Info,
    Warning,
    Critical,
}

/// A single diagnosis finding.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiagnosisFinding {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: Severity,
    pub category: DiagnosisCategory,
    pub recommendation: String,
    pub auto_fixable: bool,
}

/// Category of a diagnosis finding.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum DiagnosisCategory {
    Storage,
    Memory,
    Cpu,
    Startup,
    General,
}

/// Full diagnosis report returned to the frontend.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiagnosisReport {
    pub findings: Vec<DiagnosisFinding>,
    pub health_score: u8,
    pub summary: String,
    pub generated_at: String,
}

impl DiagnosisReport {
    /// Calculate the health score from findings.
    pub fn calculate_score(findings: &[DiagnosisFinding]) -> u8 {
        if findings.is_empty() {
            return 100;
        }

        let penalty: i32 = findings
            .iter()
            .map(|f| match f.severity {
                Severity::Critical => 25,
                Severity::Warning => 10,
                Severity::Info => 3,
            })
            .sum();

        let score = 100i32.saturating_sub(penalty);
        score.max(0) as u8
    }

    /// Generate a human-readable summary.
    pub fn generate_summary(findings: &[DiagnosisFinding], score: u8) -> String {
        let critical = findings
            .iter()
            .filter(|f| f.severity == Severity::Critical)
            .count();
        let warnings = findings
            .iter()
            .filter(|f| f.severity == Severity::Warning)
            .count();
        let info = findings
            .iter()
            .filter(|f| f.severity == Severity::Info)
            .count();

        if critical > 0 {
            format!(
                "System health score: {}/100. Found {} critical issue(s), {} warning(s), and {} informational note(s). Immediate action recommended.",
                score, critical, warnings, info
            )
        } else if warnings > 0 {
            format!(
                "System health score: {}/100. Found {} warning(s) and {} informational note(s). Some optimizations are available.",
                score, warnings, info
            )
        } else if info > 0 {
            format!(
                "System health score: {}/100. System is in good shape with {} minor suggestion(s).",
                score, info
            )
        } else {
            format!(
                "System health score: {}/100. Your system is running optimally!",
                score
            )
        }
    }
}
