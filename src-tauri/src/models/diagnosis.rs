use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Suggestion {
    pub id: String,
    pub title: String,
    pub description: String,
    pub category: String, // "storage" | "memory" | "cpu" | "startup" | "system" | "network"
    pub risk_level: String, // "safe" | "low" | "medium" | "high"
    pub estimated_gain: String,
    pub estimated_gain_bytes: Option<u64>,
    pub details: String,
    pub dry_run_preview: String,
    pub enabled: bool,
    pub impact_score: u8, // 0-100
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiagnosisResult {
    pub suggestions: Vec<Suggestion>,
    pub overall_health_score: u8,
    pub scan_duration_ms: u64,
    pub summary: String,
}

impl DiagnosisResult {
    pub fn calculate_score(suggestions: &[Suggestion]) -> u8 {
        if suggestions.is_empty() {
            return 100;
        }

        let penalty: i32 = suggestions
            .iter()
            .map(|s| match s.risk_level.as_str() {
                "high" => 25,
                "medium" => 10,
                "low" => 5,
                _ => 2,
            })
            .sum();

        let score = 100i32.saturating_sub(penalty);
        score.max(0) as u8
    }

    pub fn generate_summary(suggestions: &[Suggestion], score: u8) -> String {
        let high = suggestions.iter().filter(|s| s.risk_level == "high").count();
        let medium = suggestions.iter().filter(|s| s.risk_level == "medium").count();
        let total = suggestions.len();

        if high > 0 {
            format!(
                "Found {} high-risk issues out of {} total opportunities. Immediate action recommended.",
                high, total
            )
        } else if medium > 0 {
            format!(
                "Found {} medium-risk issues out of {}. Some optimizations are available.",
                medium, total
            )
        } else if total > 0 {
            format!(
                "System is in good shape with {} minor suggestions.",
                total
            )
        } else {
            "Your system is running optimally!".to_string()
        }
    }
}
