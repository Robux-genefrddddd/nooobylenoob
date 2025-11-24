import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleLicenseVerify } from "../../server/routes/license";

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return handleLicenseVerify(req as any, res as any);
};
