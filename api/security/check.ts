import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleSecurityCheck } from "../../server/routes/security";

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return handleSecurityCheck(req as any, res as any);
};
