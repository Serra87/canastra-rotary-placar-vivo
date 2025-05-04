
import { useState } from 'react';
import { Match, Team, Tournament } from "@/lib/types";
import { Tables } from "@/integrations/supabase/types";

// Define SupabaseMatch type based on the database table structure
export type SupabaseMatch = Tables<"matches">;

// Function to convert a match to Supabase format
export const matchToSupabase = (
  match: Match,
  tournamentId?: string
): Omit<SupabaseMatch, "id" | "created_at" | "updated_at"> => {
  return {
    team_a_id: match.teamA.id,
    team_b_id: match.teamB.id,
    score_a: match.scoreA,
    score_b: match.scoreB,
    winner_id: match.winner?.id,
    round: match.round,
    table_number: match.tableNumber || null,
    completed: match.completed,
    in_progress: match.inProgress,
    start_time: match.startTime?.toISOString() || null,
    end_time: match.endTime?.toISOString() || null,
    tournament_id: tournamentId || null, // Add the tournament_id field
  };
};

// Function to convert a Supabase match to our app's Match format
export const supabaseToMatch = (
  supabaseMatch: SupabaseMatch,
  teams: Team[]
): Match => {
  const teamA = teams.find((team) => team.id === supabaseMatch.team_a_id);
  const teamB = teams.find((team) => team.id === supabaseMatch.team_b_id);
  const winner = teams.find((team) => team.id === supabaseMatch.winner_id);

  if (!teamA || !teamB) {
    console.error(
      `Team not found for match ${supabaseMatch.id}: A=${supabaseMatch.team_a_id}, B=${supabaseMatch.team_b_id}`
    );
  }

  return {
    id: supabaseMatch.id,
    teamA: teamA || { id: supabaseMatch.team_a_id, name: "Unknown Team A", players: ["", ""], eliminated: false, totalPoints: 0, lives: 2, reEntered: false },
    teamB: teamB || { id: supabaseMatch.team_b_id, name: "Unknown Team B", players: ["", ""], eliminated: false, totalPoints: 0, lives: 2, reEntered: false },
    scoreA: supabaseMatch.score_a,
    scoreB: supabaseMatch.score_b,
    winner: winner,
    round: supabaseMatch.round,
    tableNumber: supabaseMatch.table_number || undefined,
    completed: supabaseMatch.completed,
    inProgress: supabaseMatch.in_progress,
    startTime: supabaseMatch.start_time ? new Date(supabaseMatch.start_time) : undefined,
    endTime: supabaseMatch.end_time ? new Date(supabaseMatch.end_time) : undefined,
  };
};

// Export the hook with the correct function signatures
export const useSupabaseTournament = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const createTournament = async (newTournament: Tournament): Promise<boolean | void> => {
    console.log("Creating tournament:", newTournament);
    return true; // Return boolean instead of the Tournament
  };

  const updateTournament = async (updatedTournament: Tournament): Promise<boolean | void> => {
    console.log("Updating tournament:", updatedTournament);
    return true; // Return boolean instead of the Tournament
  };

  const resetTournament = async (): Promise<boolean> => {
    console.log("Resetting tournament");
    return true;
  };

  return {
    tournament,
    loading,
    error,
    createTournament,
    updateTournament,
    resetTournament
  };
};
