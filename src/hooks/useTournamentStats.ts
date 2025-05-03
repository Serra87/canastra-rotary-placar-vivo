
import { useMemo } from "react";
import { Tournament, Match, Team } from "@/lib/types";

export function useTournamentStats(tournament: Tournament | null) {
  return useMemo(() => {
    if (!tournament) {
      return {
        totalMatches: 0,
        completedMatches: 0,
        activeTeams: 0,
        eliminatedTeams: 0,
        reenteredTeams: 0,
        currentRound: '',
        completionPercentage: 0,
        averagePoints: 0,
      };
    }

    const { teams, matches, currentRound } = tournament;
    
    // Count different types of teams
    const activeTeams = teams.filter(team => !team.eliminated).length;
    const eliminatedTeams = teams.filter(team => team.eliminated).length;
    const reenteredTeams = teams.filter(team => team.reEntered).length;
    
    // Match statistics
    const totalMatches = matches.length;
    const completedMatches = matches.filter(match => match.completed).length;
    const completionPercentage = totalMatches > 0 
      ? Math.round((completedMatches / totalMatches) * 100) 
      : 0;
    
    // Calculate average points per team
    const totalPoints = teams.reduce((sum, team) => sum + team.totalPoints, 0);
    const averagePoints = teams.length > 0 
      ? Math.round(totalPoints / teams.length) 
      : 0;
    
    // Current round matches
    const currentRoundMatches = matches.filter(match => match.round === currentRound);
    const currentRoundCompleted = currentRoundMatches.filter(match => match.completed).length;
    const currentRoundTotal = currentRoundMatches.length;
    const currentRoundProgress = currentRoundTotal > 0 
      ? Math.round((currentRoundCompleted / currentRoundTotal) * 100) 
      : 0;
      
    return {
      totalMatches,
      completedMatches,
      activeTeams,
      eliminatedTeams,
      reenteredTeams,
      currentRound,
      completionPercentage,
      averagePoints,
      currentRoundMatches: currentRoundTotal,
      currentRoundCompleted,
      currentRoundProgress
    };
  }, [tournament]);
}
