
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  transparent?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  show, 
  message = "Carregando...", 
  transparent = false 
}) => {
  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${transparent ? 'bg-white/50' : 'bg-white'}`}>
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-rotary-blue mx-auto" />
        <p className="mt-2 text-lg text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
