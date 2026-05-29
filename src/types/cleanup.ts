export type ActionStatus = "idle" | "running" | "success" | "failed";

export interface CleanupAction {
  id: string;
  title: string;
  category: string;
  size_bytes: number;
  size_display: string;
  paths: string[];
}

export interface CleanupResult {
  categories_cleaned: string[];
  bytes_freed: number;
  bytes_freed_display: string;
  files_removed: number;
  errors: string[];
  completed_at: string;
}

export interface ActionLog {
  timestamp: string;
  action: string;
  target: string;
  method: string;
  result: string;
}
