
import { useState } from "react";
import { Match, Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UseMatchScoreManagementProps {
  matches: Match[];
  onUpdateMatches?: (matches: Match[]) => void;
}

interface UseMatchScoreManagementResult {
  handleUpdateScore: (matchId: string, team: 'A' | 'B', score: number) => void;
  handleStartMatch: (matchId: string) => void;
  handleCompleteMatch: (matchId: string) => { updatedMatches: Match[], winner?: Team, loser?: Team } | undefined;
  handleSetWinner: (matchId: string, team: 'A' | 'B') => { updatedMatches: Match[], winner: Team, loser: Team } | undefined;
}

export const useMatchScoreManagement = ({
  matches,
  onUpdateMatches
}: UseMatchScoreManagementProps): UseMatchScoreManagementResult => {
  const { toast } = useToast();
  const [internalMatches, setInternalMatches] = useState<Match[]>(matches);

  // Update match score
  const handleUpdateScore = (matchId: string, team: 'A' | 'B', score: number) => {
    const updatedMatches = internalMatches.map(match => {
      if (match.id === matchId) {
        if (team === 'A') {
          return { ...match, scoreA: score };
        } else {
          return { ...match, scoreB: score };
        }
      }
      return match;
    });
    
    setInternalMatches(updatedMatches);
    
    // Sync with parent
    if (onUpdateMatches) {
      onUpdateMatches(updatedMatches);
    }
  };

  // Start match
  const handleStartMatch = (matchId: string) => {
    const updatedMatches = internalMatches.map(match => {
      if (match.id === matchId) {
        return { ...match, inProgress: true };
      }
      return match;
    });
    
    setInternalMatches(updatedMatches);
    
    // Sync with parent
    if (onUpdateMatches) {
      onUpdateMatches(updatedMatches);
    }
    
    toast({
      title: "Partida iniciada",
      description: "Atualize o placar conforme necessário.",
    });
  };

  // Complete match
  const handleCompleteMatch = (matchId: string) => {
    const matchIndex = internalMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    
    const match = internalMatches[matchIndex];
    
    // Determine winner
    let winner: Team | undefined;
    if (match.scoreA > match.scoreB) {
      winner = match.teamA;
    } else if (match.scoreB > match.scoreA) {
      winner = match.teamB;
    }
    
    // Update match with winner
    const updatedMatches = [...internalMatches];
    updatedMatches[matchIndex] = {
      ...match,
      winner,
      completed: true,
      inProgress: false
    };
    
    setInternalMatches(updatedMatches);
    
    // Sync with parent
    if (onUpdateMatches) {
      onUpdateMatches(updatedMatches);
    }
    
    toast({
      title: "Partida finalizada",
      description: `Vencedor: ${winner ? winner.name : 'Empate - Defina um vencedor!'}`,
      variant: winner ? "default" : "destructive"
    });
    
    return { 
      updatedMatches, 
      winner, 
      loser: winner ? (winner.id === match.teamA.id ? match.teamB : match.teamA) : undefined 
    };
  };

  // Set winner manually
  const handleSetWinner = (matchId: string, team: 'A' | 'B') => {
    const matchIndex = internalMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    
    const match = internalMatches[matchIndex];
    const winner = team === 'A' ? match.teamA : match.teamB;
    const loser = team === 'A' ? match.teamB : match.teamA;
    
    // Update match with winner
    const updatedMatches = [...internalMatches];
    updatedMatches[matchIndex] = {
      ...match,
      winner,
      completed: true,
      inProgress: false
    };
    
    setInternalMatches(updatedMatches);
    
    // Sync with parent
    if (onUpdateMatches) {
      onUpdateMatches(updatedMatches);
    }
    
    toast({
      title: "Vencedor definido",
      description: `${winner.name} venceu a partida.`,
      variant: "default"
    });
    
    return { updatedMatches, winner, loser };
  };

  return {
    handleUpdateScore,
    handleStartMatch,
    handleCompleteMatch,
    handleSetWinner
  };
};
