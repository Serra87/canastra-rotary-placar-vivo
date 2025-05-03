
import { Tournament, Team, Match, Sponsor } from './types';

// Create empty sponsors array
const sponsors: Sponsor[] = [];

// Create empty teams array
const teams: Team[] = [];

// Create empty matches array
const matches: Match[] = [];

// Create tournament with empty data
export const mockTournament: Tournament = {
  id: '1',
  name: 'Torneio Empresarial de Canastra – Rotary 2025',
  date: new Date('2025-06-10'),
  location: 'Sede do Rotary Club',
  teams,
  matches,
  currentRound: 'RODADA 1',
  maxRound: 1,
  rules: {
    reentryAllowedUntilRound: 5,
    pointsToWin: 1500
  }
};

// Utility functions that now return empty arrays
export const getRankedTeams = () => {
  return [...teams].sort((a, b) => b.totalPoints - a.totalPoints).map((team, index) => ({
    ...team,
    rank: index + 1
  }));
};

// Get active matches (in progress)
export const getActiveMatches = () => {
  return matches.filter(match => match.inProgress);
};

// Get upcoming matches
export const getUpcomingMatches = () => {
  return matches.filter(match => !match.completed && !match.inProgress);
};

// Get completed matches
export const getCompletedMatches = () => {
  return matches.filter(match => match.completed);
};
