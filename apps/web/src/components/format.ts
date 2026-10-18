import type { IndicatorId } from "@decreto/shared-types";

export const INDICATORS: IndicatorId[] = [
  "gdp", "unemployment", "inflation", "debt", "crime",
  "health", "education", "pollution", "pressFreedom", "corruption",
];

const PERCENT: IndicatorId[] = ["unemployment", "inflation"];

export function formatIndicator(id: IndicatorId, value: number): string {
  if (id === "gdp") return `${value > 0 ? "+" : ""}${value}%`;
  if (id === "debt") return `${value}%`;
  return PERCENT.includes(id) ? `${value}%` : String(value);
}

/** Variação com seta: ▲ sobe, ▼ desce. */
export const signed = (delta: number) => (delta > 0 ? `▲${delta}` : delta < 0 ? `▼${-delta}` : "0");
