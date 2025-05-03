import { Team, Match } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UseTeamUpdateProps {
  teams: Team[];
  onUpdateTeams?: (teams: Team[]) => void;
  matches?: Match[];
  onUpdateMatches?: (matches: Match[]) => void;
}

export const useTeamUpdate = ({
  teams,
  onUpdateTeams,
  matches,
  onUpdateMatches
}: UseTeamUpdateProps) => {
  const { toast } = useToast();

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

  return {
    handleSaveTeam
  };
};
