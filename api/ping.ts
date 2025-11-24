import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ping = process.env.PING_MESSAGE ?? "ping";
  return res.json({ message: ping });
};
