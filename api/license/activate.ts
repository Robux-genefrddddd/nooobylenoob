import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleLicenseActivate } from "../../server/routes/license";

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return handleLicenseActivate(req as any, res as any);
};
