import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleGetAIConfig,
  handleUpdateAIConfig,
} from "../../server/routes/admin";

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method === "GET") {
    return handleGetAIConfig(req as any, res as any);
  } else if (req.method === "POST") {
    return handleUpdateAIConfig(req as any, res as any);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};
