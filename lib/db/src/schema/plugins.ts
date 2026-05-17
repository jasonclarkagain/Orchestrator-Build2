import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pluginsTable = pgTable("plugins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  version: text("version").notNull(),
  runtime: text("runtime").notNull(),
  installed: boolean("installed").notNull().default(false),
  installedAt: timestamp("installed_at", { withTimezone: true }),
});

export const insertPluginSchema = createInsertSchema(pluginsTable).omit({ id: true });
export type InsertPlugin = z.infer<typeof insertPluginSchema>;
export type Plugin = typeof pluginsTable.$inferSelect;
