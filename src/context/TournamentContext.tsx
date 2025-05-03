
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Tournament } from "@/lib/types";
import { mockTournament, getRankedTeams } from "@/lib/mockData";

// Constante para o storage key
const TOURNAMENT_STORAGE_KEY = "rotary-tournament";

// Define o tipo para o contexto
interface TournamentContextType {
  tournament: Tournament;
  updateTournament: (updatedTournament: Tournament) => void;
  rankedTeams: ReturnType<typeof getRankedTeams>;
  resetTournament: () => void;
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

// Carregar torneio do localStorage ou usar o mock
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
  // Inicializar com dados do localStorage ou mock
  const [tournament, setTournament] = useState<Tournament>(loadSavedTournament);
  const [rankedTeams, setRankedTeams] = useState(getRankedTeams(tournament));

  // Salvar no localStorage quando o torneio for atualizado
  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournament));
    } catch (error) {
      console.error("Erro ao salvar torneio no localStorage:", error);
    }
  }, [tournament]);

  // Função para atualizar o torneio
  const updateTournament = (updatedTournament: Tournament) => {
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
    
    setTournament(tournamentCopy);
    
    // Atualiza o ranking de equipes
    setRankedTeams(getRankedTeams(tournamentCopy));
    
    console.log("Torneio atualizado e sincronizado com o placar", tournamentCopy);
  };

  // Função para resetar o torneio
  const resetTournament = () => {
    // Mantém configurações básicas do torneio, mas limpa times e partidas
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
  };

  return (
    <TournamentContext.Provider value={{ tournament, updateTournament, rankedTeams, resetTournament }}>
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
