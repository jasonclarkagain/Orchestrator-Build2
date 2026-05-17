import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const toolsTable = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  runtime: text("runtime").notNull(),
  status: text("status").notNull().default("active"),
  version: text("version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertToolSchema = createInsertSchema(toolsTable).omit({ id: true, createdAt: true });
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof toolsTable.$inferSelect;
