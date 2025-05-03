
import React from "react";
import { Heart } from "lucide-react";
import { Team } from "@/lib/types";

interface MatchHeartsProps {
  team: Team;
  lives: number;
}

/**
 * Component to render heart indicators for team lives
 */
export const MatchHearts: React.FC<MatchHeartsProps> = ({ team, lives }) => {
  return (
    <div className="flex items-center mt-1">
      {Array.from({ length: lives }).map((_, i) => (
        <Heart key={i} size={16} className="text-red-500 fill-red-500 mr-0.5" />
      ))}
      {Array.from({ length: (team.reEntered ? 1 : 2) - lives }).map((_, i) => (
        <Heart key={`empty-${i}`} size={16} className="text-gray-300 mr-0.5" />
      ))}
      <span className="ml-2 text-xs">
        {lives <= 0 ? "Eliminado" : team.reEntered ? "Reinscrito" : "Ativo"}
      </span>
    </div>
  );
};

export default MatchHearts;
