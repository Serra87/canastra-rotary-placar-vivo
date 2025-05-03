
import { Match, Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UseMatchCreationDeletionProps {
  matches: Match[];
  onUpdateMatches?: (matches: Match[]) => void;
}

interface UseMatchCreationDeletionResult {
  handleAddManualMatch: (newMatch: Match) => Match;
  handleDeleteMatch: (matchId: string) => void;
}

export const useMatchCreationDeletion = ({
  matches,
  onUpdateMatches
}: UseMatchCreationDeletionProps): UseMatchCreationDeletionResult => {
  const { toast } = useToast();

  // Handle adding a manual match
  const handleAddManualMatch = (newMatch: Match) => {
    // Ensure round format is consistent
    if (newMatch.round && !newMatch.round.startsWith("RODADA")) {
      newMatch.round = `RODADA ${newMatch.round}`;
    }
    
    const updatedMatches = [...matches, newMatch];
    
    // Sync with parent
    if (onUpdateMatches) {
      onUpdateMatches(updatedMatches);
    }
    
    toast({
      title: "Partida criada manualmente",
      description: `${newMatch.teamA.name} vs ${newMatch.teamB.name} adicionada à rodada ${newMatch.round}`,
      variant: "default"
    });
    
    return newMatch;
  };

  // Handle match deletion
  const handleDeleteMatch = (matchId: string) => {
    const updatedMatches = matches.filter(match => match.id !== matchId);
    
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
    handleAddManualMatch,
    handleDeleteMatch
  };
};
