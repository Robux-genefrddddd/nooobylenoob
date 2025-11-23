import { RequestHandler } from "express";
import { AdminLicenseCreate, AdminUserAction, LicensePlan, GeneratedLicense, AIConfig, UserListItem } from "@shared/api";
import {
  generateLicenseKey,
  calculateMessageLimit,
  calculateExpiryDate,
  formatLicenseKey,
} from "../lib/licenseUtils";

const ADMIN_EMAIL = "founder@example.com";

// In-memory storage for generated licenses and AI config
const generatedLicenses: Map<string, GeneratedLicense> = new Map();
let aiConfig: AIConfig = {
  model: "x-ai/grok-4.1-fast",
  systemPrompt: "You are a helpful assistant. Respond to user queries in a clear, concise, and friendly manner.",
  temperature: 0.7,
  maxTokens: 1024,
};

async function verifyAdmin(email?: string): Promise<boolean> {
  return email === ADMIN_EMAIL;
}

export const handleCreateLicense: RequestHandler = async (req, res) => {
  try {
    const { email, plan, durationDays } = req.body as AdminLicenseCreate;
    const adminEmail = req.headers["x-admin-email"] as string;

    if (!(await verifyAdmin(adminEmail))) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!email || !plan || !durationDays) {
      return res.status(400).json({
        error: "Email, plan, and durationDays are required",
      });
    }

    const licenseKey = generateLicenseKey();
    const expiryDate = calculateExpiryDate(durationDays);
    const messageLimit = calculateMessageLimit(plan);

    return res.json({
      success: true,
      key: licenseKey,
      formattedKey: formatLicenseKey(licenseKey),
      plan,
      expiresAt: expiryDate.toISOString(),
      messageLimit,
    });
  } catch (error) {
    console.error("License creation error:", error);
    return res.status(500).json({ error: "Failed to create license" });
  }
};

export const handleUserAction: RequestHandler = async (req, res) => {
  try {
    const {
      email: userEmail,
      action,
      reason,
      durationDays,
    } = req.body as AdminUserAction & {
      email: string;
      durationDays?: number;
    };
    const adminEmail = req.headers["x-admin-email"] as string;

    if (!(await verifyAdmin(adminEmail))) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!userEmail || !action) {
      return res.status(400).json({
        error: "User email and action are required",
      });
    }

    return res.json({
      success: true,
      message: `Action '${action}' applied to ${userEmail}`,
    });
  } catch (error) {
    console.error("User action error:", error);
    return res.status(500).json({ error: "Failed to apply user action" });
  }
};

export const handleMaintenanceMode: RequestHandler = async (req, res) => {
  try {
    const { enabled, message } = req.body;
    const adminEmail = req.headers["x-admin-email"] as string;

    if (!(await verifyAdmin(adminEmail))) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    return res.json({
      success: true,
      enabled: enabled === true,
      message,
    });
  } catch (error) {
    console.error("Maintenance mode error:", error);
    return res.status(500).json({ error: "Failed to update maintenance mode" });
  }
};

export const handleGetStats: RequestHandler = async (req, res) => {
  try {
    const adminEmail = req.headers["x-admin-email"] as string;

    if (!(await verifyAdmin(adminEmail))) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    return res.json({
      totalUsers: 0,
      activeSubscriptions: 0,
      totalMessagesUsed: 0,
    });
  } catch (error) {
    console.error("Stats retrieval error:", error);
    return res.status(500).json({ error: "Failed to retrieve stats" });
  }
};
