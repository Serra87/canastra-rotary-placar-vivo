
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
  if (!team || !team.id) {
    console.error("Team is undefined or missing ID in MatchTeamScore");
    return null;
  }

  // Ensure all required team properties exist
  const safeTeam: Team = {
    id: team.id,
    name: team.name || 'Time',
    players: team.players || ['', ''] as [string, string],
    eliminated: team.eliminated ?? false,
    totalPoints: team.totalPoints ?? 0,
    lives: team.lives ?? lives,
    reEntered: team.reEntered ?? false
  };

  // Log complete team object for debugging
  console.log("Full team object in MatchTeamScore:", safeTeam);
  console.log("Team ID:", safeTeam.id, "Team Name:", safeTeam.name, "Lives:", lives);
  
  return (
    <div className="border-b pb-3">
      <Label>{safeTeam.name}</Label>
      <div className="mt-2 flex items-center space-x-2">
        <Input
          type="number"
          value={score}
          onChange={(e) => {
            const value = Number(e.target.value);
            console.log(`Updating score for team ${safeTeam.name} to ${value}`);
            onScoreChange(value);
          }}
          className="w-24"
          disabled={disabled}
        />
        <MatchLivesControls 
          lives={lives} 
          onUpdate={(increment) => {
            console.log(`Updating lives for team ${safeTeam.name}, increment: ${increment}, current: ${lives}`);
            onLivesUpdate(increment);
          }}
          disabled={disabled}
        />
      </div>
      <MatchHearts team={safeTeam} lives={lives} />
    </div>
  );
};

export default MatchTeamScore;
