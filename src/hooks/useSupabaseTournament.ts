
import { useState, useEffect } from 'react';
import { Match, Team, Tournament } from "@/lib/types";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { generateUUID } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

// Define SupabaseMatch type based on the database table structure
export type SupabaseMatch = Tables<"matches">;
export type SupabaseTeam = Tables<"teams">;
export type SupabaseTournament = Tables<"tournaments">;

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

// Convert Supabase team to app Team format
const supabaseToTeam = (supabaseTeam: SupabaseTeam): Team => {
  return {
    id: supabaseTeam.id,
    name: supabaseTeam.name,
    players: [supabaseTeam.player1, supabaseTeam.player2],
    eliminated: supabaseTeam.eliminated,
    totalPoints: supabaseTeam.total_points,
    lives: supabaseTeam.lives,
    reEntered: supabaseTeam.reentered
  };
};

// Convert app Team to Supabase format
const teamToSupabase = (team: Team, tournamentId?: string): Omit<SupabaseTeam, "id" | "created_at" | "updated_at"> => {
  return {
    name: team.name,
    player1: team.players[0],
    player2: team.players[1],
    eliminated: team.eliminated,
    total_points: team.totalPoints,
    lives: team.lives,
    reentered: team.reEntered,
    tournament_id: tournamentId
  };
};

// Convert Supabase tournament to app Tournament format
const supabaseToTournament = (
  supabaseTournament: SupabaseTournament, 
  teams: Team[], 
  matches: Match[]
): Tournament => {
  return {
    id: supabaseTournament.id,
    name: supabaseTournament.name,
    date: new Date(supabaseTournament.date),
    location: supabaseTournament.location,
    currentRound: supabaseTournament.current_round,
    maxRound: supabaseTournament.max_round,
    teams: teams,
    matches: matches,
    rules: {
      reentryAllowedUntilRound: supabaseTournament.reentry_allowed_until_round,
      pointsToWin: supabaseTournament.points_to_win
    }
  };
};

// Export the hook with the correct function signatures
export const useSupabaseTournament = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch tournament data on component mount
  useEffect(() => {
    async function fetchTournamentData() {
      try {
        // Start by fetching the most recent tournament
        const { data: tournamentData, error: tournamentError } = await supabase
          .from("tournaments")
          .select("*")
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (tournamentError) {
          console.error("Error fetching tournament:", tournamentError);
          if (tournamentError.code !== 'PGRST116') { // Not found error
            setError(new Error(tournamentError.message));
          }
          setLoading(false);
          return;
        }

        if (!tournamentData) {
          console.log("No tournament found");
          setLoading(false);
          return;
        }

        console.log("Found tournament:", tournamentData.id);

        // Fetch teams for this tournament
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("*")
          .eq("tournament_id", tournamentData.id);

        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
          setError(new Error(teamsError.message));
          setLoading(false);
          return;
        }

        // Convert Supabase teams to app format
        const teams = teamsData.map(supabaseToTeam);

        // Fetch matches for this tournament
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select("*")
          .eq("tournament_id", tournamentData.id);

        if (matchesError) {
          console.error("Error fetching matches:", matchesError);
          setError(new Error(matchesError.message));
          setLoading(false);
          return;
        }

        // Convert Supabase matches to app format
        const matches = matchesData.map(m => supabaseToMatch(m, teams));

        // Create full tournament object
        const fullTournament = supabaseToTournament(tournamentData, teams, matches);
        
        console.log("Tournament loaded successfully:", fullTournament.id);
        setTournament(fullTournament);
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error in fetchTournamentData:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }

    fetchTournamentData();
  }, []);

  const createTournament = async (newTournament: Tournament): Promise<boolean | void> => {
    try {
      setLoading(true);
      
      // Create tournament record
      const tournamentData = {
        name: newTournament.name,
        date: newTournament.date.toISOString(),
        location: newTournament.location,
        current_round: newTournament.currentRound,
        max_round: newTournament.maxRound,
        points_to_win: newTournament.rules?.pointsToWin || 3000,
        reentry_allowed_until_round: newTournament.rules?.reentryAllowedUntilRound || 5
      };

      const { data: createdTournament, error: tournamentError } = await supabase
        .from("tournaments")
        .insert(tournamentData)
        .select()
        .single();

      if (tournamentError) {
        console.error("Error creating tournament:", tournamentError);
        setError(new Error(tournamentError.message));
        setLoading(false);
        return false;
      }

      if (!createdTournament) {
        setError(new Error("Failed to create tournament - no data returned"));
        setLoading(false);
        return false;
      }

      const tournamentId = createdTournament.id;
      console.log("Created tournament with ID:", tournamentId);

      // Create teams if any
      if (newTournament.teams && newTournament.teams.length > 0) {
        const teamsToInsert = newTournament.teams.map(team => 
          teamToSupabase(team, tournamentId)
        );

        const { error: teamsError } = await supabase
          .from("teams")
          .insert(teamsToInsert);

        if (teamsError) {
          console.error("Error creating teams:", teamsError);
          setError(new Error(teamsError.message));
        }
      }

      // Create matches if any
      if (newTournament.matches && newTournament.matches.length > 0) {
        const matchesToInsert = newTournament.matches.map(match => 
          matchToSupabase(match, tournamentId)
        );

        const { error: matchesError } = await supabase
          .from("matches")
          .insert(matchesToInsert);

        if (matchesError) {
          console.error("Error creating matches:", matchesError);
          setError(new Error(matchesError.message));
        }
      }

      // Fetch the complete tournament data with teams and matches
      // This is to ensure we have all the newly created data with their IDs
      const { data: tournamentData, error: fetchError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();

      if (fetchError || !tournamentData) {
        console.error("Error fetching created tournament:", fetchError);
        setLoading(false);
        return true; // Still return true as we did create the tournament
      }

      // Fetch teams
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .eq("tournament_id", tournamentId);

      const teams = teamsData?.map(supabaseToTeam) || [];

      // Fetch matches
      const { data: matchesData } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId);

      const matches = matchesData?.map(m => supabaseToMatch(m, teams)) || [];

      // Create full tournament object
      const fullTournament = supabaseToTournament(tournamentData, teams, matches);
      
      setTournament(fullTournament);
      setLoading(false);
      
      toast({
        title: "Torneio criado com sucesso",
        description: `${fullTournament.name} foi criado com ${teams.length} equipes.`,
      });
      
      return true;
    } catch (err) {
      console.error("Error in createTournament:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
      return false;
    }
  };

  const updateTournament = async (updatedTournament: Tournament): Promise<boolean | void> => {
    try {
      if (!updatedTournament.id) {
        throw new Error("Cannot update tournament without ID");
      }

      setLoading(true);
      
      // Update tournament record
      const tournamentData = {
        name: updatedTournament.name,
        date: updatedTournament.date.toISOString(),
        location: updatedTournament.location,
        current_round: updatedTournament.currentRound,
        max_round: updatedTournament.maxRound,
        points_to_win: updatedTournament.rules?.pointsToWin || 3000,
        reentry_allowed_until_round: updatedTournament.rules?.reentryAllowedUntilRound || 5
      };

      const { error: tournamentError } = await supabase
        .from("tournaments")
        .update(tournamentData)
        .eq("id", updatedTournament.id);

      if (tournamentError) {
        console.error("Error updating tournament:", tournamentError);
        setError(new Error(tournamentError.message));
        setLoading(false);
        return false;
      }

      const tournamentId = updatedTournament.id;

      // Handle teams updates
      if (updatedTournament.teams && updatedTournament.teams.length > 0) {
        // Fetch existing teams
        const { data: existingTeams } = await supabase
          .from("teams")
          .select("id")
          .eq("tournament_id", tournamentId);
        
        const existingTeamIds = new Set(existingTeams?.map(t => t.id) || []);
        
        // Process each team - update existing, insert new
        for (const team of updatedTournament.teams) {
          const teamData = teamToSupabase(team, tournamentId);
          
          if (existingTeamIds.has(team.id)) {
            // Update existing team
            await supabase.from("teams").update(teamData).eq("id", team.id);
          } else {
            // Insert new team
            await supabase.from("teams").insert({...teamData, id: team.id});
          }
        }
      }

      // Handle matches updates
      if (updatedTournament.matches && updatedTournament.matches.length > 0) {
        // Fetch existing matches
        const { data: existingMatches } = await supabase
          .from("matches")
          .select("id")
          .eq("tournament_id", tournamentId);
        
        const existingMatchIds = new Set(existingMatches?.map(m => m.id) || []);
        
        // Process each match - update existing, insert new
        for (const match of updatedTournament.matches) {
          const matchData = matchToSupabase(match, tournamentId);
          
          if (existingMatchIds.has(match.id)) {
            // Update existing match
            await supabase.from("matches").update(matchData).eq("id", match.id);
          } else {
            // Insert new match
            await supabase.from("matches").insert({...matchData, id: match.id});
          }
        }
      }

      // Fetch updated tournament data to return
      const { data: refreshedTournamentData, error: refreshError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();

      if (refreshError) {
        console.error("Error refreshing tournament data:", refreshError);
        setLoading(false);
        return true; // Still return true as we did update the tournament
      }

      // Fetch updated teams
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .eq("tournament_id", tournamentId);

      const teams = teamsData?.map(supabaseToTeam) || [];

      // Fetch updated matches
      const { data: matchesData } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId);

      const matches = matchesData?.map(m => supabaseToMatch(m, teams)) || [];

      // Create full tournament object
      const fullTournament = supabaseToTournament(refreshedTournamentData, teams, matches);
      
      setTournament(fullTournament);
      setLoading(false);
      
      return true;
    } catch (err) {
      console.error("Error in updateTournament:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
      return false;
    }
  };

  const resetTournament = async (): Promise<boolean> => {
    try {
      if (!tournament?.id) {
        console.error("Cannot reset tournament: No tournament loaded");
        return false;
      }

      setLoading(true);
      const tournamentId = tournament.id;

      // Delete all matches for this tournament
      const { error: matchesError } = await supabase
        .from("matches")
        .delete()
        .eq("tournament_id", tournamentId);

      if (matchesError) {
        console.error("Error deleting matches:", matchesError);
        setError(new Error(matchesError.message));
        setLoading(false);
        return false;
      }

      // Delete all teams for this tournament
      const { error: teamsError } = await supabase
        .from("teams")
        .delete()
        .eq("tournament_id", tournamentId);

      if (teamsError) {
        console.error("Error deleting teams:", teamsError);
        setError(new Error(teamsError.message));
        setLoading(false);
        return false;
      }

      // Reset tournament to initial state
      const resetData = {
        current_round: "RODADA 1",
        max_round: 1
      };

      const { error: resetError } = await supabase
        .from("tournaments")
        .update(resetData)
        .eq("id", tournamentId);

      if (resetError) {
        console.error("Error resetting tournament:", resetError);
        setError(new Error(resetError.message));
        setLoading(false);
        return false;
      }

      // Create a reset tournament object with no teams or matches
      const resetTournament = {
        ...tournament,
        teams: [],
        matches: [],
        currentRound: "RODADA 1",
        maxRound: 1
      };

      setTournament(resetTournament);
      setLoading(false);

      toast({
        title: "Torneio resetado com sucesso",
        description: "Todos os times e partidas foram removidos.",
      });

      return true;
    } catch (err) {
      console.error("Error in resetTournament:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
      return false;
    }
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
