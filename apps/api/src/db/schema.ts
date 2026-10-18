import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

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
