
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Tournament } from "@/lib/types";
import { mockTournament, getRankedTeams } from "@/lib/mockData";
import { useSupabaseTournament } from "@/hooks/useSupabaseTournament";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";
import { useTournamentCache } from "@/hooks/useTournamentCache";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";
import { useTournamentStats } from "@/hooks/useTournamentStats";

// Constante para o storage key (mantida como fallback)
const TOURNAMENT_STORAGE_KEY = "rotary-tournament";

// Define o tipo para o contexto
interface TournamentContextType {
  tournament: Tournament;
  updateTournament: (updatedTournament: Tournament) => void;
  rankedTeams: ReturnType<typeof getRankedTeams>;
  resetTournament: () => void;
  loading: boolean;
  isUpdating: boolean;
  error: Error | null;
  stats: ReturnType<typeof useTournamentStats>;
}

// Criar o contexto
const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// Função auxiliar para garantir que a data seja um objeto Date
const ensureDateObject = (dateValue: string | Date): Date => {
  if (dateValue instanceof Date) return dateValue;
  try {
    return new Date(dateValue);
  } catch (error) {
    console.error("Erro ao converter data:", error);
    return new Date();
  }
};

// Carregar torneio do localStorage como fallback
const loadSavedTournament = (): Tournament => {
  try {
    const savedTournament = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
    if (savedTournament) {
      const parsed = JSON.parse(savedTournament);
      // Garantir que a data seja um objeto Date
      return {
        ...parsed,
        date: ensureDateObject(parsed.date)
      };
    }
  } catch (error) {
    console.error("Erro ao carregar torneio do localStorage:", error);
  }
  
  // Fallback para o mock tournament
  return {
    ...mockTournament,
    date: ensureDateObject(mockTournament.date)
  };
};

// Provedor do contexto
export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Hook do Supabase para gerenciamento do torneio
  const { 
    tournament: supabaseTournament, 
    loading, 
    error: supabaseError, 
    createTournament, 
    updateTournament: updateSupabaseTournament,
    resetTournament: resetSupabaseTournament
  } = useSupabaseTournament();

  // Inicializar com dados do localStorage ou mock como fallback
  const [tournament, setTournament] = useState<Tournament>(loadSavedTournament);
  const [rankedTeams, setRankedTeams] = useState(getRankedTeams(tournament));
  const [error, setError] = useState<Error | null>(null);
  
  // Usar o hook de estatísticas
  const stats = useTournamentStats(tournament);
  
  // Usar cache para o torneio
  const { cachedTournament, clearCache } = useTournamentCache(supabaseTournament, {
    onError: (err) => console.error("Cache error:", err)
  });
  
  // Usar atualizações otimistas
  const { isUpdating, update: optimisticUpdate } = useOptimisticUpdate<Tournament>({
    onUpdate: async (updatedTournament) => {
      if (updatedTournament.id) {
        return await updateSupabaseTournament(updatedTournament);
      } else {
        return await createTournament(updatedTournament);
      }
    },
    onError: (err, originalData) => {
      setError(err instanceof Error ? err : new Error(String(err)));
      // Reverter para os dados originais em caso de erro
      setTournament(originalData);
      toast({
        title: "Erro ao salvar alterações",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });
  
  // Quando o torneio do Supabase é carregado, atualiza o state local
  useEffect(() => {
    if (supabaseTournament) {
      setTournament(supabaseTournament);
      setRankedTeams(getRankedTeams(supabaseTournament));
      clearCache(); // Limpar o cache após carregar dados reais do servidor
    } else if (!loading && cachedTournament) {
      // Se não há dados do Supabase e não está carregando, use o cache
      setTournament(cachedTournament);
      setRankedTeams(getRankedTeams(cachedTournament));
    }
  }, [supabaseTournament, loading, cachedTournament]);

  // Efeito para exibir erros de carregamento
  useEffect(() => {
    if (supabaseError) {
      setError(supabaseError);
      toast({
        title: "Erro no banco de dados",
        description: supabaseError.message,
        variant: "destructive"
      });
    }
  }, [supabaseError]);

  // Função para atualizar o torneio
  const updateTournament = async (updatedTournament: Tournament) => {
    try {
      // Criar uma cópia profunda para evitar problemas de referência
      const tournamentCopy = JSON.parse(JSON.stringify(updatedTournament));
      
      // Assegura que a data é um objeto Date válido após a deserialização
      tournamentCopy.date = ensureDateObject(tournamentCopy.date);
      
      // Garantir que as equipes tenham limites de vidas corretos
      if (tournamentCopy.teams) {
        tournamentCopy.teams = tournamentCopy.teams.map(team => ({
          ...team,
          lives: Math.max(0, Math.min(team.reEntered ? 1 : 2, team.lives)), // Garante vidas entre 0 e máximo permitido (1 ou 2)
        }));
      }
      
      // Garantir que as referências das partidas usem os dados mais recentes das equipes
      if (tournamentCopy.matches && tournamentCopy.teams) {
        tournamentCopy.matches = tournamentCopy.matches.map(match => {
          // Encontra as referências mais recentes das equipes
          const currentTeamA = tournamentCopy.teams.find(t => t.id === match.teamA.id);
          const currentTeamB = tournamentCopy.teams.find(t => t.id === match.teamB.id);
          const currentWinner = match.winner ? 
            tournamentCopy.teams.find(t => t.id === match.winner?.id) : undefined;
            
          // Atualiza os dados das equipes incorporados na partida para garantir consistência
          return {
            ...match,
            teamA: currentTeamA ? { 
              ...match.teamA, 
              lives: currentTeamA.lives,
              eliminated: currentTeamA.eliminated,
              reEntered: currentTeamA.reEntered
            } : match.teamA,
            teamB: currentTeamB ? {
              ...match.teamB,
              lives: currentTeamB.lives,
              eliminated: currentTeamB.eliminated,
              reEntered: currentTeamB.reEntered
            } : match.teamB,
            winner: currentWinner
          };
        });
      }
      
      // Verificar equipes que estão em várias partidas dentro da mesma rodada
      const checkTeamsInSameRound = () => {
        const matchesByRound: Record<string, string[]> = {};
        
        tournamentCopy.matches.forEach(match => {
          if (!match.round) return;
          
          const roundKey = match.round.startsWith("RODADA") ? match.round : `RODADA ${match.round}`;
          if (!matchesByRound[roundKey]) {
            matchesByRound[roundKey] = [];
          }
          
          matchesByRound[roundKey].push(match.teamA.id, match.teamB.id);
        });
        
        // Verifica cada rodada para equipes duplicadas
        let hasDuplicates = false;
        Object.entries(matchesByRound).forEach(([round, teamIds]) => {
          const uniqueTeamIds = new Set(teamIds);
          if (uniqueTeamIds.size < teamIds.length) {
            console.warn(`AVISO: Há equipes jogando múltiplas partidas na ${round}`);
            hasDuplicates = true;
          }
        });
        
        return hasDuplicates;
      };
      
      // Executa a verificação, mas não bloqueia a atualização - apenas registra avisos
      checkTeamsInSameRound();
      
      // Atualiza o estado local do torneio otimisticamente
      setTournament(tournamentCopy);
      
      // Atualiza o ranking de equipes
      const newRankedTeams = getRankedTeams(tournamentCopy);
      setRankedTeams(newRankedTeams);
      
      // Salva no localStorage como fallback
      try {
        localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournamentCopy));
      } catch (error) {
        console.error("Erro ao salvar torneio no localStorage:", error);
      }

      // Inicia a atualização otimista no servidor
      const originalTournament = tournament; // Preserva o estado original em caso de erro
      await optimisticUpdate(tournamentCopy, originalTournament);
      
      console.log("Torneio atualizado e sincronizado com o banco de dados", tournamentCopy);
    } catch (error) {
      console.error("Erro ao atualizar torneio:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações no banco de dados.",
        variant: "destructive"
      });
    }
  };

  // Função para resetar o torneio
  const resetTournament = async () => {
    try {
      // Se houver um torneio no Supabase, reseta-o
      if (tournament.id) {
        await resetSupabaseTournament(tournament.id);
      } else {
        // Se não houver torneio no Supabase, limpa o estado local
        const resetTournamentData = {
          ...tournament,
          teams: [],
          matches: [],
          currentRound: "RODADA 1",
          maxRound: 1,
        };

        setTournament(resetTournamentData);
        setRankedTeams([]);
        
        // Força a atualização no localStorage também
        localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(resetTournamentData));
        
        console.log("Torneio resetado com sucesso", resetTournamentData);
      }
      
      // Limpar cache
      clearCache();
      
      // Mostra confirmação de sucesso
      toast({
        title: "Torneio resetado com sucesso",
        description: "Todos os times e rodadas foram removidos",
      });
    } catch (error) {
      console.error("Erro ao resetar torneio:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Erro ao resetar",
        description: "Não foi possível resetar o torneio no banco de dados.",
        variant: "destructive"
      });
    }
  };

  return (
    <TournamentContext.Provider value={{ 
      tournament, 
      updateTournament, 
      rankedTeams, 
      resetTournament,
      loading,
      isUpdating,
      error,
      stats
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error("useTournament deve ser usado dentro de um TournamentProvider");
  }
  return context;
};
