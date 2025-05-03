
import React from "react";
import { Button } from "@/components/ui/button";
import ManualMatchCreator from "@/components/ManualMatchCreator";
import { Match, Team } from "@/lib/types";

interface MatchesHeaderProps {
  teams: Team[];
  currentRoundNumber: number;
  existingMatches: Match[];
  currentRound: string;
  onAddMatch: (match: Match) => void;
  onNextRound: () => void;
  hasIncompleteMatches: boolean;
}

const MatchesHeader: React.FC<MatchesHeaderProps> = ({
  teams,
  currentRoundNumber,
  existingMatches,
  currentRound,
  onAddMatch,
  onNextRound,
  hasIncompleteMatches,
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Gerenciar Partidas</h2>
      <div className="space-x-2">
        <ManualMatchCreator
          teams={teams}
          roundNumber={currentRoundNumber}
          existingMatches={existingMatches}
          onCreateMatch={onAddMatch}
          currentRound={currentRound}
        />
        <Button
          onClick={onNextRound}
          disabled={hasIncompleteMatches}
          title={hasIncompleteMatches ? "Finalize todas as partidas da rodada atual antes de avançar" : ""}
        >
          Próxima Rodada
        </Button>
      </div>
    </div>
  );
};

export default MatchesHeader;
