import { RequestHandler } from "express";
import { AdminLicenseCreate, AdminUserAction, LicensePlan } from "@shared/api";
import {
  generateLicenseKey,
  calculateMessageLimit,
  calculateExpiryDate,
  formatLicenseKey,
} from "../lib/licenseUtils";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "../lib/firebaseAdmin";

const db = getFirestore(app);

const ADMIN_EMAIL = "founder@example.com";

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

    const licenseKeysRef = collection(db, "licenseKeys");
    await setDoc(doc(licenseKeysRef), {
      key: licenseKey,
      plan,
      email,
      expiresAt: expiryDate.toISOString(),
      isActive: true,
      messageLimit,
      createdAt: new Date().toISOString(),
      createdByAdmin: adminEmail,
    });

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
    const { email: userEmail, action, reason, durationDays } = req.body as AdminUserAction & {
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

    const usersQuery = query(
      collection(db, "users"),
      where("email", "==", userEmail),
    );

    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    const now = new Date();

    switch (action) {
      case "warn":
        await addDoc(
          collection(db, "users", userId, "warnings"),
          {
            type: "warning",
            title: "Avertissement",
            message:
              reason ||
              "Vous avez reçu un avertissement de la part des administrateurs.",
            createdAt: now.toISOString(),
            createdByAdmin: adminEmail,
            isRead: false,
          },
        );
        break;

      case "suspend":
        const suspensionEndDate = new Date(now);
        suspensionEndDate.setDate(
          suspensionEndDate.getDate() + (durationDays || 7),
        );

        await updateDoc(userDoc.ref, {
          isSuspended: true,
          suspensionEndsAt: suspensionEndDate.toISOString(),
          suspensionReason: reason,
        });

        await addDoc(
          collection(db, "users", userId, "warnings"),
          {
            type: "suspension",
            title: "Compte Suspendu",
            message:
              reason ||
              "Votre compte a été temporairement suspendu par les administrateurs.",
            createdAt: now.toISOString(),
            createdByAdmin: adminEmail,
            isRead: false,
            actionRequired: "acknowledge",
          },
        );
        break;

      case "ban":
        await updateDoc(userDoc.ref, {
          isBanned: true,
          bannedAt: now.toISOString(),
          banReason: reason || "Banned by admin",
        });

        await addDoc(
          collection(db, "users", userId, "warnings"),
          {
            type: "ban",
            title: "Compte Banni",
            message:
              reason ||
              "Votre compte a été bannis en raison d'une violation des conditions d'utilisation.",
            createdAt: now.toISOString(),
            createdByAdmin: adminEmail,
            isRead: false,
            actionRequired: "none",
          },
        );
        break;

      case "unban":
        await updateDoc(userDoc.ref, {
          isBanned: false,
          bannedAt: null,
          banReason: null,
        });
        break;

      case "reactivate":
        await updateDoc(userDoc.ref, {
          isSuspended: false,
          suspensionEndsAt: null,
          suspensionReason: null,
        });
        break;

      default:
        return res.status(400).json({
          error: "Invalid action",
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

    const configRef = doc(db, "config", "maintenance");

    await setDoc(
      configRef,
      {
        enabled: enabled === true,
        message:
          message ||
          "La plateforme est actuellement en maintenance. Veuillez réessayer plus tard.",
        updatedAt: new Date().toISOString(),
        updatedBy: adminEmail,
      },
      { merge: true },
    );

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

    const usersSnapshot = await getDocs(collection(db, "users"));
    const totalUsers = usersSnapshot.size;

    let activeSubscriptions = 0;
    let totalMessagesUsed = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (
        userData.plan === "Classic" ||
        userData.plan === "Pro"
      ) {
        activeSubscriptions++;
      }
      totalMessagesUsed += userData.messageCount || 0;
    }

    return res.json({
      totalUsers,
      activeSubscriptions,
      totalMessagesUsed,
    });
  } catch (error) {
    console.error("Stats retrieval error:", error);
    return res.status(500).json({ error: "Failed to retrieve stats" });
  }
};
