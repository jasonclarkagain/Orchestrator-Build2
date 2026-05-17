import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const executionsTable = pgTable("executions", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").notNull(),
  toolName: text("tool_name").notNull(),
  runtime: text("runtime").notNull(),
  status: text("status").notNull().default("running"),
  durationMs: integer("duration_ms"),
  output: text("output"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExecutionSchema = createInsertSchema(executionsTable).omit({ id: true });
export type InsertExecution = z.infer<typeof insertExecutionSchema>;
export type Execution = typeof executionsTable.$inferSelect;
