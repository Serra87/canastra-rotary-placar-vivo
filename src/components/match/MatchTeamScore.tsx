
import React from "react";
import { Team } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import MatchHearts from "./MatchHearts";
import MatchLivesControls from "./MatchLivesControls";

interface MatchTeamScoreProps {
  team: Team;
  score: number;
  lives: number;
  onScoreChange: (value: number) => void;
  onLivesUpdate: (increment: boolean) => void;
  disabled?: boolean;
}

/**
 * Component for rendering and managing a team's score in a match
 */
export const MatchTeamScore: React.FC<MatchTeamScoreProps> = ({ 
  team, 
  score, 
  lives, 
  onScoreChange, 
  onLivesUpdate,
  disabled = false 
}) => {
  // Safety check to handle potential undefined or invalid team references
  if (!team) {
    console.error("Team is undefined in MatchTeamScore");
    return null;
  }

  console.log("Rendering MatchTeamScore for team:", team?.id, team?.name);
  
  return (
    <div className="border-b pb-3">
      <Label>{team?.name || 'Time'}</Label>
      <div className="mt-2 flex items-center space-x-2">
        <Input
          type="number"
          value={score}
          onChange={(e) => {
            const value = Number(e.target.value);
            onScoreChange(value);
          }}
          className="w-24"
          disabled={disabled}
        />
        <MatchLivesControls 
          lives={lives} 
          onUpdate={onLivesUpdate}
          disabled={disabled}
        />
      </div>
      <MatchHearts team={team} lives={lives} />
    </div>
  );
};

export default MatchTeamScore;
