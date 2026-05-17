import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, pluginsTable } from "@workspace/db";
import {
  ListPluginsQueryParams,
  ListPluginsResponse,
  InstallPluginParams,
  InstallPluginResponse,
  UninstallPluginParams,
  UninstallPluginResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapPlugin(p: typeof pluginsTable.$inferSelect) {
  return {
    ...p,
    installedAt: p.installedAt ? p.installedAt.toISOString() : null,
  };
}

router.get("/plugins", async (req, res): Promise<void> => {
  const params = ListPluginsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.category) {
    conditions.push(eq(pluginsTable.category, params.data.category));
  }
  if (params.data.installed !== undefined) {
    conditions.push(eq(pluginsTable.installed, params.data.installed));
  }

  const plugins = await db
    .select()
    .from(pluginsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(pluginsTable.name);

  res.json(ListPluginsResponse.parse(plugins.map(mapPlugin)));
});

router.post("/plugins/:id/install", async (req, res): Promise<void> => {
  const params = InstallPluginParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plugin] = await db
    .update(pluginsTable)
    .set({ installed: true, installedAt: new Date() })
    .where(eq(pluginsTable.id, params.data.id))
    .returning();

  if (!plugin) {
    res.status(404).json({ error: "Plugin not found" });
    return;
  }

  res.json(InstallPluginResponse.parse(mapPlugin(plugin)));
});

router.delete("/plugins/:id/install", async (req, res): Promise<void> => {
  const params = UninstallPluginParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plugin] = await db
    .update(pluginsTable)
    .set({ installed: false, installedAt: null })
    .where(eq(pluginsTable.id, params.data.id))
    .returning();

  if (!plugin) {
    res.status(404).json({ error: "Plugin not found" });
    return;
  }

  res.json(UninstallPluginResponse.parse(mapPlugin(plugin)));
});

export default router;
