
import React from "react";
import { Match, Team } from "@/lib/types";
import MatchStatusEditor from "@/components/MatchStatusEditor";

interface AllRoundsMatchesListProps {
  rounds: string[];
  matchesByRound: Record<string, Match[]>;
  teams: Team[];
  currentRound: string;
  onSaveMatch: (match: Match, updatedTeams: Team[]) => void;
  onUpdateScore: (matchId: string, team: "A" | "B", score: number) => void;
  onStartMatch: (matchId: string) => void;
  onCompleteMatch: (matchId: string) => void;
  onSetWinner: (matchId: string, team: "A" | "B") => void;
  onDeleteMatch: (matchId: string) => void;
  disabled?: boolean;
  maxRound?: number;
  showAllPossibleRounds?: boolean;
}

const AllRoundsMatchesList: React.FC<AllRoundsMatchesListProps> = ({
  rounds,
  matchesByRound,
  teams,
  currentRound,
  onSaveMatch,
  onUpdateScore,
  onStartMatch,
  onCompleteMatch,
  onSetWinner,
  onDeleteMatch,
  disabled = false,
  maxRound = 1,
  showAllPossibleRounds = true // Default to show all rounds
}) => {
  // Generate all possible rounds if showAllPossibleRounds is true
  const displayRounds = showAllPossibleRounds 
    ? Array.from({ length: maxRound }, (_, i) => `RODADA ${i + 1}`)
    : rounds;
  
  if (displayRounds.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">
          Nenhuma rodada ou partida encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {displayRounds.map(round => (
        <div key={round} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{round}</h3>
            {round === currentRound && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Rodada Atual
              </span>
            )}
          </div>
          
          {(matchesByRound[round] || []).map(match => (
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
              disabled={disabled} // Remove restriction to only edit current round matches
            />
          ))}
          
          {/* Show a message when there are no matches in a round but it's shown because of showAllPossibleRounds */}
          {showAllPossibleRounds && (!matchesByRound[round] || matchesByRound[round].length === 0) && (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-400 text-sm">
                Nenhuma partida nesta rodada. 
                {round !== currentRound ? " Crie partidas manualmente para esta rodada." : ""}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AllRoundsMatchesList;
