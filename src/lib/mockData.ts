import { Tournament, Team, Match } from "./types";

// Mock Sponsors (example)
export const mockSponsors = [
  { id: "sponsor-1", name: "Canastra Club", logo: "/images/canastra-logo.png" },
  { id: "sponsor-2", name: "Rotary Club", logo: "/images/rotary-logo.png" },
];

// Mock Teams
const team1: Team = {
  id: "team-1",
  name: "Ás de Ouros",
  players: ["João", "Maria"],
  eliminated: false,
  totalPoints: 1500,
  lives: 2,
  reEntered: false,
};

const team2: Team = {
  id: "team-2",
  name: "Copas",
  players: ["José", "Ana"],
  eliminated: false,
  totalPoints: 1200,
  lives: 2,
  reEntered: false,
};

const team3: Team = {
  id: "team-3",
  name: "Espadas",
  players: ["Carlos", "Sofia"],
  eliminated: false,
  totalPoints: 900,
  lives: 2,
  reEntered: false,
};

const team4: Team = {
  id: "team-4",
  name: "Paus",
  players: ["Pedro", "Luisa"],
  eliminated: true,
  totalPoints: 600,
  lives: 0,
  reEntered: false,
};

const team5: Team = {
  id: "team-5",
  name: "Coringas",
  players: ["Ricardo", "Isabel"],
  eliminated: false,
  totalPoints: 750,
  lives: 1,
  reEntered: true,
};

const team6: Team = {
  id: "team-6",
  name: "Ouros",
  players: ["Fernando", "Patricia"],
  eliminated: false,
  totalPoints: 1100,
  lives: 2,
  reEntered: false,
};

const team7: Team = {
  id: "team-7",
  name: "Diamantes",
  players: ["Gustavo", "Camila"],
  eliminated: true,
  totalPoints: 400,
  lives: 0,
  reEntered: false,
};

const team8: Team = {
  id: "team-8",
  name: "Trifos",
  players: ["Lucas", "Juliana"],
  eliminated: false,
  totalPoints: 800,
  lives: 2,
  reEntered: false,
};

// Mock Matches
const match1: Match = {
  id: "match-1",
  teamA: team1,
  teamB: team2,
  scoreA: 150,
  scoreB: 120,
  round: "1",
  completed: true,
  inProgress: false,
  winner: team1,
  tableNumber: 1,
};

const match2: Match = {
  id: "match-2",
  teamA: team3,
  teamB: team4,
  scoreA: 90,
  scoreB: 60,
  round: "1",
  completed: true,
  inProgress: false,
  winner: team3,
  tableNumber: 2,
};

const match3: Match = {
  id: "match-3",
  teamA: team5,
  teamB: team6,
  scoreA: 75,
  scoreB: 110,
  round: "1",
  completed: true,
  inProgress: false,
  winner: team6,
  tableNumber: 3,
};

const match4: Match = {
  id: "match-4",
  teamA: team7,
  teamB: team8,
  scoreA: 40,
  scoreB: 80,
  round: "1",
  completed: true,
  inProgress: false,
  winner: team8,
  tableNumber: 4,
};

const match5: Match = {
  id: "match-5",
  teamA: team1,
  teamB: team6,
  scoreA: 0,
  scoreB: 0,
  round: "2",
  completed: false,
  inProgress: false,
  tableNumber: 1,
};

const match6: Match = {
  id: "match-6",
  teamA: team3,
  teamB: team8,
  scoreA: 0,
  scoreB: 0,
  round: "2",
  completed: false,
  inProgress: false,
  tableNumber: 2,
};

// Mock Tournament
export const mockTournament: Tournament = {
  id: "tournament-1",
  name: "Torneio Rotary Club",
  date: new Date(),
  location: "Clube da Canastra",
  teams: [team1, team2, team3, team4, team5, team6, team7, team8],
  matches: [match1, match2, match3, match4, match5, match6],
  currentRound: "RODADA 2",
  maxRound: 5,
  rules: {
    reentryAllowedUntilRound: 3,
    pointsToWin: 3000,
  },
};

// Modificar a função getRankedTeams para aceitar um torneio como parâmetro opcional
export const getRankedTeams = (tournamentData = mockTournament) => {
  const teamsCopy = [...tournamentData.teams];
  
  // Ordenar por pontos (decrescente) e, em caso de empate, por nome (crescente)
  return teamsCopy.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.name.localeCompare(b.name);
  });
};
