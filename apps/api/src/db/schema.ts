import { index, integer, jsonb, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { EndGameResult } from "@decreto/shared-types";
import type { EngineState } from "@decreto/game-engine";

export type PersistedGameState = Omit<EngineState, "queue">;
export type GameStatus = "playing" | "ended";

export const eventImages = pgTable(
  "event_images",
  {
    id: serial("id").primaryKey(),
    eventName: text("event_name").notNull(),
    fileLocation: text("file_location").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("event_images_event_name_idx").on(table.eventName)],
);

export const games = pgTable(
  "games",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    state: jsonb("state").$type<PersistedGameState>().notNull(),
    version: integer("version").notNull().default(1),
    status: text("status").$type<GameStatus>().notNull().default("playing"),
    result: jsonb("result").$type<EndGameResult | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("games_status_idx").on(table.status)],
);
