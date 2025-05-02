
export interface Sponsor {
  id: string;
  name: string;
  logo?: string;
}

export interface Team {
  id: string;
  name: string;
  players: [string, string]; // Canasta is played in pairs
  sponsor: Sponsor;
  eliminated: boolean;
  rank?: number;
  totalPoints: number;
  lives: number; // Number of lives remaining for the team
  reEntered: boolean; // Flag to indicate if the team has been re-entered after elimination
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  winner?: Team;
  round: string; // Changed from phase to round
  tableNumber?: number;
  completed: boolean;
  inProgress: boolean;
  startTime?: Date;
  endTime?: Date;
}

export interface Tournament {
  id: string;
  name: string;
  date: Date;
  location: string;
  teams: Team[];
  matches: Match[];
  currentRound: string; // Changed from currentPhase to currentRound
  maxRound: number; // Track the highest round number
  rules?: {
    initialLives: number;
    reentryAllowedUntilRound: number;
    pointsToWin: number;
  };
}

export type User = {
  id: string;
  username: string;
  role: 'admin' | 'viewer';
};
