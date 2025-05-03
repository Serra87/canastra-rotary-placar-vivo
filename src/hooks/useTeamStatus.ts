
import { Team, Match } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UseTeamStatusProps {
  teams: Team[];
  onUpdateTeams?: (teams: Team[]) => void;
  maxReentryRound: number;
  currentRound: number;
  matches?: Match[];
  onUpdateMatches?: (matches: Match[]) => void;
}

export const useTeamStatus = ({
  teams,
  onUpdateTeams,
  maxReentryRound,
  currentRound,
  matches,
  onUpdateMatches
}: UseTeamStatusProps) => {
  const { toast } = useToast();

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
    
    if (onUpdateTeams) {
      onUpdateTeams(updatedTeams);
    }
    
    return updatedTeams;
  };

  return {
    handleReenterTeam,
    updateTeamsAfterMatch
  };
};
