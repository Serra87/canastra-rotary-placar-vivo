
import React, { useEffect } from "react";
import { Match, Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MatchTeamScore from "./MatchTeamScore";
import MatchWinnerSelect from "./MatchWinnerSelect";

interface MatchResultDialogProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scoreA: number;
  scoreB: number;
  teamALives: number;
  teamBLives: number;
  winner: string | undefined;
  onScoreAChange: (value: number) => void;
  onScoreBChange: (value: number) => void;
  onTeamALivesUpdate: (increment: boolean) => void;
  onTeamBLivesUpdate: (increment: boolean) => void;
  onWinnerChange: (value: string) => void;
  onConfirmResult: () => void;
  disabled?: boolean;
}

/**
 * Dialog to confirm match results and update scores/lives
 */
export const MatchResultDialog: React.FC<MatchResultDialogProps> = ({
  match,
  open,
  onOpenChange,
  scoreA,
  scoreB,
  teamALives,
  teamBLives,
  winner,
  onScoreAChange,
  onScoreBChange,
  onTeamALivesUpdate,
  onTeamBLivesUpdate,
  onWinnerChange,
  onConfirmResult,
  disabled = false
}) => {
  console.log("Rendering ResultDialog, open:", open);
  console.log("Match in ResultDialog:", match.id);
  console.log("Team A:", match.teamA?.id, match.teamA?.name);
  console.log("Team B:", match.teamB?.id, match.teamB?.name);
  
  useEffect(() => {
    if (open) {
      console.log("Dialog opened - teamALives:", teamALives, "teamBLives:", teamBLives);
      console.log("Full match object:", match);
    }
  }, [open, teamALives, teamBLives, match]);
  
  // Safety check for missing team data
  if (!match.teamA || !match.teamB) {
    console.error("Missing team data in MatchResultDialog");
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Resultado da Partida</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <MatchTeamScore 
            team={match.teamA}
            score={scoreA}
            lives={teamALives}
            onScoreChange={onScoreAChange}
            onLivesUpdate={onTeamALivesUpdate}
            disabled={disabled}
          />
          
          <MatchTeamScore 
            team={match.teamB}
            score={scoreB}
            lives={teamBLives}
            onScoreChange={onScoreBChange}
            onLivesUpdate={onTeamBLivesUpdate}
            disabled={disabled}
          />
          
          <MatchWinnerSelect 
            match={match}
            value={winner}
            onValueChange={onWinnerChange}
            disabled={disabled}
          />
          
          <div className="flex justify-end pt-4">
            <Button onClick={onConfirmResult} disabled={disabled}>
              Confirmar Resultado
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchResultDialog;
