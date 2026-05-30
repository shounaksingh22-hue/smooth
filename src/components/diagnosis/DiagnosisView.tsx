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
import { RotateCcw, ChevronDown, Info } from "lucide-react";
import { Category } from "../../types/diagnosis";

const CATEGORY_LABEL: Record<string, string> = {
  storage: "Storage",
  memory: "Memory",
  cpu: "CPU",
  startup: "Startup",
  system: "System",
  network: "Network",
};
const catLabel = (c: Category | string) => CATEGORY_LABEL[c] ?? String(c);

export const DiagnosisView: React.FC = () => {
  const { diagnosisResult } = useAnalysisStore();
  const { selectedActions, setSelectedActions, toggleActionSelected } = useCleanupStore();
  const { setPhase, useTrash, setUseTrash, disabledCategories, toggleCategoryDisabled } =
    useAppStore();
  const { scanCleanup } = useCleanup();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Pre-select all enabled, non-excluded suggestions
  useEffect(() => {
    if (diagnosisResult?.suggestions && selectedActions.length === 0) {
      const initial = diagnosisResult.suggestions
        .filter((s) => s.enabled && !disabledCategories.includes(s.category))
        .map((s) => s.id);
      setSelectedActions(initial);
    }
  }, [diagnosisResult, setSelectedActions, disabledCategories]);

  // Warm up the cleanup scan in the background
  useEffect(() => {
    scanCleanup();
  }, []);

  if (!diagnosisResult) return null;

  const activeSuggestions = diagnosisResult.suggestions.filter(
    (s) => !disabledCategories.includes(s.category)
  );
  const disabledCount = diagnosisResult.suggestions.length - activeSuggestions.length;
  const selectedCount = activeSuggestions.filter((s) => selectedActions.includes(s.id)).length;
  const totalReclaimable = activeSuggestions
    .filter((s) => selectedActions.includes(s.id))
    .reduce((sum, s) => sum + (s.estimated_gain_bytes || 0), 0);
  const categoriesPresent = Array.from(new Set(diagnosisResult.suggestions.map((s) => s.category)));
  const score = diagnosisResult.overall_health_score;
  const scoreTone = score >= 80 ? "text-success" : score >= 50 ? "text-warn" : "text-danger";

  return (
    <div className="flex-1 flex flex-col gap-5 select-none">
      {/* Health + actions */}
      <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-6">
        <div className="flex items-center gap-5">
          <div className="relative grid place-items-center h-20 w-20 rounded-full border border-border shrink-0">
            <span className={`text-2xl font-semibold tabular-nums ${scoreTone}`}>{score}</span>
            <span className="label absolute -bottom-2 bg-surface px-1.5">score</span>
          </div>
          <div>
            <div className="label">Diagnosis</div>
            <h2 className="text-lg font-semibold text-fg mt-1">
              {selectedCount} optimization{selectedCount === 1 ? "" : "s"} selected
            </h2>
            <p className="text-xs text-muted mt-1 max-w-md leading-relaxed">{diagnosisResult.summary}</p>
            {totalReclaimable > 0 && (
              <p className="text-xs text-accent font-medium mt-2">
                You can reclaim up to {formatBytes(totalReclaimable)}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
          <Button
            variant="primary"
            disabled={selectedCount === 0}
            onClick={() => setConfirmOpen(true)}
            className="w-full"
          >
            Optimize selected ({selectedCount})
          </Button>
          <Button variant="ghost" onClick={() => setPhase("analyze")} className="w-full">
            <RotateCcw size={13} /> Re-scan
          </Button>
        </div>
      </Card>

      {/* Category include/exclude */}
      <div>
        <div className="label mb-2.5">Include categories</div>
        <div className="flex flex-wrap gap-2">
          {categoriesPresent.map((cat) => {
            const off = disabledCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategoryDisabled(cat)}
                className={`tactile text-xs font-medium px-2.5 py-1.5 rounded-full border ${
                  off
                    ? "bg-surface text-faint border-border line-through"
                    : "bg-accent-soft text-accent border-transparent"
                }`}
              >
                {catLabel(cat)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reversible mode */}
      <Card className="flex justify-between items-center p-4 gap-4">
        <div>
          <div className="text-xs font-semibold text-fg">Reversible mode</div>
          <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
            Move items to the Trash / Recycle Bin instead of deleting permanently. Recommended.
          </p>
        </div>
        <Toggle checked={useTrash} onChange={setUseTrash} />
      </Card>

      {/* Recommendations */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="label">Recommendations ({activeSuggestions.length})</div>
          {disabledCount > 0 && <div className="label">{disabledCount} hidden</div>}
        </div>

        {activeSuggestions.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted">
            Nothing to clean up. Your system already looks healthy.
          </Card>
        ) : (
          activeSuggestions.map((s) => {
            const isSelected = selectedActions.includes(s.id);
            const isExpanded = expanded === s.id;
            return (
              <Card key={s.id} className={`p-4 ${isSelected ? "" : "opacity-60"}`}>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleActionSelected(s.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)] cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-fg">{s.title}</h4>
                        <span className="label px-1.5 py-0.5 rounded bg-elevated">{catLabel(s.category)}</span>
                        <Badge level={s.risk_level} />
                        {s.estimated_gain && (
                          <span className="text-xs text-accent font-medium">{s.estimated_gain}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted mt-1 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : s.id)}
                    className="tactile ring-focus rounded p-1 text-faint hover:text-fg shrink-0"
                    aria-label="Toggle details"
                  >
                    <ChevronDown size={15} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-col gap-3">
                    <p className="text-xs text-muted leading-relaxed">{s.details}</p>
                    <div className="rounded-[var(--radius-sm)] bg-elevated p-3">
                      <div className="label flex items-center gap-1.5 mb-1.5">
                        <Info size={12} className="text-accent" /> Dry-run preview
                      </div>
                      <pre className="text-[10px] font-mono text-muted whitespace-pre-wrap leading-relaxed select-text">
                        {s.dry_run_preview}
                      </pre>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          setPhase("cleanup");
        }}
        title="Confirm optimization"
        confirmText="Optimize"
        confirmVariant="primary"
      >
        <p className="mb-2">
          You're about to run <strong className="text-fg">{selectedCount}</strong> optimization
          {selectedCount === 1 ? "" : "s"}.
        </p>
        <p className="mb-4">
          Items will be{" "}
          {useTrash ? "moved to the Trash / Recycle Bin (reversible)" : "permanently deleted"}.
        </p>
        <div className="flex items-center justify-between card p-3">
          <span className="label">Reclaimable</span>
          <span className="text-accent font-semibold tabular-nums">{formatBytes(totalReclaimable)}</span>
        </div>
      </Modal>
    </div>
  );
};
