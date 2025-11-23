import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div
          className="rounded-2xl p-8 border"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >

          <div>
            {/* Header */}
            <div className="mb-8 text-center">
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "#1a1a1a" }}
              >
                Se connecter
              </h1>
              <p
                className="text-sm"
                style={{ color: "#666666" }}
              >
                Bienvenue sur votre compte
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.3s both",
                }}
              >
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#FFFFFF" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: "#1A1A1A",
                    borderColor: "#2A2A2A",
                    color: "#FFFFFF",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.borderColor = "#0A84FF";
                    (e.target as HTMLElement).style.boxShadow =
                      "0 0 20px rgba(10, 132, 255, 0.2)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLElement).style.borderColor = "#2A2A2A";
                    (e.target as HTMLElement).style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password Field */}
              <div
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.4s both",
                }}
              >
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#FFFFFF" }}
                >
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: "#1A1A1A",
                    borderColor: "#2A2A2A",
                    color: "#FFFFFF",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.borderColor = "#0A84FF";
                    (e.target as HTMLElement).style.boxShadow =
                      "0 0 20px rgba(10, 132, 255, 0.2)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLElement).style.borderColor = "#2A2A2A";
                    (e.target as HTMLElement).style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="p-3 rounded-lg text-sm text-center"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "#EF4444",
                    animation: "shake 0.5s ease-in-out",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200 text-white mt-6 relative overflow-hidden group disabled:opacity-50"
                style={{
                  backgroundColor: "#0A84FF",
                  boxShadow: "0 0 20px rgba(10, 132, 255, 0.4)",
                  animation: "fadeInUp 0.6s ease-out 0.5s both",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 30px rgba(10, 132, 255, 0.6)";
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "#0070DD";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 20px rgba(10, 132, 255, 0.4)";
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "#0A84FF";
                  }
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="inline-block w-4 h-4 rounded-full border-2 border-transparent"
                      style={{
                        borderTopColor: "#FFFFFF",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Connexion en cours...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div
              className="text-center mt-6 text-sm"
              style={{
                color: "#888888",
                animation: "fadeInUp 0.6s ease-out 0.6s both",
              }}
            >
              Pas encore de compte ?{" "}
              <a
                href="/register"
                className="font-semibold transition-colors duration-200"
                style={{
                  color: "#0A84FF",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#0070DD";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#0A84FF";
                }}
              >
                S'inscrire
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes borderGlow {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
