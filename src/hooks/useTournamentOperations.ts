
import { useState } from 'react';
import { Tournament, Team } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ensureDateObject, createTeamsMap, syncTeamReferencesInMatches, checkTeamsInSameRound, getRankedTeams } from '@/context/tournament/utils';

interface UseTournamentOperationsProps {
  tournament: Tournament;
  setTournament: (tournament: Tournament) => void;
  setRankedTeams: (teams: Tournament['teams']) => void;
  optimisticUpdate: (updated: Tournament, original: Tournament) => Promise<boolean>;
  resetSupabaseTournament: (id: string) => Promise<boolean>;
  clearCache: () => void;
}

export const useTournamentOperations = ({
  tournament,
  setTournament,
  setRankedTeams,
  optimisticUpdate,
  resetSupabaseTournament,
  clearCache
}: UseTournamentOperationsProps) => {
  const [localError, setLocalError] = useState<Error | null>(null);

  // Function to update tournament
  const updateTournament = async (updatedTournament: Tournament) => {
    try {
      console.log("Atualizando torneio:", updatedTournament.id);
      
      // Create a deep copy to avoid reference issues
      const tournamentCopy = JSON.parse(JSON.stringify(updatedTournament));
      
      // Ensure date is valid
      tournamentCopy.date = ensureDateObject(tournamentCopy.date);
      
      // Ensure teams have correct life limits
      if (tournamentCopy.teams) {
        tournamentCopy.teams = tournamentCopy.teams.map(team => ({
          ...team,
          lives: Math.max(0, Math.min(team.reEntered ? 1 : 2, team.lives)),
        }));
      }
      
      // Create team map for quick reference
      const teamsMap = createTeamsMap(tournamentCopy.teams);
      
      // Ensure match references use the latest team data
      if (tournamentCopy.matches && tournamentCopy.teams) {
        tournamentCopy.matches = tournamentCopy.matches.map(match => {
          // Find current team references
          const currentTeamA = match.teamA.id !== 'bye' ? teamsMap[match.teamA.id] : match.teamA;
          const currentTeamB = match.teamB.id !== 'bye' ? teamsMap[match.teamB.id] : match.teamB;
          const currentWinner = match.winner ? teamsMap[match.winner.id] : undefined;
          
          if (!currentTeamA || !currentTeamB) {
            console.error(`Referência de time ausente na partida ${match.id}`, 
                         {teamA_id: match.teamA.id, teamB_id: match.teamB.id});
          }
            
          // Update team data in match
          return {
            ...match,
            teamA: currentTeamA ? { 
              ...currentTeamA
            } : match.teamA,
            teamB: currentTeamB ? {
              ...currentTeamB
            } : match.teamB,
            winner: currentWinner
          };
        });
      }
      
      // Check for teams in multiple matches in the same round
      checkTeamsInSameRound(tournamentCopy.matches);
      
      // Update tournament state optimistically
      setTournament(tournamentCopy);
      
      // Update ranked teams
      const newRankedTeams = getRankedTeams(tournamentCopy);
      setRankedTeams(newRankedTeams);

      // Start optimistic update to server
      const originalTournament = tournament;
      await optimisticUpdate(tournamentCopy, originalTournament);
      
      console.log("Torneio atualizado e sincronizado com o banco de dados");
    } catch (error) {
      console.error("Erro ao atualizar torneio:", error);
      setLocalError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações no banco de dados.",
        variant: "destructive"
      });
    }
  };

  // Function to reset tournament
  const resetTournament = async () => {
    try {
      console.log("Iniciando reset do torneio...");

      // Reset tournament in Supabase if it exists
      if (tournament.id) {
        console.log(`Resetando torneio no Supabase com ID: ${tournament.id}`);
        const success = await resetSupabaseTournament(tournament.id);
        
        if (!success) {
          throw new Error("Falha ao resetar torneio no Supabase");
        }
        
        // Clear cache and localStorage
        clearCache();
        try {
          localStorage.removeItem("rotary-tournament");
        } catch (error) {
          console.error("Erro ao limpar localStorage:", error);
        }
      } else {
        console.error("Tentativa de resetar torneio sem ID");
        throw new Error("Torneio não possui ID válido");
      }
      
      console.log("Torneio resetado com sucesso");
      
      // Show confirmation
      toast({
        title: "Torneio resetado com sucesso",
        description: "Todos os times e rodadas foram removidos",
      });
    } catch (error) {
      console.error("Erro ao resetar torneio:", error);
      setLocalError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Erro ao resetar",
        description: "Não foi possível resetar o torneio no banco de dados.",
        variant: "destructive"
      });
    }
  };

  return {
    updateTournament,
    resetTournament,
    error: localError
  };
};
