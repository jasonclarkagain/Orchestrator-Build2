import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, executionsTable, toolsTable } from "@workspace/db";
import {
  ListExecutionsQueryParams,
  ListExecutionsResponse,
  TriggerExecutionBody,
  GetExecutionParams,
  GetExecutionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapExecution(e: typeof executionsTable.$inferSelect) {
  return {
    ...e,
    startedAt: e.startedAt.toISOString(),
    durationMs: e.durationMs ?? null,
    output: e.output ?? null,
  };
}

router.get("/executions", async (req, res): Promise<void> => {
  const params = ListExecutionsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.status) {
    conditions.push(eq(executionsTable.status, params.data.status));
  }
  if (params.data.toolId) {
    conditions.push(eq(executionsTable.toolId, params.data.toolId));
  }

  const limit = params.data.limit ?? 50;
  const executions = await db
    .select()
    .from(executionsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(executionsTable.startedAt))
    .limit(limit);

  res.json(ListExecutionsResponse.parse(executions.map(mapExecution)));
});

router.post("/executions", async (req, res): Promise<void> => {
  const parsed = TriggerExecutionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.id, parsed.data.toolId));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  if (tool.status !== "active") {
    res.status(400).json({ error: "Tool is inactive" });
    return;
  }

  const startedAt = new Date();
  const [execution] = await db
    .insert(executionsTable)
    .values({
      toolId: tool.id,
      toolName: tool.name,
      runtime: tool.runtime,
      status: "running",
      startedAt,
    })
    .returning();

  // Simulate execution completing after a brief delay
  const durationMs = Math.floor(Math.random() * 3000) + 200;
  const status = Math.random() > 0.1 ? "completed" : "failed";

  setTimeout(async () => {
    await db
      .update(executionsTable)
      .set({ status, durationMs })
      .where(eq(executionsTable.id, execution.id));
  }, durationMs);

  res.status(201).json(GetExecutionResponse.parse(mapExecution(execution)));
});

router.get("/executions/:id", async (req, res): Promise<void> => {
  const params = GetExecutionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [execution] = await db
    .select()
    .from(executionsTable)
    .where(eq(executionsTable.id, params.data.id));

  if (!execution) {
    res.status(404).json({ error: "Execution not found" });
    return;
  }

  res.json(GetExecutionResponse.parse(mapExecution(execution)));
});

export default router;
