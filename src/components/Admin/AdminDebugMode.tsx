
import React, { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import DebugPanel from "@/components/AdminTabs/DebugPanel";
import { Tournament } from "@/lib/types";

interface AdminDebugModeProps {
  tournament: Tournament | null;
  onUpdateTournament: (tournament: Tournament) => void;
}

const AdminDebugMode: React.FC<AdminDebugModeProps> = ({ tournament, onUpdateTournament }) => {
  const [debugMode, setDebugMode] = useState(false);
  
  // Check for debug mode on mount and enable if special key is pressed
  useEffect(() => {
    const checkDebugMode = (e: KeyboardEvent) => {
      // Enable debug mode with Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => {
          const newMode = !prev;
          toast({
            title: newMode ? "Modo Debug Ativado" : "Modo Debug Desativado",
            description: newMode ? "Funcionalidades de diagnóstico disponíveis" : "Voltando ao modo normal"
          });
          return newMode;
        });
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', checkDebugMode);
    return () => window.removeEventListener('keydown', checkDebugMode);
  }, []);

  if (!debugMode || !tournament) {
    return null;
  }

  return (
    <DebugPanel 
      tournament={tournament} 
      onUpdateTournament={onUpdateTournament} 
    />
  );
};

export default AdminDebugMode;
