
import { Team, Match } from "@/lib/types";
import { useTeamCRUD } from "@/hooks/useTeamCRUD";
import { useTeamStatus } from "@/hooks/useTeamStatus";
import { useTeamUpdate } from "@/hooks/useTeamUpdate";

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
  // Use the refactored hooks
  const {
    teams,
    setTeams,
    handleAddTeam,
    confirmDeleteTeam
  } = useTeamCRUD({
    initialTeams,
    onUpdateTeams
  });
  
  const {
    handleReenterTeam,
    updateTeamsAfterMatch
  } = useTeamStatus({
    teams,
    onUpdateTeams,
    maxReentryRound,
    currentRound,
    matches,
    onUpdateMatches
  });
  
  const {
    handleSaveTeam
  } = useTeamUpdate({
    teams,
    onUpdateTeams,
    matches,
    onUpdateMatches
  });

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
