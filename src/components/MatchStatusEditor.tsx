
import React from "react";
import { Match, Team } from "@/lib/types";
import { useMatchStatusEditor } from "@/hooks/useMatchStatusEditor";
import MatchStatusSelector from "@/components/match/MatchStatusSelector";
import MatchResultDialog from "@/components/match/MatchResultDialog";

interface MatchStatusEditorProps {
  match: Match;
  teams?: Team[];
  onSave?: (updatedMatch: Match, updatedTeams: Team[]) => void;
  onUpdateScore?: (matchId: string, team: "A" | "B", score: number) => void;
  onStartMatch?: () => void;
  onCompleteMatch?: () => void;
  onSetWinner?: (matchId: string, team: "A" | "B") => void;
  onDeleteMatch?: () => void;
  disabled?: boolean;
}

export default function MatchStatusEditor({ 
  match, 
  teams = [], 
  onSave, 
  onUpdateScore,
  onStartMatch,
  onCompleteMatch,
  onSetWinner,
  disabled = false 
}: MatchStatusEditorProps) {
  const {
    status,
    scoreA,
    scoreB,
    winner,
    teamALives,
    teamBLives,
    showResultDialog,
    hasTeamNames,
    setShowResultDialog,
    setWinner,
    handleStatusChange,
    handleUpdateTeamLives,
    handleConfirmResult,
    setScoreA,
    setScoreB
  } = useMatchStatusEditor({
    match,
    teams,
    onSave,
    onUpdateScore,
    onStartMatch,
    onCompleteMatch,
    onSetWinner
  });

  return (
    <div className="space-y-4">
      <MatchStatusSelector 
        value={status} 
        onValueChange={handleStatusChange}
        disabled={disabled || !hasTeamNames}
      />

      <MatchResultDialog 
        match={match}
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        scoreA={scoreA}
        scoreB={scoreB}
        teamALives={teamALives}
        teamBLives={teamBLives}
        winner={winner}
        onScoreAChange={(value) => {
          setScoreA(value);
          if (onUpdateScore) {
            onUpdateScore(match.id, 'A', value);
          }
        }}
        onScoreBChange={(value) => {
          setScoreB(value);
          if (onUpdateScore) {
            onUpdateScore(match.id, 'B', value);
          }
        }}
        onTeamALivesUpdate={(increment) => handleUpdateTeamLives('A', increment)}
        onTeamBLivesUpdate={(increment) => handleUpdateTeamLives('B', increment)}
        onWinnerChange={setWinner}
        onConfirmResult={handleConfirmResult}
        disabled={disabled}
      />
    </div>
  );
}
