import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, AlertCircle } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      sessionStorage.setItem("admin_token", token);
      sessionStorage.setItem("admin_authenticated", "true");
      navigate("/admin-panel");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#000000" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl border"
        style={{
          backgroundColor: "#0A0A0A",
          borderColor: "#1A1A1A",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: "rgba(10, 132, 255, 0.1)" }}
          >
            <Lock size={32} style={{ color: "#0A84FF" }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#FFFFFF" }}>
            Admin Panel
          </h1>
          <p className="text-sm" style={{ color: "#666666" }}>
            Restricted Access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-3 p-4 rounded-lg border"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderColor: "rgba(239, 68, 68, 0.3)",
              }}
            >
              <AlertCircle size={20} style={{ color: "#EF4444" }} />
              <span style={{ color: "#EF4444", fontSize: "0.875rem" }}>
                {error}
              </span>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#FFFFFF" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: email ? "#0A84FF" : "#2A2A2A",
                color: "#FFFFFF",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#FFFFFF" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: password ? "#0A84FF" : "#2A2A2A",
                color: "#FFFFFF",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: email && password ? "#0A84FF" : "#2A2A2A",
              color: "#FFFFFF",
              boxShadow:
                email && password
                  ? "0 0 20px rgba(10, 132, 255, 0.4)"
                  : "none",
            }}
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm transition-colors"
            style={{ color: "#0A84FF" }}
          >
            Back to App
          </button>
        </div>
      </div>
    </div>
  );
}
