import { Router, type IRouter } from "express";
import { eq, gte, and, desc, sql } from "drizzle-orm";
import { db, toolsTable, executionsTable } from "@workspace/db";
import {
  GetDashboardStatsResponse,
  GetExecutionVelocityResponse,
  GetRuntimeDistributionResponse,
  GetLiveActivityQueryParams,
  GetLiveActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const allTools = await db.select().from(toolsTable);
  const activeTools = allTools.filter(t => t.status === "active").length;
  const totalTools = allTools.length;

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await db
    .select()
    .from(executionsTable)
    .where(gte(executionsTable.startedAt, yesterday));

  const executions24h = recent.length;
  const completed = recent.filter(e => e.status === "completed");
  const successRate = executions24h > 0 ? (completed.length / executions24h) * 100 : 0;
  const avgDurationMs =
    completed.length > 0
      ? completed.reduce((sum, e) => sum + (e.durationMs ?? 0), 0) / completed.length
      : 0;

  res.json(
    GetDashboardStatsResponse.parse({
      activeTools,
      totalTools,
      executions24h,
      successRate: Math.round(successRate * 10) / 10,
      avgDurationMs: Math.round(avgDurationMs),
    })
  );
});

router.get("/dashboard/velocity", async (_req, res): Promise<void> => {
  const points = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const execs = await db
      .select()
      .from(executionsTable)
      .where(
        and(
          gte(executionsTable.startedAt, dayStart),
          sql`${executionsTable.startedAt} < ${dayEnd}`
        )
      );

    const date = dayStart.toISOString().split("T")[0];
    points.push({
      date,
      count: execs.length,
      successCount: execs.filter(e => e.status === "completed").length,
    });
  }

  res.json(GetExecutionVelocityResponse.parse(points));
});

router.get("/dashboard/runtime-distribution", async (_req, res): Promise<void> => {
  const execs = await db.select({ runtime: executionsTable.runtime }).from(executionsTable);
  const counts: Record<string, number> = {};
  for (const e of execs) {
    counts[e.runtime] = (counts[e.runtime] ?? 0) + 1;
  }

  const buckets = Object.entries(counts).map(([runtime, count]) => ({ runtime, count }));
  res.json(GetRuntimeDistributionResponse.parse(buckets));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const params = GetLiveActivityQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const limit = params.data.limit ?? 10;
  const activity = await db
    .select()
    .from(executionsTable)
    .orderBy(desc(executionsTable.startedAt))
    .limit(limit);

  res.json(
    GetLiveActivityResponse.parse(
      activity.map(e => ({
        ...e,
        startedAt: e.startedAt.toISOString(),
        durationMs: e.durationMs ?? null,
        output: e.output ?? null,
      }))
    )
  );
});

export default router;
