
import { useState } from "react";
import { Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UseTeamCRUDProps {
  initialTeams: Team[];
  onUpdateTeams?: (teams: Team[]) => void;
}

export const useTeamCRUD = ({
  initialTeams,
  onUpdateTeams,
}: UseTeamCRUDProps) => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const { toast } = useToast();

  // Handle adding a new team
  const handleAddTeam = () => {
    const newTeamId = `team-${Date.now()}`;
    
    const newTeam: Team = {
      id: newTeamId,
      name: `Nova Dupla ${teams.length + 1}`,
      players: ["Jogador 1", "Jogador 2"] as [string, string],
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
    confirmDeleteTeam
  };
};
