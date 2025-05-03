
import React from "react";
import { Tournament, Match, Team } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useMatchManagement } from "@/hooks/useMatchManagement";
import MatchesTabContent from "./Matches/MatchesTabContent";
import MatchesSkeleton from "./Matches/MatchesSkeleton";
import MatchesHeader from "./Matches/MatchesHeader";

interface MatchesTabProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
  loading?: boolean;
}

const MatchesTab: React.FC<MatchesTabProps> = ({ tournament, onUpdateTournament, loading = false }) => {
  const currentRoundNumber = parseInt(tournament.currentRound.replace(/\D/g, '') || "1");
  
  // Use the match management hook to handle match operations
  const {
    matches,
    matchesByRound,
    rounds,
    handleAddManualMatch,
    handleUpdateScore,
    handleStartMatch,
    handleCompleteMatch,
    handleSetWinner,
    handleDeleteMatch
  } = useMatchManagement({
    initialMatches: tournament.matches,
    teams: tournament.teams,
    onUpdateMatches: (updatedMatches) => {
      onUpdateTournament({
        ...tournament,
        matches: updatedMatches
      });
    },
    currentRoundNumber
  });

  // Handler for advancing to the next round
  const handleNextRound = () => {
    const nextRoundNumber = currentRoundNumber + 1;
    const nextRound = `RODADA ${nextRoundNumber}`;
    
    onUpdateTournament({
      ...tournament,
      currentRound: nextRound,
      maxRound: Math.max(tournament.maxRound || 1, nextRoundNumber)
    });
  };
  
  // Update match and teams when a match is completed
  const handleSaveMatch = (updatedMatch: Match, updatedTeams: Team[]) => {
    const updatedMatches = matches.map(m => 
      m.id === updatedMatch.id ? updatedMatch : m
    );
    
    onUpdateTournament({
      ...tournament,
      matches: updatedMatches,
      teams: updatedTeams
    });
  };
  
  // If loading, show skeleton UI
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <MatchesSkeleton />
        </CardHeader>
      </Card>
    );
  }
  
  // Check if there are any incomplete matches in the current round
  const currentRoundMatches = matchesByRound[tournament.currentRound] || [];
  const hasIncompleteMatches = currentRoundMatches.some(match => !match.completed);
  
  return (
    <Card>
      <CardHeader>
        <MatchesHeader 
          teams={tournament.teams}
          currentRoundNumber={currentRoundNumber}
          existingMatches={tournament.matches}
          currentRound={tournament.currentRound}
          onAddMatch={handleAddManualMatch}
          onNextRound={handleNextRound}
          hasIncompleteMatches={hasIncompleteMatches}
        />
      </CardHeader>
      <CardContent>
        <MatchesTabContent
          tournament={tournament}
          matchesByRound={matchesByRound}
          rounds={rounds}
          onSaveMatch={handleSaveMatch}
          onUpdateScore={handleUpdateScore}
          onStartMatch={handleStartMatch}
          onCompleteMatch={handleCompleteMatch}
          onSetWinner={handleSetWinner}
          onDeleteMatch={handleDeleteMatch}
        />
      </CardContent>
    </Card>
  );
};

export default MatchesTab;
