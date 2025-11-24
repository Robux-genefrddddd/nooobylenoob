import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleGetMessageHistory } from "../../server/routes/admin";

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return handleGetMessageHistory(req as any, res as any);
};
