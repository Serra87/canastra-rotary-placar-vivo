
import { Tournament, Team, Match } from "@/lib/types";

// Define type for the context
export interface TournamentContextType {
  tournament: Tournament;
  updateTournament: (updatedTournament: Tournament) => void;
  rankedTeams: Tournament['teams'];
  resetTournament: () => void;
  loading: boolean;
  isUpdating: boolean;
  error: Error | null;
  stats: any; // Using any for now to avoid circular import with the stats hook
}

// Storage key constant is now moved to utils.ts
