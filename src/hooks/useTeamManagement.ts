
import { useState } from "react";
import { Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UseTeamManagementProps {
  initialTeams: Team[];
  onUpdateTeams?: (teams: Team[]) => void;
  maxReentryRound: number;
  currentRound: number;
}

export const useTeamManagement = ({
  initialTeams,
  onUpdateTeams,
  maxReentryRound,
  currentRound
}: UseTeamManagementProps) => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const { toast } = useToast();

  // Handle adding a new team
  const handleAddTeam = () => {
    const newId = `team-${teams.length + 1}`;
    const newTeam: Team = {
      id: newId,
      name: `Nova Dupla ${teams.length + 1}`,
      players: ["Jogador 1", "Jogador 2"] as [string, string],
      sponsor: { id: `sponsor-${teams.length + 1}`, name: "Patrocinador" },
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

  // Handle team save
  const handleSaveTeam = (updatedTeam: Team) => {
    // Ensure team never has more than 2 lives
    if (updatedTeam.lives > 2) {
      updatedTeam.lives = 2;
    }
    
    // Ensure lives are never negative
    if (updatedTeam.lives < 0) {
      updatedTeam.lives = 0;
    }
    
    const updatedTeams = teams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
    setTeams(updatedTeams);
    
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
      } else if (team.id === winner.id) {
        // Update winner's points
        return {
          ...team,
          totalPoints: team.totalPoints + 100
        };
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
