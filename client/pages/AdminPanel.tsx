import { useState, useEffect } from "react";
import { Copy, Check, Trash2, LogOut } from "lucide-react";
import { copyToClipboard } from "@/lib/codeDisplay";

interface License {
  id: string;
  key: string;
  plan: "Gratuit" | "Plus" | "Entreprise";
  createdAt: Date;
  usedBy?: string;
  isActive: boolean;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<"Plus" | "Entreprise">("Plus");
  const [copied, setCopied] = useState<string | null>(null);

  const ADMIN_PASSWORD = "Antoine80@";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword("");
      loadLicenses();
    } else {
      alert("Invalid password");
      setPassword("");
    }
  };

  const loadLicenses = () => {
    const stored = localStorage.getItem("admin_licenses");
    if (stored) {
      setLicenses(JSON.parse(stored));
    }
  };

  const generateLicenseKey = (): string => {
    const prefix = selectedPlan === "Plus" ? "PLUS" : "ENT";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = prefix + "-";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateLicense = () => {
    const newLicense: License = {
      id: Date.now().toString(),
      key: generateLicenseKey(),
      plan: selectedPlan,
      createdAt: new Date(),
      isActive: true,
    };

    const updated = [...licenses, newLicense];
    setLicenses(updated);
    localStorage.setItem("admin_licenses", JSON.stringify(updated));
  };

  const handleCopyLicense = async (key: string) => {
    const success = await copyToClipboard(key);
    if (success) {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleDeleteLicense = (id: string) => {
    const updated = licenses.filter((lic) => lic.id !== id);
    setLicenses(updated);
    localStorage.setItem("admin_licenses", JSON.stringify(updated));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLicenses([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <form
          onSubmit={handleLogin}
          className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700"
        >
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Admin Panel
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value="Admin"
                disabled
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-300 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Generate License Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Generate License Key
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plan Type
              </label>
              <select
                value={selectedPlan}
                onChange={(e) =>
                  setSelectedPlan(e.target.value as "Plus" | "Entreprise")
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Plus">Plus Plan</option>
                <option value="Entreprise">Entreprise Plan</option>
              </select>
            </div>
            <button
              onClick={handleGenerateLicense}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors font-semibold"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Licenses List */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Generated Licenses ({licenses.length})
          </h2>

          {licenses.length === 0 ? (
            <p className="text-gray-400">No licenses generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      License Key
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Plan
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((license) => (
                    <tr
                      key={license.id}
                      className="border-b border-gray-700 hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4 text-gray-200 font-mono text-sm">
                        {license.key}
                      </td>
                      <td className="py-3 px-4 text-gray-200">{license.plan}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {new Date(license.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            license.isActive
                              ? "bg-green-900 text-green-200"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {license.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyLicense(license.key)}
                            className="p-2 hover:bg-gray-600 rounded transition-colors"
                            title="Copy license key"
                          >
                            {copied === license.key ? (
                              <Check size={18} className="text-green-400" />
                            ) : (
                              <Copy size={18} className="text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteLicense(license.id)}
                            className="p-2 hover:bg-red-900 rounded transition-colors"
                            title="Delete license"
                          >
                            <Trash2 size={18} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
