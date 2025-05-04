
import { useState } from "react";
import { Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateUUID } from "@/integrations/supabase/client";

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

  // Handle adding a new team with proper UUID generation
  const handleAddTeam = () => {
    // Generate a proper UUID for Supabase compatibility
    const newTeamId = generateUUID();
    
    console.log("Creating new team with ID:", newTeamId);
    
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
      console.log("Updating teams in parent component");
      onUpdateTeams(updatedTeams);
    } else {
      console.warn("No onUpdateTeams callback provided");
    }
    
    toast({
      title: "Time adicionado",
      description: `${newTeam.name} foi adicionado ao torneio.`
    });
    
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
