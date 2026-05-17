import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, toolsTable } from "@workspace/db";
import {
  ListToolsQueryParams,
  ListToolsResponse,
  CreateToolBody,
  GetToolParams,
  GetToolResponse,
  UpdateToolParams,
  UpdateToolBody,
  UpdateToolResponse,
  DeleteToolParams,
  ToggleToolParams,
  ToggleToolResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tools", async (req, res): Promise<void> => {
  const params = ListToolsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.search) {
    conditions.push(ilike(toolsTable.name, `%${params.data.search}%`));
  }
  if (params.data.status) {
    conditions.push(eq(toolsTable.status, params.data.status));
  }

  const tools = await db
    .select()
    .from(toolsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(toolsTable.createdAt);

  res.json(ListToolsResponse.parse(tools.map(t => ({ ...t, createdAt: t.createdAt.toISOString() }))));
});

router.post("/tools", async (req, res): Promise<void> => {
  const parsed = CreateToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [tool] = await db
    .insert(toolsTable)
    .values({ ...parsed.data, status: "active" })
    .returning();

  res.status(201).json(GetToolResponse.parse({ ...tool, createdAt: tool.createdAt.toISOString() }));
});

router.get("/tools/:id", async (req, res): Promise<void> => {
  const params = GetToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.id, params.data.id));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.json(GetToolResponse.parse({ ...tool, createdAt: tool.createdAt.toISOString() }));
});

router.patch("/tools/:id", async (req, res): Promise<void> => {
  const params = UpdateToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateToolBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [tool] = await db
    .update(toolsTable)
    .set(body.data)
    .where(eq(toolsTable.id, params.data.id))
    .returning();

  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.json(UpdateToolResponse.parse({ ...tool, createdAt: tool.createdAt.toISOString() }));
});

router.delete("/tools/:id", async (req, res): Promise<void> => {
  const params = DeleteToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tool] = await db
    .delete(toolsTable)
    .where(eq(toolsTable.id, params.data.id))
    .returning();

  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/tools/:id/toggle", async (req, res): Promise<void> => {
  const params = ToggleToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(toolsTable).where(eq(toolsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  const newStatus = existing.status === "active" ? "inactive" : "active";
  const [tool] = await db
    .update(toolsTable)
    .set({ status: newStatus })
    .where(eq(toolsTable.id, params.data.id))
    .returning();

  res.json(ToggleToolResponse.parse({ ...tool, createdAt: tool.createdAt.toISOString() }));
});

export default router;
