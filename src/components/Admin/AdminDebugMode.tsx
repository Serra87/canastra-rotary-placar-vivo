
import React from "react";
import { toast } from "@/hooks/use-toast";
import DebugPanel from "@/components/AdminTabs/DebugPanel";
import { Tournament } from "@/lib/types";

interface AdminDebugModeProps {
  tournament: Tournament | null;
  onUpdateTournament: (tournament: Tournament) => void;
}

const AdminDebugMode: React.FC<AdminDebugModeProps> = ({ tournament, onUpdateTournament }) => {
  // Debug mode always active - removed keyboard shortcut dependency
  const debugMode = true;

  if (!tournament) {
    return null;
  }

  return (
    <>
      {debugMode && (
        <DebugPanel 
          tournament={tournament} 
          onUpdateTournament={onUpdateTournament} 
        />
      )}
    </>
  );
};

export default AdminDebugMode;
