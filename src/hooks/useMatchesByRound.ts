
import { Match } from "@/lib/types";
import { useState, useEffect } from "react";

interface UseMatchesByRoundResult {
  matchesByRound: Record<string, Match[]>;
  rounds: string[];
  allPossibleRounds: string[];
}

/**
 * Hook for grouping matches by round and sorting rounds
 */
export const useMatchesByRound = (matches: Match[], maxRoundNumber = 1): UseMatchesByRoundResult => {
  const [matchesByRound, setMatchesByRound] = useState<Record<string, Match[]>>({});
  const [rounds, setRounds] = useState<string[]>([]);
  const [allPossibleRounds, setAllPossibleRounds] = useState<string[]>([]);
  
  useEffect(() => {
    // Group matches by round
    const groupedMatches: Record<string, Match[]> = {};
    matches.forEach(match => {
      if (!match.round) {
        console.warn("Match without round found:", match.id);
        return;
      }
      
      // Ensure all rounds are formatted consistently
      const roundKey = match.round.startsWith("RODADA") ? match.round : `RODADA ${match.round}`;
      
      if (!groupedMatches[roundKey]) {
        groupedMatches[roundKey] = [];
      }
      groupedMatches[roundKey].push(match);
    });
    
    // Generate all possible rounds based on maxRoundNumber
    const possibleRounds = Array.from({ length: maxRoundNumber }, (_, i) => `RODADA ${i + 1}`);
    setAllPossibleRounds(possibleRounds);
    
    // Ensure all potential rounds have entries in the object, even if empty
    possibleRounds.forEach(round => {
      if (!groupedMatches[round]) {
        groupedMatches[round] = [];
      }
    });
    
    // Get all rounds in order, including empty ones
    const sortedRounds = Object.keys(groupedMatches).sort((a, b) => {
      const aNum = parseInt(a.replace(/\D/g, '') || "1");
      const bNum = parseInt(b.replace(/\D/g, '') || "1");
      return aNum - bNum;
    });
    
    console.log("Current round:", possibleRounds);
    console.log("Matches in current round:", groupedMatches[possibleRounds[possibleRounds.length - 1]]?.length || 0);
    console.log("Has incomplete matches:", false);
    
    setMatchesByRound(groupedMatches);
    setRounds(sortedRounds);
  }, [matches, maxRoundNumber]);
  
  return { matchesByRound, rounds, allPossibleRounds };
};
