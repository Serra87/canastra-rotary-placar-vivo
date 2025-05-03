
import { useState } from "react";
import { Match, Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UseMatchManagementProps {
  initialMatches: Match[];
  teams: Team[];
  onUpdateMatches?: (matches: Match[]) => void;
  currentRoundNumber: number;
}

export const useMatchManagement = ({
  initialMatches,
  teams,
  onUpdateMatches,
  currentRoundNumber,
}: UseMatchManagementProps) => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const { toast } = useToast();

  // Group matches by round
  const matchesByRound: Record<string, Match[]> = {};
  matches.forEach(match => {
    if (!match.round) return; // Skip matches without a round
    
    const roundNumber = parseInt(match.round.replace(/\D/g, '') || "1");
    const roundKey = `RODADA ${roundNumber}`;
    
    if (!matchesByRound[roundKey]) {
      matchesByRound[roundKey] = [];
    }
    matchesByRound[roundKey].push(match);
  });

  // Get all rounds in order
  const rounds = Object.keys(matchesByRound).sort((a, b) => {
    const aNum = parseInt(a.replace(/\D/g, '') || "1");
    const bNum = parseInt(b.replace(/\D/g, '') || "1");
    return aNum - bNum;
  });

  // Handle adding a manual match
  const handleAddManualMatch = (newMatch: Match) => {
    const updatedMatches = [...matches, newMatch];
    setMatches(updatedMatches);
    
    // Sync with parent
    if (onUpdateMatches) {
      onUpdateMatches(updatedMatches);
    }
    
    toast({
      title: "Partida criada manualmente",
      description: `${newMatch.teamA.name} vs ${newMatch.teamB.name} adicionada à rodada ${currentRoundNumber}`,
      variant: "default"
    });
  };

  // Update match score
  const handleUpdateScore = (matchId: string, team: 'A' | 'B', score: number) => {
    const updatedMatches = matches.map(match => {
      if (match.id === matchId) {
        if (team === 'A') {
          return { ...match, scoreA: score };
        } else {
          return { ...match, scoreB: score };
        }
      }
      return match;
    });
    
    setMatches(updatedMatches);
    
    // Sync with parent
    if (onUpdateMatches) {
      onUpdateMatches(updatedMatches);
    }
  };

  // Start match
  const handleStartMatch = (matchId: string) => {
    const updatedMatches = matches.map(match => {
      if (match.id === matchId) {
        return { ...match, inProgress: true };
      }
      return match;
    });
    
    setMatches(updatedMatches);
    
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
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    
    const match = matches[matchIndex];
    
    // Determine winner
    let winner: Team | undefined;
    if (match.scoreA > match.scoreB) {
      winner = match.teamA;
    } else if (match.scoreB > match.scoreA) {
      winner = match.teamB;
    }
    
    // Update match with winner
    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = {
      ...match,
      winner,
      completed: true,
      inProgress: false
    };
    
    setMatches(updatedMatches);
    
    toast({
      title: "Partida finalizada",
      description: `Vencedor: ${winner ? winner.name : 'Empate - Defina um vencedor!'}`,
      variant: winner ? "default" : "destructive"
    });
    
    return { updatedMatches, winner, loser: winner ? (winner.id === match.teamA.id ? match.teamB : match.teamA) : undefined };
  };

  // Set winner manually
  const handleSetWinner = (matchId: string, team: 'A' | 'B') => {
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    
    const match = matches[matchIndex];
    const winner = team === 'A' ? match.teamA : match.teamB;
    const loser = team === 'A' ? match.teamB : match.teamA;
    
    // Update match with winner
    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = {
      ...match,
      winner,
      completed: true,
      inProgress: false
    };
    
    setMatches(updatedMatches);
    
    toast({
      title: "Vencedor definido",
      description: `${winner.name} venceu a partida.`,
      variant: "default"
    });
    
    return { updatedMatches, winner, loser };
  };

  // Handle match deletion
  const handleDeleteMatch = (matchId: string) => {
    const updatedMatches = matches.filter(match => match.id !== matchId);
    setMatches(updatedMatches);
    
    // Sync with parent
    if (onUpdateMatches) {
      onUpdateMatches(updatedMatches);
    }
    
    toast({
      title: "Partida removida",
      description: "A partida foi excluída com sucesso.",
      variant: "default",
    });
  };

  return {
    matches,
    setMatches,
    matchesByRound,
    rounds,
    handleAddManualMatch,
    handleUpdateScore,
    handleStartMatch,
    handleCompleteMatch,
    handleSetWinner,
    handleDeleteMatch
  };
};
