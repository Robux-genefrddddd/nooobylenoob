import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { checkSecurityBeforeAuth } from "@/lib/securityCheck";
import { LicenseManager } from "@/lib/licenseManager";
import {
  LicenseVerificationResponse,
  Warning,
  SecurityAlert,
} from "@shared/api";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";

export type Plan = "Gratuit" | "Classic" | "Pro";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  messageCount?: number;
  messageLimit?: number;
  licenseKey?: string;
  expiresAt?: string;
  isBanned?: boolean;
  isSuspended?: boolean;
  avatar?: string;
  avatarType?: "emoji" | "image" | "url";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePlan: (plan: Plan) => Promise<void>;
  incrementMessageCount: () => Promise<void>;
  canSendMessage: () => boolean;
  verifyLicense: () => Promise<LicenseVerificationResponse | null>;
  activateLicense: (licenseKey: string) => Promise<void>;
  updateAvatar: (avatar: string, type: "emoji" | "image" | "url") => Promise<void>;
  warnings: Warning[];
  alerts: SecurityAlert[];
  maintenanceMode: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const initializeDeviceId = async () => {
      try {
        const fingerprint = await getDeviceFingerprint();
        if (isMounted) {
          setDeviceId(fingerprint.fingerprint);
        }
      } catch (err) {
        console.error("Error getting device fingerprint:", err);
      }
    };

    const setupAuthListener = () => {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;

        try {
          if (firebaseUser) {
            try {
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              if (!isMounted) return;

              if (userDoc.exists()) {
                const userData = userDoc.data();
                const newUser: User = {
                  id: firebaseUser.uid,
                  name: userData.name,
                  email: firebaseUser.email || "",
                  plan: userData.plan || "Gratuit",
                  isBanned: userData.isBanned || false,
                  isSuspended: userData.isSuspended || false,
                };
                setUser(newUser);

                if (deviceId && newUser.email) {
                  try {
                    const licenseData = await LicenseManager.verifyLicense(
                      newUser.email,
                      deviceId,
                    );
                    if (isMounted) {
                      setWarnings(licenseData.warnings || []);
                      setAlerts(licenseData.alerts || []);
                      setMaintenanceMode(licenseData.maintenanceMode || false);
                      setUser((prev) =>
                        prev
                          ? {
                              ...prev,
                              messageCount: licenseData.messageCount,
                              messageLimit: licenseData.messageLimit,
                              expiresAt: licenseData.expiresAt,
                              plan: licenseData.plan,
                            }
                          : null,
                      );
                    }
                  } catch (licErr) {
                    console.error("License verification error:", licErr);
                  }
                }
              } else {
                setUser({
                  id: firebaseUser.uid,
                  name: "",
                  email: firebaseUser.email || "",
                  plan: "Gratuit",
                });
              }
            } catch (docErr) {
              if (!isMounted) return;
              if (
                docErr instanceof Error &&
                (docErr.message?.includes("aborted") ||
                  docErr.message?.includes("AbortError"))
              ) {
                return;
              }
              console.error("Error fetching user document:", docErr);
              setError(
                docErr instanceof Error
                  ? docErr.message
                  : "Failed to load user profile",
              );
            }
          } else {
            setUser(null);
            setWarnings([]);
            setAlerts([]);
          }
        } catch (err) {
          if (!isMounted) return;
          console.error("Error in auth state change:", err);
          setError(err instanceof Error ? err.message : "Failed to load user");
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      });
    };

    initializeDeviceId();
    setupAuthListener();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          console.error("Error unsubscribing from auth:", err);
        }
      }
    };
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      const securityCheck = await checkSecurityBeforeAuth(email, true);

      if (!securityCheck.allowed) {
        const errorMsg =
          securityCheck.reason || "Registration blocked by security check";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        plan: "Gratuit",
        createdAt: new Date().toISOString(),
      });

      setUser({
        id: firebaseUser.uid,
        name,
        email,
        plan: "Gratuit",
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      const securityCheck = await checkSecurityBeforeAuth(email, false);

      if (!securityCheck.allowed) {
        const errorMsg =
          securityCheck.reason || "Login blocked by security check";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: firebaseUser.uid,
          name: userData.name,
          email: firebaseUser.email || "",
          plan: userData.plan || "Gratuit",
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Logout failed";
      setError(errorMsg);
      throw err;
    }
  };

  const updatePlan = async (plan: Plan): Promise<void> => {
    if (!user) return;

    try {
      setError(null);
      // Update user plan in Firestore
      await setDoc(doc(db, "users", user.id), { plan }, { merge: true });

      // Update local state
      setUser({ ...user, plan });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update plan";
      setError(errorMsg);
      throw err;
    }
  };

  const updateAvatar = async (
    avatar: string,
    type: "emoji" | "image" | "url",
  ): Promise<void> => {
    if (!user) return;

    try {
      setError(null);
      await setDoc(
        doc(db, "users", user.id),
        { avatar, avatarType: type },
        { merge: true },
      );
      setUser({ ...user, avatar, avatarType: type });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update avatar";
      setError(errorMsg);
      throw err;
    }
  };

  const incrementMessageCount = async (): Promise<void> => {
    if (!user) return;

    try {
      const newCount = (user.messageCount || 0) + 1;
      await setDoc(
        doc(db, "users", user.id),
        { messageCount: newCount },
        { merge: true },
      );
      setUser({ ...user, messageCount: newCount });
    } catch (err) {
      console.error("Failed to increment message count:", err);
    }
  };

  const canSendMessage = (): boolean => {
    if (!user) return false;
    if (user.isBanned || user.isSuspended) return false;
    const limit = user.messageLimit || (user.plan === "Gratuit" ? 10 : 1000);
    return (user.messageCount || 0) < limit;
  };

  const verifyLicense =
    async (): Promise<LicenseVerificationResponse | null> => {
      if (!user || !deviceId) return null;
      try {
        const licenseData = await LicenseManager.verifyLicense(
          user.email,
          deviceId,
        );
        if (licenseData) {
          setWarnings(licenseData.warnings || []);
          setAlerts(licenseData.alerts || []);
          setMaintenanceMode(licenseData.maintenanceMode || false);
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  messageCount: licenseData.messageCount,
                  messageLimit: licenseData.messageLimit,
                  expiresAt: licenseData.expiresAt,
                  plan: licenseData.plan,
                  isBanned: licenseData.isBanned,
                  isSuspended: licenseData.isSuspended,
                }
              : null,
          );
        }
        return licenseData;
      } catch (err) {
        console.error("License verification error:", err);
        return null;
      }
    };

  const activateLicense = async (licenseKey: string): Promise<void> => {
    if (!user || !deviceId) {
      throw new Error("User not authenticated or device ID not available");
    }
    try {
      await LicenseManager.activateLicense(user.email, licenseKey, deviceId);
      await verifyLicense();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "License activation failed";
      setError(errorMsg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        register,
        login,
        logout,
        updatePlan,
        incrementMessageCount,
        canSendMessage,
        verifyLicense,
        activateLicense,
        warnings,
        alerts,
        maintenanceMode,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
