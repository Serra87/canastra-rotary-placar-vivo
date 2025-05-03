
import { useState, useEffect } from "react";
import { Tournament, Team, Match } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SupabaseTournament {
  id: string;
  name: string;
  date: string;
  location: string;
  current_round: string;
  max_round: number;
  reentry_allowed_until_round: number;
  points_to_win: number;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseTeam {
  id: string;
  tournament_id: string;
  name: string;
  player1: string;
  player2: string;
  eliminated: boolean;
  total_points: number;
  lives: number;
  reEntered: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseMatch {
  id: string;
  tournament_id: string;
  team_a_id: string | null;
  team_b_id: string | null;
  score_a: number;
  score_b: number;
  winner_id: string | null;
  round: string;
  table_number: number | null;
  completed: boolean;
  in_progress: boolean;
  start_time: string | null;
  end_time: string | null;
  created_at?: string;
  updated_at?: string;
}

// Function to convert a tournament to Supabase format
export const tournamentToSupabase = (tournament: Tournament): Omit<SupabaseTournament, 'id' | 'created_at' | 'updated_at'> => {
  return {
    name: tournament.name,
    date: tournament.date.toISOString(),
    location: tournament.location,
    current_round: tournament.currentRound,
    max_round: tournament.maxRound,
    reentry_allowed_until_round: tournament.rules?.reentryAllowedUntilRound || 5,
    points_to_win: tournament.rules?.pointsToWin || 3000,
  };
};

// Function to convert a Supabase tournament to local format
export const supabaseToTournament = (tournament: SupabaseTournament, teams: Team[] = [], matches: Match[] = []): Tournament => {
  return {
    id: tournament.id,
    name: tournament.name,
    date: new Date(tournament.date),
    location: tournament.location,
    teams,
    matches,
    currentRound: tournament.current_round,
    maxRound: tournament.max_round,
    rules: {
      reentryAllowedUntilRound: tournament.reentry_allowed_until_round,
      pointsToWin: tournament.points_to_win
    }
  };
};

// Function to convert a team to Supabase format
export const teamToSupabase = (team: Team, tournamentId: string): Omit<SupabaseTeam, 'id' | 'created_at' | 'updated_at'> => {
  return {
    tournament_id: tournamentId,
    name: team.name,
    player1: team.players[0],
    player2: team.players[1],
    eliminated: team.eliminated,
    total_points: team.totalPoints,
    lives: team.lives,
    reEntered: team.reEntered
  };
};

// Function to convert a Supabase team to local format
export const supabaseToTeam = (team: SupabaseTeam): Team => {
  return {
    id: team.id,
    name: team.name,
    players: [team.player1, team.player2] as [string, string],
    eliminated: team.eliminated,
    totalPoints: team.total_points,
    lives: team.lives,
    reEntered: team.reEntered
  };
};

// Function to convert a match to Supabase format
export const matchToSupabase = (
  match: Match, 
  tournamentId: string,
  teamMap: Record<string, string> // Maps local team IDs to Supabase team IDs
): Omit<SupabaseMatch, 'id' | 'created_at' | 'updated_at'> => {
  return {
    tournament_id: tournamentId,
    team_a_id: match.teamA.id === 'bye' ? null : teamMap[match.teamA.id],
    team_b_id: match.teamB.id === 'bye' ? null : teamMap[match.teamB.id],
    score_a: match.scoreA,
    score_b: match.scoreB,
    winner_id: match.winner ? teamMap[match.winner.id] || null : null,
    round: match.round,
    table_number: match.tableNumber || null,
    completed: match.completed,
    in_progress: match.inProgress,
    start_time: match.startTime ? match.startTime.toISOString() : null,
    end_time: match.endTime ? match.endTime.toISOString() : null
  };
};

// Function to convert a Supabase match to local format
export const supabaseToMatch = (match: SupabaseMatch, teams: Record<string, Team>): Match => {
  const teamA = match.team_a_id ? teams[match.team_a_id] : { 
    id: 'bye', 
    name: 'Bye', 
    players: ['', ''] as [string, string], 
    eliminated: false, 
    totalPoints: 0, 
    lives: 0, 
    reEntered: false 
  };

  const teamB = match.team_b_id ? teams[match.team_b_id] : { 
    id: 'bye', 
    name: 'Bye', 
    players: ['', ''] as [string, string], 
    eliminated: false, 
    totalPoints: 0, 
    lives: 0, 
    reEntered: false 
  };

  const winner = match.winner_id ? teams[match.winner_id] : undefined;

  return {
    id: match.id,
    teamA,
    teamB,
    scoreA: match.score_a,
    scoreB: match.score_b,
    winner,
    round: match.round,
    tableNumber: match.table_number || undefined,
    completed: match.completed,
    inProgress: match.in_progress,
    startTime: match.start_time ? new Date(match.start_time) : undefined,
    endTime: match.end_time ? new Date(match.end_time) : undefined
  };
};

export const useSupabaseTournament = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const { toast } = useToast();

  // Function to fetch the active tournament
  const fetchTournament = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the most recently created tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (tournamentError) {
        setError(new Error(tournamentError.message));
        toast({
          title: "Erro ao carregar torneio",
          description: tournamentError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!tournamentData) {
        setLoading(false);
        return;
      }

      // Fetch teams for this tournament
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentData.id)
        .order('name', { ascending: true });

      if (teamsError) {
        setError(new Error(teamsError.message));
        toast({
          title: "Erro ao carregar times",
          description: teamsError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create teams map to use when building matches
      const teams: Record<string, Team> = {};
      const localTeams: Team[] = teamsData.map(team => {
        const localTeam = supabaseToTeam(team);
        teams[team.id] = localTeam;
        return localTeam;
      });

      // Fetch matches for this tournament
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentData.id);

      if (matchesError) {
        setError(new Error(matchesError.message));
        toast({
          title: "Erro ao carregar partidas",
          description: matchesError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Convert matches to local format
      const localMatches: Match[] = matchesData.map(match => 
        supabaseToMatch(match, teams)
      );

      // Build the complete tournament object
      const completeTournament = supabaseToTournament(
        tournamentData, 
        localTeams, 
        localMatches
      );

      setTournament(completeTournament);
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Erro desconhecido ao carregar o torneio');
      setError(error);
      toast({
        title: "Erro ao carregar torneio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to save a new tournament
  const createTournament = async (tournamentData: Tournament) => {
    try {
      setLoading(true);
      setError(null);

      // Insert tournament
      const { data: newTournament, error: tournamentError } = await supabase
        .from('tournaments')
        .insert(tournamentToSupabase(tournamentData))
        .select('*')
        .single();

      if (tournamentError || !newTournament) {
        throw new Error(tournamentError?.message || 'Erro ao criar torneio');
      }

      // Tournament created successfully, now let's insert teams
      const teamInserts = tournamentData.teams.map(team => 
        teamToSupabase(team, newTournament.id)
      );

      if (teamInserts.length > 0) {
        const { data: newTeams, error: teamsError } = await supabase
          .from('teams')
          .insert(teamInserts)
          .select('*');

        if (teamsError) {
          throw new Error(`Erro ao criar times: ${teamsError.message}`);
        }

        // Create mapping from local team IDs to Supabase team IDs
        const teamMap: Record<string, string> = {};
        newTeams?.forEach((newTeam, index) => {
          teamMap[tournamentData.teams[index].id] = newTeam.id;
        });

        // Now insert matches if there are any
        if (tournamentData.matches.length > 0) {
          const matchInserts = tournamentData.matches.map(match => 
            matchToSupabase(match, newTournament.id, teamMap)
          );

          const { error: matchesError } = await supabase
            .from('matches')
            .insert(matchInserts);

          if (matchesError) {
            throw new Error(`Erro ao criar partidas: ${matchesError.message}`);
          }
        }
      }

      toast({
        title: "Torneio criado",
        description: "Torneio criado com sucesso no banco de dados",
      });

      // Fetch the newly created tournament with all related data
      await fetchTournament();
      
      return true;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Erro desconhecido ao criar o torneio');
      setError(error);
      toast({
        title: "Erro ao criar torneio",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to update an existing tournament
  const updateTournament = async (tournamentData: Tournament) => {
    try {
      setLoading(true);
      setError(null);

      if (!tournamentData.id) {
        throw new Error('ID do torneio não fornecido');
      }

      // Update tournament
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .update({
          name: tournamentData.name,
          date: tournamentData.date.toISOString(),
          location: tournamentData.location,
          current_round: tournamentData.currentRound,
          max_round: tournamentData.maxRound,
          reentry_allowed_until_round: tournamentData.rules?.reentryAllowedUntilRound || 5,
          points_to_win: tournamentData.rules?.pointsToWin || 3000,
          updated_at: new Date().toISOString()
        })
        .eq('id', tournamentData.id);

      if (tournamentError) {
        throw new Error(`Erro ao atualizar torneio: ${tournamentError.message}`);
      }

      // Get existing teams from Supabase for this tournament
      const { data: existingTeams, error: existingTeamsError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('tournament_id', tournamentData.id);

      if (existingTeamsError) {
        throw new Error(`Erro ao buscar times existentes: ${existingTeamsError.message}`);
      }

      // Create mappings for team IDs
      const existingTeamMap = new Map();
      existingTeams?.forEach(team => {
        existingTeamMap.set(team.name, team.id);
      });

      const teamIdMap: Record<string, string> = {};

      // Process each team: insert new ones, update existing ones
      for (const team of tournamentData.teams) {
        if (existingTeamMap.has(team.name)) {
          // Team exists, update it
          const supabaseTeamId = existingTeamMap.get(team.name);
          teamIdMap[team.id] = supabaseTeamId;

          const { error: teamUpdateError } = await supabase
            .from('teams')
            .update({
              name: team.name,
              player1: team.players[0],
              player2: team.players[1],
              eliminated: team.eliminated,
              total_points: team.totalPoints,
              lives: team.lives,
              reEntered: team.reEntered,
              updated_at: new Date().toISOString()
            })
            .eq('id', supabaseTeamId);

          if (teamUpdateError) {
            throw new Error(`Erro ao atualizar time ${team.name}: ${teamUpdateError.message}`);
          }
        } else {
          // Team doesn't exist, insert it
          const { data: insertedTeam, error: teamInsertError } = await supabase
            .from('teams')
            .insert(teamToSupabase(team, tournamentData.id))
            .select('*')
            .single();

          if (teamInsertError || !insertedTeam) {
            throw new Error(`Erro ao criar time ${team.name}: ${teamInsertError?.message}`);
          }

          teamIdMap[team.id] = insertedTeam.id;
        }
      }

      // Get existing matches from Supabase for this tournament
      const { data: existingMatches, error: existingMatchesError } = await supabase
        .from('matches')
        .select('id, round')
        .eq('tournament_id', tournamentData.id);

      if (existingMatchesError) {
        throw new Error(`Erro ao buscar partidas existentes: ${existingMatchesError.message}`);
      }

      // Delete existing matches (we'll reinsert all matches)
      if (existingMatches && existingMatches.length > 0) {
        const { error: deleteMatchesError } = await supabase
          .from('matches')
          .delete()
          .eq('tournament_id', tournamentData.id);

        if (deleteMatchesError) {
          throw new Error(`Erro ao excluir partidas existentes: ${deleteMatchesError.message}`);
        }
      }

      // Insert all matches
      if (tournamentData.matches.length > 0) {
        const matchInserts = tournamentData.matches.map(match => 
          matchToSupabase(match, tournamentData.id, teamIdMap)
        );

        const { error: matchesInsertError } = await supabase
          .from('matches')
          .insert(matchInserts);

        if (matchesInsertError) {
          throw new Error(`Erro ao inserir partidas: ${matchesInsertError.message}`);
        }
      }

      toast({
        title: "Torneio atualizado",
        description: "Alterações salvas no banco de dados",
      });

      // Fetch the updated tournament with all related data
      await fetchTournament();
      
      return true;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Erro desconhecido ao atualizar o torneio');
      setError(error);
      toast({
        title: "Erro ao atualizar torneio",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to reset a tournament
  const resetTournament = async (tournamentId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Delete all matches
      const { error: matchesDeleteError } = await supabase
        .from('matches')
        .delete()
        .eq('tournament_id', tournamentId);

      if (matchesDeleteError) {
        throw new Error(`Erro ao excluir partidas: ${matchesDeleteError.message}`);
      }

      // Delete all teams
      const { error: teamsDeleteError } = await supabase
        .from('teams')
        .delete()
        .eq('tournament_id', tournamentId);

      if (teamsDeleteError) {
        throw new Error(`Erro ao excluir times: ${teamsDeleteError.message}`);
      }

      // Update tournament to reset round data
      const { error: tournamentUpdateError } = await supabase
        .from('tournaments')
        .update({
          current_round: 'RODADA 1',
          max_round: 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', tournamentId);

      if (tournamentUpdateError) {
        throw new Error(`Erro ao resetar torneio: ${tournamentUpdateError.message}`);
      }

      toast({
        title: "Torneio resetado",
        description: "Todas as partidas e times foram removidos",
      });

      // Fetch the reset tournament
      await fetchTournament();
      
      return true;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Erro desconhecido ao resetar o torneio');
      setError(error);
      toast({
        title: "Erro ao resetar torneio",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load tournament on initial mount
  useEffect(() => {
    fetchTournament();
  }, []);

  return {
    tournament,
    loading,
    error,
    fetchTournament,
    createTournament,
    updateTournament,
    resetTournament,
  };
};
