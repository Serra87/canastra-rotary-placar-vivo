
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
  disabled?: boolean;
  maxRoundNumber?: number; // New prop for max round number
  adminMode?: boolean; // New prop for admin mode
}

const MatchesHeader: React.FC<MatchesHeaderProps> = ({
  teams,
  currentRoundNumber,
  existingMatches,
  currentRound,
  onAddMatch,
  onNextRound,
  hasIncompleteMatches,
  disabled = false,
  maxRoundNumber = 1,
  adminMode = false,
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">
        Gerenciar Partidas 
        {adminMode && <span className="text-amber-500 ml-2">(Modo Admin)</span>}
      </h2>
      <div className="space-x-2">
        <ManualMatchCreator
          teams={teams}
          roundNumber={currentRoundNumber}
          existingMatches={existingMatches}
          onCreateMatch={onAddMatch}
          currentRound={currentRound}
          disabled={disabled}
        />
        <Button
          onClick={onNextRound}
          disabled={hasIncompleteMatches || disabled}
          title={hasIncompleteMatches ? (adminMode ? "Avançando mesmo com partidas incompletas (modo admin)" : "Finalize todas as partidas da rodada atual antes de avançar") : ""}
          variant={adminMode && hasIncompleteMatches ? "destructive" : "default"}
        >
          {adminMode && hasIncompleteMatches ? "Forçar Próxima Rodada" : "Próxima Rodada"}
        </Button>
      </div>
    </div>
  );
};

export default MatchesHeader;
