
import { useState } from "react";
import { Match, Team } from "@/lib/types";
import { useMatchesByRound } from "@/hooks/useMatchesByRound";
import { useMatchScoreManagement } from "@/hooks/useMatchScoreManagement";
import { useMatchCreationDeletion } from "@/hooks/useMatchCreationDeletion";

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

  // Use the refactored hooks
  const { matchesByRound, rounds } = useMatchesByRound(matches);
  
  const { 
    handleUpdateScore,
    handleStartMatch,
    handleCompleteMatch,
    handleSetWinner
  } = useMatchScoreManagement({ 
    matches, 
    onUpdateMatches: (updatedMatches) => {
      setMatches(updatedMatches);
      if (onUpdateMatches) {
        onUpdateMatches(updatedMatches);
      }
    }
  });
  
  const {
    handleAddManualMatch,
    handleDeleteMatch
  } = useMatchCreationDeletion({
    matches,
    onUpdateMatches: (updatedMatches) => {
      setMatches(updatedMatches);
      if (onUpdateMatches) {
        onUpdateMatches(updatedMatches);
      }
    }
  });

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
