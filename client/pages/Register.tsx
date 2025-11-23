import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    register(formData.name, formData.email, formData.password);
    navigate("/");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#000" }}
    >
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div
          className="rounded-2xl p-8 border"
          style={{
            backgroundColor: "#0A0A0A",
            borderColor: "#1A1A1A",
            boxShadow: "0 0 40px rgba(255, 255, 255, 0.03)",
          }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "#FFFFFF" }}
            >
              Créer mon compte
            </h1>
            <p className="text-sm" style={{ color: "#888888" }}>
              Rejoignez-nous pour commencer
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#FFFFFF" }}
              >
                Nom
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Votre nom complet"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors duration-200"
                style={{
                  backgroundColor: "#1A1A1A",
                  borderColor: "#2A2A2A",
                  color: "#FFFFFF",
                }}
              />
            </div>

            {/* Email Field */}
            <div>
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
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors duration-200"
                style={{
                  backgroundColor: "#1A1A1A",
                  borderColor: "#2A2A2A",
                  color: "#FFFFFF",
                }}
              />
            </div>

            {/* Password Field */}
            <div>
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
                placeholder="Au moins 6 caractères"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors duration-200"
                style={{
                  backgroundColor: "#1A1A1A",
                  borderColor: "#2A2A2A",
                  color: "#FFFFFF",
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
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold transition-all duration-200 text-white mt-6"
              style={{
                backgroundColor: "#0A84FF",
                boxShadow: "0 0 20px rgba(10, 132, 255, 0.4)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 30px rgba(10, 132, 255, 0.6)";
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "#0070DD";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 20px rgba(10, 132, 255, 0.4)";
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "#0A84FF";
              }}
            >
              Créer mon compte
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6 text-sm" style={{ color: "#888888" }}>
            Déjà un compte ?{" "}
            <a
              href="/login"
              className="font-semibold transition-colors duration-200"
              style={{ color: "#0A84FF" }}
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
