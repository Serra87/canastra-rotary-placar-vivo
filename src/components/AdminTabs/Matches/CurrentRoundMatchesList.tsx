
import React from "react";
import { Match, Team } from "@/lib/types";
import MatchStatusEditor from "@/components/MatchStatusEditor";

interface CurrentRoundMatchesListProps {
  matches: Match[];
  teams: Team[];
  onSaveMatch: (match: Match, updatedTeams: Team[]) => void;
  onUpdateScore: (matchId: string, team: "A" | "B", score: number) => void;
  onStartMatch: (matchId: string) => void;
  onCompleteMatch: (matchId: string) => void;
  onSetWinner: (matchId: string, team: "A" | "B") => void;
  onDeleteMatch: (matchId: string) => void;
}

const CurrentRoundMatchesList: React.FC<CurrentRoundMatchesListProps> = ({
  matches,
  teams,
  onSaveMatch,
  onUpdateScore,
  onStartMatch,
  onCompleteMatch,
  onSetWinner,
  onDeleteMatch,
}) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">
          Nenhuma partida encontrada para esta rodada.
          <br />
          Use o botão "Criar Partida Manual" para adicionar partidas.
        </p>
      </div>
    );
  }

  return (
    <>
      {matches.map(match => (
        <MatchStatusEditor
          key={match.id}
          match={match}
          teams={teams}
          onSave={onSaveMatch}
          onUpdateScore={(matchId, team, score) => onUpdateScore(matchId, team, score)}
          onStartMatch={() => onStartMatch(match.id)}
          onCompleteMatch={() => onCompleteMatch(match.id)}
          onSetWinner={onSetWinner}
          onDeleteMatch={() => onDeleteMatch(match.id)}
        />
      ))}
    </>
  );
};

export default CurrentRoundMatchesList;
