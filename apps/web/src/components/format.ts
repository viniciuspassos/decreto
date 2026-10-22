import type { IndicatorId } from "@decreto/shared-types";

export const INDICATORS: IndicatorId[] = [
  "gdp", "unemployment", "inflation", "debt",
];

const PERCENT: IndicatorId[] = ["unemployment", "inflation"];
const roundNearestInteger = (value: number): number => Math.sign(value) * Math.round(Math.abs(value));

export function formatIndicator(id: IndicatorId, value: number): string {
  const rounded = roundNearestInteger(value);
  if (id === "gdp") return `${rounded > 0 ? "+" : ""}${rounded}%`;
  if (id === "debt" || PERCENT.includes(id)) return `${rounded}%`;
  return String(value);
}

export const formatPercent = (value: number): string => `${roundNearestInteger(value)}%`;

/** Change with an arrow: ▲ up, ▼ down. */
export const signed = (delta: number) => {
  const rounded = roundNearestInteger(Math.abs(delta));
  if (rounded === 0) return "0";
  return delta > 0 ? `▲${rounded}` : delta < 0 ? `▼${rounded}` : "0";
};
