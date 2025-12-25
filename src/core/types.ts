export type XSignals = {
  structure: "short" | "balanced" | "extended";
  pace: "slow" | "medium" | "fast";
  density: "low" | "medium" | "high";
  repetition: "low" | "medium" | "high";
  sentiment: "bright" | "neutral" | "dark";
  volatility: "low" | "medium" | "high";
  narrative: "linear" | "fragmented";
  register: "low" | "mid" | "high";
};

export type YIntentSection = {
  headline: string;
  do: string[];
  dont: string[];
};

export type YIntent = {
  harmony: YIntentSection;
  rhythm: YIntentSection;
  dynamics: YIntentSection;
  texture: YIntentSection;
  space: YIntentSection;
  arrangement: YIntentSection;
  register: YIntentSection;
  tension: YIntentSection;
};

export type RuleStatus = "applied" | "capped" | "blocked";

export type RuleFired = {
  id: string;
  name: string;
  status: RuleStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  because: string;
  prevents: string;
  tradeoff: string;
};

export type EkkoResult = {
  x: XSignals;
  y: YIntent;
  rules: RuleFired[];
  version: string;
};
