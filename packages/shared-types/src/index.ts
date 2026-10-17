/**
 * Tipos compartilhados entre apps/web e apps/api.
 * Ver CLAUDE.md -> "Estrutura de monorepo".
 */

export type Locale = "pt-BR" | "en";

export interface HealthStatus {
  status: "ok";
  version: string;
}
