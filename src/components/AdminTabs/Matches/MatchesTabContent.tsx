
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tournament, Match, Team } from "@/lib/types";
import CurrentRoundMatchesList from "./CurrentRoundMatchesList";
import AllRoundsMatchesList from "./AllRoundsMatchesList";

interface MatchesTabContentProps {
  tournament: Tournament;
  matchesByRound: Record<string, Match[]>;
  rounds: string[];
  onSaveMatch: (match: Match, updatedTeams: Team[]) => void;
  onUpdateScore: (matchId: string, team: "A" | "B", score: number) => void;
  onStartMatch: (matchId: string) => void;
  onCompleteMatch: (matchId: string) => void;
  onSetWinner: (matchId: string, team: "A" | "B") => void;
  onDeleteMatch: (matchId: string) => void;
  disabled?: boolean;
}

const MatchesTabContent: React.FC<MatchesTabContentProps> = ({
  tournament,
  matchesByRound,
  rounds,
  onSaveMatch,
  onUpdateScore,
  onStartMatch,
  onCompleteMatch,
  onSetWinner,
  onDeleteMatch,
  disabled = false
}) => {
  const currentRoundMatches = matchesByRound[tournament.currentRound] || [];
  
  return (
    <Tabs defaultValue="current">
      <TabsList className="mb-4">
        <TabsTrigger value="current">Rodada Atual</TabsTrigger>
        <TabsTrigger value="all">Todas Rodadas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="current">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{tournament.currentRound}</h3>
          </div>
          
          <CurrentRoundMatchesList
            matches={currentRoundMatches}
            teams={tournament.teams}
            onSaveMatch={onSaveMatch}
            onUpdateScore={onUpdateScore}
            onStartMatch={onStartMatch}
            onCompleteMatch={onCompleteMatch}
            onSetWinner={onSetWinner}
            onDeleteMatch={onDeleteMatch}
            disabled={disabled}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="all">
        <AllRoundsMatchesList
          rounds={rounds}
          matchesByRound={matchesByRound}
          teams={tournament.teams}
          currentRound={tournament.currentRound}
          onSaveMatch={onSaveMatch}
          onUpdateScore={onUpdateScore}
          onStartMatch={onStartMatch}
          onCompleteMatch={onCompleteMatch}
          onSetWinner={onSetWinner}
          onDeleteMatch={onDeleteMatch}
          disabled={disabled}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MatchesTabContent;
