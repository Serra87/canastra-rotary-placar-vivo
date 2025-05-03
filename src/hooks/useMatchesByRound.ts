
import { Match } from "@/lib/types";
import { useState, useEffect } from "react";

interface UseMatchesByRoundResult {
  matchesByRound: Record<string, Match[]>;
  rounds: string[];
}

/**
 * Hook for grouping matches by round and sorting rounds
 */
export const useMatchesByRound = (matches: Match[]): UseMatchesByRoundResult => {
  const [matchesByRound, setMatchesByRound] = useState<Record<string, Match[]>>({});
  const [rounds, setRounds] = useState<string[]>([]);
  
  useEffect(() => {
    // Group matches by round
    const groupedMatches: Record<string, Match[]> = {};
    matches.forEach(match => {
      if (!match.round) return; // Skip matches without a round
      
      // Ensure all rounds are formatted consistently
      const roundKey = match.round.startsWith("RODADA") ? match.round : `RODADA ${match.round}`;
      
      if (!groupedMatches[roundKey]) {
        groupedMatches[roundKey] = [];
      }
      groupedMatches[roundKey].push(match);
    });
    
    // Get all rounds in order
    const sortedRounds = Object.keys(groupedMatches).sort((a, b) => {
      const aNum = parseInt(a.replace(/\D/g, '') || "1");
      const bNum = parseInt(b.replace(/\D/g, '') || "1");
      return aNum - bNum;
    });
    
    setMatchesByRound(groupedMatches);
    setRounds(sortedRounds);
  }, [matches]);
  
  return { matchesByRound, rounds };
};
