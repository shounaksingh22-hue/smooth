export type TipPriority = "high" | "medium" | "low";

export interface MaintenanceTip {
  id: string;
  title: string;
  body: string;
  category: string; // habit | storage | memory | browser | startup | hardware
  priority: TipPriority;
  impact: string; // short phrase describing the payoff
}

export interface MaintenancePlan {
  tips: MaintenanceTip[];
  headline: string;
}
