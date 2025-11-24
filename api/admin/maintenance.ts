import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleMaintenanceMode } from "../../server/routes/admin";

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return handleMaintenanceMode(req as any, res as any);
};
