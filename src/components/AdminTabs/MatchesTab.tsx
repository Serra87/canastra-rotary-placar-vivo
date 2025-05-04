
import React, { useState } from "react";
import { Tournament, Match, Team } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useMatchManagement } from "@/hooks/useMatchManagement";
import MatchesTabContent from "./Matches/MatchesTabContent";
import MatchesSkeleton from "./Matches/MatchesSkeleton";
import MatchesHeader from "./Matches/MatchesHeader";
import { toast } from "@/hooks/use-toast";

interface MatchesTabProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
  loading?: boolean;
}

const MatchesTab: React.FC<MatchesTabProps> = ({ tournament, onUpdateTournament, loading = false }) => {
  const currentRoundNumber = parseInt(tournament.currentRound.replace(/\D/g, '') || "1");
  const [processingAction, setProcessingAction] = useState(false);
  
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
    try {
      setProcessingAction(true);
      const nextRoundNumber = currentRoundNumber + 1;
      const nextRound = `RODADA ${nextRoundNumber}`;
      
      console.log(`Advancing to next round: ${nextRound}`);
      
      onUpdateTournament({
        ...tournament,
        currentRound: nextRound,
        maxRound: Math.max(tournament.maxRound || 1, nextRoundNumber)
      });
      
      toast({
        title: "Rodada avançada",
        description: `Avançou para ${nextRound}`,
      });
    } catch (error) {
      console.error("Error advancing to next round:", error);
      toast({
        title: "Erro ao avançar rodada",
        description: "Ocorreu um erro ao tentar avançar para a próxima rodada.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Update match and teams when a match is completed
  const handleSaveMatch = (updatedMatch: Match, updatedTeams: Team[]) => {
    try {
      setProcessingAction(true);
      console.log("Saving match:", updatedMatch.id);
      console.log("Updated match data:", updatedMatch);
      console.log("Updated teams data:", updatedTeams);
      
      // Create new arrays (avoid reference issues)
      const updatedMatches = matches.map(m => 
        m.id === updatedMatch.id ? { ...updatedMatch } : m
      );
      
      // Merge updated teams with existing teams
      const mergedTeams = tournament.teams.map(team => {
        const updatedTeam = updatedTeams.find(t => t.id === team.id);
        return updatedTeam ? { ...updatedTeam } : team;
      });
      
      onUpdateTournament({
        ...tournament,
        matches: updatedMatches,
        teams: mergedTeams
      });
      
      console.log("Match and teams updated successfully");
    } catch (error) {
      console.error("Error saving match:", error);
      toast({
        title: "Erro ao salvar partida",
        description: "Ocorreu um erro ao tentar salvar os dados da partida.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(false);
    }
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
  
  console.log("Current round:", tournament.currentRound);
  console.log("Matches in current round:", currentRoundMatches.length);
  console.log("Has incomplete matches:", hasIncompleteMatches);
  
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
          disabled={processingAction}
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
          disabled={processingAction}
        />
      </CardContent>
    </Card>
  );
};

export default MatchesTab;
