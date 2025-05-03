import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Tournament } from "@/lib/types";
import { useSupabaseTournament } from "@/hooks/useSupabaseTournament";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";
import { useTournamentCache } from "@/hooks/useTournamentCache";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";
import { useTournamentStats } from "@/hooks/useTournamentStats";
import { generateUUID } from "@/integrations/supabase/client";

// Constante para o storage key
const TOURNAMENT_STORAGE_KEY = "rotary-tournament";

// Define o tipo para o contexto
interface TournamentContextType {
  tournament: Tournament;
  updateTournament: (updatedTournament: Tournament) => void;
  rankedTeams: Tournament['teams'];
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

  // Inicializar com um torneio vazio, será substituído pelos dados do Supabase
  const defaultEmptyTournament: Tournament = {
    id: generateUUID(),
    name: "Carregando torneio...",
    date: new Date(),
    location: "...",
    teams: [],
    matches: [],
    currentRound: "RODADA 1",
    maxRound: 1,
    rules: {
      reentryAllowedUntilRound: 3,
      pointsToWin: 3000
    }
  };
  
  const [tournament, setTournament] = useState<Tournament>(defaultEmptyTournament);
  const [rankedTeams, setRankedTeams] = useState<Tournament['teams']>([]);
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
        console.log("Atualizando torneio existente:", updatedTournament.id);
        return await updateSupabaseTournament(updatedTournament);
      } else {
        console.log("Criando novo torneio");
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

  // Helper para classificar equipes por pontos
  const getRankedTeams = (tournamentData: Tournament) => {
    const teamsCopy = [...tournamentData.teams];
    
    // Ordenar por pontos (decrescente) e, em caso de empate, por nome (crescente)
    return teamsCopy.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return a.name.localeCompare(b.name);
    });
  };
  
  // Quando o torneio do Supabase é carregado, atualiza o state local
  useEffect(() => {
    if (supabaseTournament) {
      console.log("Torneio carregado do Supabase:", supabaseTournament.id);
      setTournament(supabaseTournament);
      setRankedTeams(getRankedTeams(supabaseTournament));
      // Limpar o localStorage para evitar conflitos
      try {
        localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
      } catch (error) {
        console.error("Erro ao limpar localStorage:", error);
      }
      clearCache(); // Limpar o cache após carregar dados reais do servidor
    } else if (!loading && cachedTournament) {
      // Se não há dados do Supabase e não está carregando, use o cache
      console.log("Usando torneio do cache");
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
      console.log("Atualizando torneio:", updatedTournament.id);
      
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

      // Inicia a atualização otimista no servidor
      const originalTournament = tournament; // Preserva o estado original em caso de erro
      await optimisticUpdate(tournamentCopy, originalTournament);
      
      console.log("Torneio atualizado e sincronizado com o banco de dados");
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
      console.log("Iniciando reset do torneio...");

      // Se houver um torneio no Supabase, reseta-o
      if (tournament.id) {
        console.log(`Resetando torneio no Supabase com ID: ${tournament.id}`);
        const success = await resetSupabaseTournament(tournament.id);
        
        if (!success) {
          throw new Error("Falha ao resetar torneio no Supabase");
        }
        
        // Limpa o cache e o localStorage
        clearCache();
        try {
          localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
        } catch (error) {
          console.error("Erro ao limpar localStorage:", error);
        }
      } else {
        console.error("Tentativa de resetar torneio sem ID");
        throw new Error("Torneio não possui ID válido");
      }
      
      console.log("Torneio resetado com sucesso");
      
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
