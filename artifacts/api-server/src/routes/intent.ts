import { Router, type IRouter } from "express";
import { ilike, or } from "drizzle-orm";
import { db, toolsTable } from "@workspace/db";
import { ParseIntentBody, ParseIntentResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/intent/parse", async (req, res): Promise<void> => {
  const parsed = ParseIntentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const query = parsed.data.query.toLowerCase();

  // Extract keywords from the query for fuzzy matching
  const words = query.split(/\s+/).filter(w => w.length > 3);

  let matchedTools: typeof toolsTable.$inferSelect[] = [];

  if (words.length > 0) {
    const conditions = words.map(word =>
      or(
        ilike(toolsTable.name, `%${word}%`),
        ilike(toolsTable.description, `%${word}%`)
      )
    );

    matchedTools = await db
      .select()
      .from(toolsTable)
      .where(or(...conditions))
      .limit(5);
  }

  // If no matches, return all active tools as candidates
  if (matchedTools.length === 0) {
    matchedTools = await db
      .select()
      .from(toolsTable)
      .limit(3);
  }

  const explanation =
    matchedTools.length > 0
      ? `Matched ${matchedTools.length} tool${matchedTools.length > 1 ? "s" : ""} based on query keywords. Top match: ${matchedTools[0].name} (${matchedTools[0].runtime}).`
      : "No matching tools found for the given query.";

  res.json(
    ParseIntentResponse.parse({
      query: parsed.data.query,
      matchedTools: matchedTools.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })),
      explanation,
      suggestedExecution: matchedTools.length > 0,
    })
  );
});

export default router;
