
import { useState } from "react";
import { Team, Match } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UseTeamManagementProps {
  initialTeams: Team[];
  onUpdateTeams?: (teams: Team[]) => void;
  maxReentryRound: number;
  currentRound: number;
  matches?: Match[];
  onUpdateMatches?: (matches: Match[]) => void;
}

export const useTeamManagement = ({
  initialTeams,
  onUpdateTeams,
  maxReentryRound,
  currentRound,
  matches,
  onUpdateMatches
}: UseTeamManagementProps) => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const { toast } = useToast();

  // Handle adding a new team
  const handleAddTeam = () => {
    const newTeamId = `team-${Date.now()}`;
    const newSponsorId = `sponsor-${Date.now()}`;
    
    const newTeam: Team = {
      id: newTeamId,
      name: `Nova Dupla ${teams.length + 1}`,
      players: ["Jogador 1", "Jogador 2"] as [string, string],
      sponsor: { id: newSponsorId, name: "Patrocinador" },
      eliminated: false,
      totalPoints: 0,
      lives: 2,
      reEntered: false
    };
    
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    
    if (onUpdateTeams) {
      onUpdateTeams(updatedTeams);
    }
    
    return newTeam;
  };

  // Handle team save with match updates
  const handleSaveTeam = (updatedTeam: Team) => {
    // Ensure team never has more than 2 lives
    if (updatedTeam.lives > 2) {
      updatedTeam.lives = 2;
    }
    
    // Ensure lives are never negative
    if (updatedTeam.lives < 0) {
      updatedTeam.lives = 0;
    }
    
    // Find team index to replace
    const teamIndex = teams.findIndex(t => t.id === updatedTeam.id);
    
    // If team doesn't exist, don't update
    if (teamIndex === -1) {
      toast({
        title: "Erro ao salvar",
        description: "Time não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    const updatedTeams = [...teams];
    updatedTeams[teamIndex] = updatedTeam;
    
    setTeams(updatedTeams);
    
    // Update matches if team name or other details changed
    if (matches && onUpdateMatches) {
      const updatedMatches = matches.map(match => {
        let matchUpdated = false;
        
        // Update team A reference in matches
        let updatedTeamA = match.teamA;
        if (match.teamA.id === updatedTeam.id) {
          updatedTeamA = updatedTeam;
          matchUpdated = true;
        }
        
        // Update team B reference in matches
        let updatedTeamB = match.teamB;
        if (match.teamB.id === updatedTeam.id) {
          updatedTeamB = updatedTeam;
          matchUpdated = true;
        }
        
        // Update winner reference in matches
        let updatedWinner = match.winner;
        if (match.winner && match.winner.id === updatedTeam.id) {
          updatedWinner = updatedTeam;
          matchUpdated = true;
        }
        
        // If nothing changed, return the original match
        if (!matchUpdated) return match;
        
        // Otherwise, return updated match with fresh team references
        return {
          ...match,
          teamA: updatedTeamA,
          teamB: updatedTeamB,
          winner: updatedWinner
        };
      });
      
      onUpdateMatches(updatedMatches);
    }
    
    if (onUpdateTeams) {
      onUpdateTeams(updatedTeams);
    }
    
    toast({
      title: "Time atualizado",
      description: `Alterações salvas para ${updatedTeam.name}`,
      variant: "default"
    });
  };

  // Reenter a team
  const handleReenterTeam = (teamId: string) => {
    if (currentRound > maxReentryRound) {
      toast({
        title: "Reinscrição não permitida",
        description: `Reinscrições são permitidas apenas até a RODADA ${maxReentryRound}`,
        variant: "destructive"
      });
      return false;
    }

    const updatedTeams = teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          lives: 1,
          eliminated: false,
          reEntered: true
        };
      }
      return team;
    });
    
    setTeams(updatedTeams);
    
    if (onUpdateTeams) {
      onUpdateTeams(updatedTeams);
    }
    
    toast({
      title: "Time reinscrito",
      description: "O time foi reinscrito com uma vida",
      variant: "default"
    });
    
    return true;
  };

  // Update teams after match completion
  const updateTeamsAfterMatch = (winner: Team, loser: Team) => {
    if (!loser.id) return teams; // Skip if no valid loser team
    
    const updatedTeams = teams.map(team => {
      if (team.id === loser.id) {
        // Calculate new lives and eliminated status
        const newLives = team.lives - 1;
        // A team is eliminated if it has 0 lives and hasn't been reentered
        const eliminated = newLives <= 0 && !team.reEntered;
        
        // Update the loser
        const updatedTeam = {
          ...team,
          lives: newLives < 0 ? 0 : newLives,
          eliminated
        };
        
        if (eliminated) {
          toast({
            title: `${loser.name} eliminado!`,
            description: loser.reEntered 
              ? "Esta equipe já estava na reinscrição e foi eliminada definitivamente."
              : `A equipe pode fazer uma reinscrição até a RODADA ${maxReentryRound}`,
            variant: "destructive"
          });
        }
        
        return updatedTeam;
      }
      return team;
    });
    
    setTeams(updatedTeams);
    
    if (onUpdateTeams) {
      onUpdateTeams(updatedTeams);
    }
    
    return updatedTeams;
  };
  
  // Handle team deletion
  const confirmDeleteTeam = (teamToDelete: Team) => {
    if (!teamToDelete) return teams;
    
    // Remove team from teams array
    const updatedTeams = teams.filter(t => t.id !== teamToDelete.id);
    setTeams(updatedTeams);
    
    if (onUpdateTeams) {
      onUpdateTeams(updatedTeams);
    }
    
    toast({
      title: "Time removido",
      description: `${teamToDelete.name} foi removido do torneio.`,
      variant: "destructive"
    });
    
    return updatedTeams;
  };

  return {
    teams,
    setTeams,
    handleAddTeam,
    handleSaveTeam,
    handleReenterTeam,
    updateTeamsAfterMatch,
    confirmDeleteTeam
  };
};
