import { AlertTriangle } from "lucide-react";

interface MaintenanceModeOverlayProps {
  message?: string;
  showCountdown?: boolean;
}

export default function MaintenanceModeOverlay({
  message = "La plateforme est actuellement en maintenance. Veuillez réessayer plus tard.",
  showCountdown = false,
}: MaintenanceModeOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 max-w-md mx-4 shadow-2xl text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-4">Maintenance</h1>
        <p className="text-slate-300 mb-6">{message}</p>

        {showCountdown && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <p className="text-slate-400 text-sm mb-2">
              Nous serons de retour dans
            </p>
            <p className="text-xl font-bold text-yellow-400">
              Bientôt
            </p>
          </div>
        )}

        <p className="text-slate-400 text-sm">
          Nous travaillons pour vous offrir une meilleure expérience.
        </p>
      </div>
    </div>
  );
}
