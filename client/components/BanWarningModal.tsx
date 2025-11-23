import { useState, useEffect } from "react";
import { AlertTriangle, Ban, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface BanWarning {
  type: "warning" | "suspension" | "ban";
  title: string;
  message: string;
  reason?: string;
  endsAt?: string;
  actionRequired: "acknowledge" | "none";
}

export default function BanWarningModal() {
  const { user } = useAuth();
  const [warning, setWarning] = useState<BanWarning | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check ban status
    if (user.isBanned) {
      setWarning({
        type: "ban",
        title: "Account Banned",
        message: `Your account has been banned from using this service.`,
        reason: user.banReason || "No specific reason provided",
        actionRequired: "acknowledge",
      });
      return;
    }

    // Check suspension status
    if (user.isSuspended) {
      setWarning({
        type: "suspension",
        title: "Account Suspended",
        message: "Your account has been temporarily suspended.",
        endsAt: user.suspensionEndsAt,
        actionRequired: "acknowledge",
      });
      return;
    }

    // If user passed all checks, no warning needed
    setWarning(null);
  }, [user]);

  if (!warning) {
    return null;
  }

  // This modal cannot be closed without acknowledging
  const handleAcknowledge = () => {
    setAcknowledged(true);
    if (warning.type === "ban") {
      // Logout if banned
      window.location.href = "/login";
    }
  };

  const iconColor =
    warning.type === "ban"
      ? "#EF4444"
      : warning.type === "suspension"
        ? "#F59E0B"
        : "#3B82F6";

  const bgColor =
    warning.type === "ban"
      ? "rgba(239, 68, 68, 0.1)"
      : warning.type === "suspension"
        ? "rgba(245, 158, 11, 0.1)"
        : "rgba(59, 130, 246, 0.1)";

  const borderColor =
    warning.type === "ban"
      ? "rgba(239, 68, 68, 0.3)"
      : warning.type === "suspension"
        ? "rgba(245, 158, 11, 0.3)"
        : "rgba(59, 130, 246, 0.3)";

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div
        className="w-full max-w-md rounded-lg p-8 border"
        style={{
          backgroundColor: "#0A0A0A",
          borderColor: "#1A1A1A",
        }}
      >
        {/* Icon and Title */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: bgColor }}
          >
            {warning.type === "ban" ? (
              <Ban size={32} style={{ color: iconColor }} />
            ) : warning.type === "suspension" ? (
              <Clock size={32} style={{ color: iconColor }} />
            ) : (
              <AlertTriangle size={32} style={{ color: iconColor }} />
            )}
          </div>
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "#FFFFFF" }}
          >
            {warning.title}
          </h2>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-6">
          <p style={{ color: "#CCCCCC" }}>{warning.message}</p>

          {warning.reason && (
            <div
              className="p-4 rounded-lg border"
              style={{ backgroundColor: bgColor, borderColor }}
            >
              <p style={{ color: "#888888", fontSize: "0.875rem" }}>
                <span style={{ fontWeight: "600", color: "#FFFFFF" }}>
                  Reason:
                </span>
                <br />
                {warning.reason}
              </p>
            </div>
          )}

          {warning.endsAt && warning.type === "suspension" && (
            <div
              className="p-4 rounded-lg border"
              style={{ backgroundColor: bgColor, borderColor }}
            >
              <p style={{ color: "#888888", fontSize: "0.875rem" }}>
                <span style={{ fontWeight: "600", color: "#FFFFFF" }}>
                  Suspension Ends:
                </span>
                <br />
                {new Date(warning.endsAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="space-y-3">
          {warning.type === "ban" ? (
            <div className="text-center text-sm" style={{ color: "#888888" }}>
              <p className="mb-4">
                If you believe this is a mistake, please contact support.
              </p>
              <button
                onClick={handleAcknowledge}
                className="w-full py-3 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                }}
              >
                I Understand - Logout
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-4" style={{ color: "#888888" }}>
                You can use limited features during this period.
              </p>
              <button
                onClick={handleAcknowledge}
                className="w-full py-3 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: "#F59E0B",
                  color: "#FFFFFF",
                }}
              >
                I Acknowledge
              </button>
            </div>
          )}
        </div>

        {/* Warning message */}
        <p className="text-xs mt-6 text-center" style={{ color: "#666666" }}>
          This warning cannot be dismissed.
          {warning.type === "ban" && " You will be logged out."}
        </p>
      </div>
    </div>
  );
}
