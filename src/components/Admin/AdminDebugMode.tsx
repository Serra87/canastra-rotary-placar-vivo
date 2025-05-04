
import React from "react";
import { Tournament } from "@/lib/types";

interface AdminDebugModeProps {
  tournament: Tournament | null;
  onUpdateTournament: (tournament: Tournament) => void;
}

const AdminDebugMode: React.FC<AdminDebugModeProps> = () => {
  // This component is now empty as per user request to remove debug functionality
  return null;
};

export default AdminDebugMode;
