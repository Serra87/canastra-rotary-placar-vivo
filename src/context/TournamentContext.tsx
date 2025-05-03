
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Tournament } from "@/lib/types";
import { mockTournament, getRankedTeams } from "@/lib/mockData";

// Define o tipo para o contexto
interface TournamentContextType {
  tournament: Tournament;
  updateTournament: (updatedTournament: Tournament) => void;
  rankedTeams: ReturnType<typeof getRankedTeams>;
}

// Criar o contexto
const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// Provedor do contexto
export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tournament, setTournament] = useState<Tournament>(mockTournament);
  const [rankedTeams, setRankedTeams] = useState(getRankedTeams(mockTournament));

  // Função para atualizar o torneio
  const updateTournament = (updatedTournament: Tournament) => {
    // Criar uma cópia profunda para evitar problemas de referência
    const tournamentCopy = JSON.parse(JSON.stringify(updatedTournament));
    
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

  return (
    <TournamentContext.Provider value={{ tournament, updateTournament, rankedTeams }}>
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
