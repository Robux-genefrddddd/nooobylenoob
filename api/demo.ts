import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleDemo } from "../server/routes/demo";

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return handleDemo(req as any, res as any);
};
