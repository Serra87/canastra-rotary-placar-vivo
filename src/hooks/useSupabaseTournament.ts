
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
    in_progress: match.inProgress,  // Fixed: Using in_progress instead of inProgress for the Supabase format
    start_time: match.startTime ? match.startTime.toISOString() : null,
    end_time: match.endTime ? match.endTime.toISOString() : null
  };
};

// Function to convert a Supabase match to local format with complete team references
export const supabaseToMatch = (match: SupabaseMatch, teamsMap: Record<string, Team>): Match => {
  // Create default "bye" team for null references
  const byeTeam: Team = { 
    id: 'bye', 
    name: 'Bye', 
    players: ['', ''] as [string, string], 
    eliminated: false, 
    totalPoints: 0, 
    lives: 0, 
    reEntered: false 
  };

  // Use the complete team objects from teamsMap to ensure all properties are available
  const teamA = match.team_a_id && teamsMap[match.team_a_id] 
    ? structuredClone(teamsMap[match.team_a_id]) // Use structuredClone for deep copy
    : structuredClone(byeTeam);

  const teamB = match.team_b_id && teamsMap[match.team_b_id] 
    ? structuredClone(teamsMap[match.team_b_id]) // Use structuredClone for deep copy
    : structuredClone(byeTeam);

  // For winner, also make sure to get the full team object
  const winner = match.winner_id && teamsMap[match.winner_id] 
    ? structuredClone(teamsMap[match.winner_id]) // Use structuredClone for deep copy
    : undefined;

  // Log to debug team references
  console.log(`Match ${match.id} loaded with teamA ${teamA.id} (${teamA.name}), teamB ${teamB.id} (${teamB.name})`);
  if (winner) {
    console.log(`Match winner: ${winner.id} (${winner.name})`);
  }

  // Create the match with complete team references and ensure all fields are properly set
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
    inProgress: match.in_progress, // Fixed: Using in_progress from Supabase for our inProgress field
    startTime: match.start_time ? new Date(match.start_time) : undefined,
    endTime: match.end_time ? new Date(match.end_time) : undefined
  };
};
