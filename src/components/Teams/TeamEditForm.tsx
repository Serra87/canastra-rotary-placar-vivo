
import React from "react";
import { Team } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TeamLivesEditor from "./TeamLivesEditor";
import TeamStatusDisplay from "./TeamStatusDisplay";

interface TeamEditFormProps {
  team: Team;
  onTeamChange: (updatedTeam: Team) => void;
  currentRound: number;
  maxReentryRound: number;
}

const TeamEditForm = ({ team, onTeamChange, currentRound, maxReentryRound }: TeamEditFormProps) => {
  const handleLivesChange = (lives: number) => {
    if (lives >= 0 && lives <= (team.reEntered ? 1 : 2)) {
      onTeamChange({
        ...team,
        lives,
        eliminated: lives === 0
      });
    }
  };

  const handleReenter = () => {
    onTeamChange({
      ...team,
      lives: 1,
      eliminated: false,
      reEntered: true
    });
  };

  const canReenter = currentRound <= maxReentryRound;

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="team-name" className="text-right">
          Nome
        </Label>
        <Input
          id="team-name"
          value={team.name}
          onChange={(e) => onTeamChange({ ...team, name: e.target.value })}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="player1" className="text-right">
          Jogador 1
        </Label>
        <Input
          id="player1"
          value={team.players[0]}
          onChange={(e) => {
            const newPlayers: [string, string] = [e.target.value, team.players[1]];
            onTeamChange({ ...team, players: newPlayers });
          }}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="player2" className="text-right">
          Jogador 2
        </Label>
        <Input
          id="player2"
          value={team.players[1]}
          onChange={(e) => {
            const newPlayers: [string, string] = [team.players[0], e.target.value];
            onTeamChange({ ...team, players: newPlayers });
          }}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Vidas</Label>
        <div className="col-span-3">
          <TeamLivesEditor 
            lives={team.lives} 
            maxLives={team.reEntered ? 1 : 2}
            onLivesChange={handleLivesChange} 
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Status</Label>
        <TeamStatusDisplay 
          eliminated={team.eliminated}
          reEntered={team.reEntered}
          canReenter={canReenter}
          onReenter={handleReenter}
        />
      </div>
    </div>
  );
};

export default TeamEditForm;
