import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleChat } from "../server/routes/chat";

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return handleChat(req as any, res as any);
};
