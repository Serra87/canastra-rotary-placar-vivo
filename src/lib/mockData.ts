import { Tournament, Team, Match, Sponsor } from './types';

// Create sponsors
const sponsors: Sponsor[] = [
  { id: '1', name: 'Empresa A', logo: 'logoA.png' },
  { id: '2', name: 'Empresa B', logo: 'logoB.png' },
  { id: '3', name: 'Empresa C', logo: 'logoC.png' },
  { id: '4', name: 'Empresa D', logo: 'logoD.png' },
  { id: '5', name: 'Empresa E', logo: 'logoE.png' },
  { id: '6', name: 'Empresa F', logo: 'logoF.png' },
  { id: '7', name: 'Empresa G', logo: 'logoG.png' },
  { id: '8', name: 'Empresa H', logo: 'logoH.png' },
];

// Create teams
const teams: Team[] = [
  { id: '1', name: 'Time A', players: ['João', 'Maria'], sponsor: sponsors[0], eliminated: false, totalPoints: 2500, lives: 2 },
  { id: '2', name: 'Time B', players: ['Pedro', 'Ana'], sponsor: sponsors[1], eliminated: false, totalPoints: 1800, lives: 1 },
  { id: '3', name: 'Time C', players: ['Carlos', 'Mariana'], sponsor: sponsors[2], eliminated: false, totalPoints: 2200, lives: 2 },
  { id: '4', name: 'Time D', players: ['Rafael', 'Juliana'], sponsor: sponsors[3], eliminated: false, totalPoints: 1900, lives: 3 },
  { id: '5', name: 'Time E', players: ['Gustavo', 'Luciana'], sponsor: sponsors[4], eliminated: false, totalPoints: 2100, lives: 1 },
  { id: '6', name: 'Time F', players: ['Ricardo', 'Camila'], sponsor: sponsors[5], eliminated: false, totalPoints: 1700, lives: 0 },
  { id: '7', name: 'Time G', players: ['Fernando', 'Beatriz'], sponsor: sponsors[6], eliminated: false, totalPoints: 2300, lives: 2 },
  { id: '8', name: 'Time H', players: ['Lucas', 'Isabela'], sponsor: sponsors[7], eliminated: false, totalPoints: 2000, lives: 1 },
];

// Create matches
const matches: Match[] = [
  {
    id: '1',
    teamA: teams[0],
    teamB: teams[1],
    scoreA: 1500,
    scoreB: 1200,
    winner: teams[0],
    phase: 'Quartas de Final',
    tableNumber: 1,
    completed: true,
    inProgress: false,
    startTime: new Date('2025-06-10T09:00:00'),
    endTime: new Date('2025-06-10T10:30:00')
  },
  {
    id: '2',
    teamA: teams[2],
    teamB: teams[3],
    scoreA: 1300,
    scoreB: 1400,
    winner: teams[3],
    phase: 'Quartas de Final',
    tableNumber: 2,
    completed: true,
    inProgress: false,
    startTime: new Date('2025-06-10T09:00:00'),
    endTime: new Date('2025-06-10T10:15:00')
  },
  {
    id: '3',
    teamA: teams[4],
    teamB: teams[5],
    scoreA: 1600,
    scoreB: 1100,
    winner: teams[4],
    phase: 'Quartas de Final',
    tableNumber: 3,
    completed: true,
    inProgress: false,
    startTime: new Date('2025-06-10T10:45:00'),
    endTime: new Date('2025-06-10T12:00:00')
  },
  {
    id: '4',
    teamA: teams[6],
    teamB: teams[7],
    scoreA: 900,
    scoreB: 1800,
    winner: teams[7],
    phase: 'Quartas de Final',
    tableNumber: 4,
    completed: true,
    inProgress: false,
    startTime: new Date('2025-06-10T10:45:00'),
    endTime: new Date('2025-06-10T12:15:00')
  },
  {
    id: '5',
    teamA: teams[0],
    teamB: teams[3],
    scoreA: 1200,
    scoreB: 1000,
    phase: 'Semi-Final',
    tableNumber: 1,
    completed: false,
    inProgress: true,
    startTime: new Date('2025-06-10T14:00:00')
  },
  {
    id: '6',
    teamA: teams[4],
    teamB: teams[7],
    scoreA: 0,
    scoreB: 0,
    phase: 'Semi-Final',
    tableNumber: 2,
    completed: false,
    inProgress: false,
    startTime: new Date('2025-06-10T14:00:00')
  },
  {
    id: '7',
    teamA: { id: '', name: '?', players: ['?', '?'], sponsor: { id: '', name: '' }, eliminated: false, totalPoints: 0 },
    teamB: { id: '', name: '?', players: ['?', '?'], sponsor: { id: '', name: '' }, eliminated: false, totalPoints: 0 },
    scoreA: 0,
    scoreB: 0,
    phase: 'Final',
    tableNumber: 1,
    completed: false,
    inProgress: false
  }
];

// Create tournament
export const mockTournament: Tournament = {
  id: '1',
  name: 'Torneio Empresarial de Canastra – Rotary 2025',
  date: new Date('2025-06-10'),
  location: 'Sede do Rotary Club',
  teams,
  matches,
  currentPhase: 'Semi-Final',
  rules: {
    initialLives: 3,
    pointsToWin: 1500
  }
};

// Sort teams by total points
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
