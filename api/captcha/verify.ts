import type { VercelRequest, VercelResponse } from "@vercel/node";
import https from "https";
import querystring from "querystring";

interface CaptchaVerifyRequest {
  token: string;
}

interface HcaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  score_reason?: string[];
  "error-codes"?: string[];
}

const verifyCaptchaWithHttp = (
  secret: string,
  token: string,
  remoteip?: string,
): Promise<HcaptchaVerifyResponse> => {
  return new Promise((resolve, reject) => {
    const payload: Record<string, string> = { secret, response: token };
    if (remoteip) {
      payload.remoteip = remoteip;
    }

    const data = querystring.stringify(payload);

    const options = {
      host: "hcaptcha.com",
      path: "/siteverify",
      method: "POST" as const,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "content-length": Buffer.byteLength(data),
      },
    };

    const request = https.request(options, (response) => {
      response.setEncoding("utf8");
      let buffer = "";

      response
        .on("error", reject)
        .on("data", (chunk) => (buffer += chunk))
        .on("end", () => {
          try {
            const json = JSON.parse(buffer) as HcaptchaVerifyResponse;
            resolve(json);
          } catch (error) {
            reject(error);
          }
        });
    });

    request.on("error", reject);
    request.write(data);
    request.end();
  });
};

export default async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.body as CaptchaVerifyRequest;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Captcha token is required",
      });
    }

    const secretKey = process.env.HCAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error("hCaptcha secret key not configured");
      return res.status(500).json({
        success: false,
        error: "Captcha verification service misconfigured",
      });
    }

    const data = await verifyCaptchaWithHttp(
      secretKey,
      token,
      req.headers["x-forwarded-for"] as string | undefined,
    );

    if (!data.success) {
      console.error("hCaptcha verification failed:", data["error-codes"]);
      return res.status(403).json({
        success: false,
        error: "Captcha verification failed",
        error_codes: data["error-codes"] ?? [],
      });
    }

    return res.json({
      success: true,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
    });
  } catch (error) {
    console.error("Captcha verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Captcha verification failed",
    });
  }
};
