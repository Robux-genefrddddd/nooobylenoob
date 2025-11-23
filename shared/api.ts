export interface DemoResponse {
  message: string;
}

export type LicensePlan = "Gratuit" | "Classic" | "Pro";
export type WarningType = "warning" | "suspension" | "expiration" | "ban";

export interface LicenseKey {
  id: string;
  key: string;
  plan: LicensePlan;
  userId: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  usedBy?: string;
  createdByAdmin: string;
}

export interface UserLicense {
  id: string;
  userId: string;
  plan: LicensePlan;
  licenseKey: string;
  expiresAt: string;
  isActive: boolean;
  messageCount: number;
  messageLimit: number;
  lastResetDate: string;
  warnings: number;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  isSuspended: boolean;
  suspensionEndsAt?: string;
}

export interface Warning {
  id: string;
  userId: string;
  type: WarningType;
  title: string;
  message: string;
  createdAt: string;
  createdByAdmin: string;
  isRead: boolean;
  dismissedAt?: string;
  actionRequired?: "none" | "acknowledge" | "renew_license";
}

export interface SecurityAlert {
  type: "popup" | "banner" | "modal";
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "critical";
  dismissible: boolean;
  action?: {
    label: string;
    url?: string;
  };
}

export interface LicenseVerificationRequest {
  email: string;
  licenseKey?: string;
  deviceId: string;
}

export interface LicenseVerificationResponse {
  valid: boolean;
  plan: LicensePlan;
  messageLimit: number;
  messageCount: number;
  canSendMessage: boolean;
  expiresAt: string;
  warnings: Warning[];
  isBanned: boolean;
  isSuspended: boolean;
  alerts: SecurityAlert[];
  maintenanceMode: boolean;
}

export interface AdminLicenseCreate {
  email: string;
  plan: LicensePlan;
  durationDays: number;
}

export interface AdminUserAction {
  userId: string;
  action: "warn" | "suspend" | "ban" | "unban" | "reactivate";
  reason?: string;
  durationDays?: number;
}

export interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  showCountdown: boolean;
  restrictedPaths?: string[];
}
