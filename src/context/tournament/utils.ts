
import { Team, Match } from "@/lib/types";

// Function to ensure a date is a Date object
export const ensureDateObject = (dateValue: string | Date): Date => {
  if (dateValue instanceof Date) return dateValue;
  try {
    return new Date(dateValue);
  } catch (error) {
    console.error("Erro ao converter data:", error);
    return new Date();
  }
};

// Function to create a map of teams for quick lookup
export const createTeamsMap = (teams: Team[]): Record<string, Team> => {
  const teamsMap: Record<string, Team> = {};
  teams.forEach(team => {
    teamsMap[team.id] = team;
  });
  return teamsMap;
};

// Function to sync team references in matches
export const syncTeamReferencesInMatches = (matches: Match[], teamsMap: Record<string, Team>): Match[] => {
  return matches.map(match => {
    // Get updated team references
    const updatedTeamA = match.teamA.id !== 'bye' && teamsMap[match.teamA.id] 
      ? { ...teamsMap[match.teamA.id] } 
      : match.teamA;
    
    const updatedTeamB = match.teamB.id !== 'bye' && teamsMap[match.teamB.id] 
      ? { ...teamsMap[match.teamB.id] } 
      : match.teamB;
    
    const updatedWinner = match.winner && teamsMap[match.winner.id] 
      ? { ...teamsMap[match.winner.id] } 
      : match.winner;
    
    // Return match with updated references
    return {
      ...match,
      teamA: updatedTeamA,
      teamB: updatedTeamB,
      winner: updatedWinner
    };
  });
};

// Helper to get ranked teams by points
export const getRankedTeams = (tournamentData: Tournament): Tournament['teams'] => {
  const teamsCopy = [...tournamentData.teams];
  
  // Sort by points (descending) and by name (ascending) in case of a tie
  return teamsCopy.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.name.localeCompare(b.name);
  });
};

// Function to check for teams playing multiple matches in the same round
export const checkTeamsInSameRound = (matches: Match[]): boolean => {
  const matchesByRound: Record<string, string[]> = {};
  
  matches.forEach(match => {
    if (!match.round) return;
    
    const roundKey = match.round.startsWith("RODADA") ? match.round : `RODADA ${match.round}`;
    if (!matchesByRound[roundKey]) {
      matchesByRound[roundKey] = [];
    }
    
    matchesByRound[roundKey].push(match.teamA.id, match.teamB.id);
  });
  
  // Check each round for duplicate team IDs
  let hasDuplicates = false;
  Object.entries(matchesByRound).forEach(([round, teamIds]) => {
    const uniqueTeamIds = new Set(teamIds);
    if (uniqueTeamIds.size < teamIds.length) {
      console.warn(`AVISO: Há equipes jogando múltiplas partidas na ${round}`);
      hasDuplicates = true;
    }
  });
  
  return hasDuplicates;
};
