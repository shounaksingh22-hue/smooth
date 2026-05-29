import React, { useEffect, useState } from "react";
import { useAnalysisStore } from "../../stores/analysisStore";
import { useCleanupStore } from "../../stores/cleanupStore";
import { useAppStore } from "../../stores/appStore";
import { useCleanup } from "../../hooks/useCleanup";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Toggle } from "../common/Toggle";
import { Modal } from "../common/Modal";
import { formatBytes } from "../../lib/formatters";
import {
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Category, CATEGORY_META, RISK_META } from "../../types/diagnosis";

export const DiagnosisView: React.FC = () => {
  const { diagnosisResult } = useAnalysisStore();
  const {
    selectedActions,
    setSelectedActions,
    toggleActionSelected,
  } = useCleanupStore();
  const { setPhase, useTrash, setUseTrash, disabledCategories, toggleCategoryDisabled } = useAppStore();
  const { scanCleanup } = useCleanup();
  
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Initialize selected actions with all auto-fixable suggestions
  useEffect(() => {
    if (diagnosisResult?.suggestions && selectedActions.length === 0) {
      const initial = diagnosisResult.suggestions
        .filter((s) => s.enabled && !disabledCategories.includes(s.category))
        .map((s) => s.id);
      setSelectedActions(initial);
    }
  }, [diagnosisResult, setSelectedActions, disabledCategories]);

  // Scan files sizes for cleanup in background
  useEffect(() => {
    scanCleanup();
  }, []);

  if (!diagnosisResult) return null;

  const styleClass = "rounded-[var(--radius-ui)]";

  // Filter suggestions based on disabled categories
  const activeSuggestions = diagnosisResult.suggestions.filter(
    (s) => !disabledCategories.includes(s.category)
  );

  const disabledSuggestionsCount = diagnosisResult.suggestions.length - activeSuggestions.length;

  const selectedCount = activeSuggestions.filter((s) =>
    selectedActions.includes(s.id)
  ).length;

  // Calculate estimated total space freed from selected actions
  const totalReclaimableBytes = activeSuggestions
    .filter((s) => selectedActions.includes(s.id))
    .reduce((sum, s) => sum + (s.estimated_gain_bytes || 0), 0);

  const handleConfirmExecute = () => {
    setIsConfirmOpen(false);
    setPhase("cleanup");
  };

  const categoriesPresent = Array.from(
    new Set(diagnosisResult.suggestions.map((s) => s.category))
  );

  // Friendly category labels for non-technical users
  const friendlyCategoryName = (cat: Category): string => {
    switch (cat) {
      case "storage": return "Digital Dust & Storage";
      case "memory": return "RAM Memory Cache";
      case "cpu": return "Compute Speed (CPU)";
      case "startup": return "Autostart Background Apps";
      case "system": return "System Console Files";
      case "network": return "Network Cache (DNS)";
      default: return String(cat);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 select-none hud-grid px-2">
      {/* Health Score Panel */}
      <Card className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 border-emerald-500/20 bg-slate-900/25">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full shadow-lg shadow-emerald-500/5 shrink-0">
            <span
              className={`text-3xl font-black hud-glow ${
                diagnosisResult.overall_health_score >= 80
                  ? "text-emerald-400"
                  : diagnosisResult.overall_health_score >= 50
                  ? "text-amber-400"
                  : "text-rose-500"
              }`}
            >
              {diagnosisResult.overall_health_score}
            </span>
            <div className="absolute -bottom-1 bg-slate-850 px-2 py-0.5 rounded text-[8px] font-bold text-slate-400 tracking-wider border border-slate-800 uppercase">
              Gage
            </div>
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
              Diagnostics Report <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
              Console Owner: Shounak. Evaluated system integrity levels: {diagnosisResult.summary} Check suggestions below to resolve active system issues.
            </p>
            {totalReclaimableBytes > 0 && (
              <p className="text-xs text-emerald-400 font-extrabold mt-2 tracking-wide uppercase">
                Estimated space to regain: {formatBytes(totalReclaimableBytes)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button
            variant="primary"
            disabled={selectedCount === 0}
            onClick={() => setIsConfirmOpen(true)}
            className="w-full font-extrabold tracking-wide uppercase text-xs"
          >
            Optimize selected ({selectedCount})
          </Button>
          <Button variant="ghost" onClick={() => setPhase("analyze")} className="w-full text-xs">
            <RotateCcw size={12} /> Re-probe Registers
          </Button>
        </div>
      </Card>

      {/* Global Category Exclusion Settings */}
      <Card className="p-4 border-slate-800/80 bg-slate-950/20">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
          Diagnostic Exclusions
        </h3>
        <p className="text-[11px] text-slate-500 mb-3 leading-normal">
          Toggle options below to completely block the console from accessing or optimizing those categories.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {categoriesPresent.map((cat) => {
            const meta = CATEGORY_META[cat] || { label: String(cat), color: "#cbd5e1" };
            const isDisabled = disabledCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategoryDisabled(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                  isDisabled
                    ? "bg-slate-900 border-slate-850 text-slate-600 line-through"
                    : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isDisabled ? "#475569" : meta.color }}
                />
                {friendlyCategoryName(cat)}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Preferences panel (useTrash option) */}
      <Card className="flex justify-between items-center p-4 border-slate-800/80 bg-slate-950/20">
        <div>
          <h4 className="text-xs font-bold text-slate-200">Reversible Optimization Mode</h4>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
            Moves cache registries and logs to the Trash/Recycle Bin instead of permanent deletion. Highly recommended.
          </p>
        </div>
        <Toggle checked={useTrash} onChange={setUseTrash} />
      </Card>

      {/* Suggestions List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Available Optimization Tweaks ({activeSuggestions.length})
        </h3>
        
        {disabledSuggestionsCount > 0 && (
          <p className="text-[10px] text-slate-500 font-bold italic">
            * {disabledSuggestionsCount} items locked due to exclusion boundaries.
          </p>
        )}

        {activeSuggestions.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 bg-slate-950/20">
            No active issues found. System is running optimal!
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {activeSuggestions.map((s) => {
              const catMeta = CATEGORY_META[s.category] || { label: s.category, color: "#fff" };
              const isSelected = selectedActions.includes(s.id);
              const isExpanded = expandedSuggestion === s.id;

              return (
                <Card
                  key={s.id}
                  className={`p-4 transition-all border border-slate-800/80 hover:border-slate-700/60 ${
                    isSelected ? "bg-slate-900/10" : "bg-slate-950/20 opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleActionSelected(s.id)}
                        className="mt-1 accent-emerald-500 cursor-pointer h-4 w-4 bg-slate-900 border-slate-850 rounded text-slate-900"
                      />
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-100">{s.title}</h4>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase border"
                            style={{
                              borderColor: `${catMeta.color}30`,
                              color: catMeta.color,
                              backgroundColor: `${catMeta.color}0a`,
                            }}
                          >
                            {friendlyCategoryName(s.category)}
                          </span>
                          <Badge level={s.risk_level} />
                          {s.estimated_gain && (
                            <span className="text-xs text-emerald-400 font-extrabold tracking-wide">
                              Freed: {s.estimated_gain}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-normal">{s.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedSuggestion(isExpanded ? null : s.id)}
                      className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-850 rounded cursor-pointer shrink-0"
                      title="Toggle detailed readout"
                    >
                      <Eye size={15} />
                    </button>
                  </div>

                  {/* Expanded Content (Dry-run preview) */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-850 flex flex-col gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tweak Details</span>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{s.details}</p>
                      </div>
                      <div className={`p-3 bg-slate-950/60 border border-slate-850 ${styleClass}`}>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                          <Info size={12} className="text-emerald-500" />
                          Diagnostic Dry-Run Readout
                        </div>
                        <pre className="text-[10px] font-mono text-emerald-400/90 whitespace-pre-wrap leading-relaxed select-text">
                          {s.dry_run_preview}
                        </pre>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmExecute}
        title="Confirm Diagnostic Optimization"
        confirmText="Confirm"
        confirmVariant="primary"
      >
        <p className="mb-2">
          You are about to optimize <strong>{selectedCount} approved items</strong>.
        </p>
        <p className="mb-4">
          All scripts execute completely on-device. Caches and logs will be swept to the {useTrash ? "Trash / Recycle Bin" : "permanently deleted"} as specified.
        </p>
        <div className="p-3 bg-slate-950 border border-slate-850 rounded text-xs font-mono flex items-center justify-between">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Total Reclaimable:</span>
          <span className="text-emerald-400 font-black">{formatBytes(totalReclaimableBytes)}</span>
        </div>
      </Modal>
    </div>
  );
};
