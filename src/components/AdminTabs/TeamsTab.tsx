
import React, { useState } from "react";
import { Team, Tournament } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TeamEditDialog from "@/components/TeamEditDialog";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import TeamList from "@/components/Teams/TeamList";
import TeamsSkeleton from "@/components/Teams/TeamsSkeleton";
import DeleteTeamDialog from "@/components/Teams/DeleteTeamDialog";

interface TeamsTabProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
  loading?: boolean;
}

const TeamsTab: React.FC<TeamsTabProps> = ({ tournament, onUpdateTournament, loading = false }) => {
  const currentRoundNumber = parseInt(tournament.currentRound.replace(/\D/g, '') || "1");
  
  // Custom hook for team management with matches passed
  const {
    teams,
    handleAddTeam,
    handleSaveTeam,
    handleReenterTeam,
    confirmDeleteTeam
  } = useTeamManagement({
    initialTeams: tournament.teams,
    onUpdateTeams: (updatedTeams) => {
      onUpdateTournament({
        ...tournament,
        teams: updatedTeams
      });
    },
    maxReentryRound: tournament.rules?.reentryAllowedUntilRound || 5,
    currentRound: currentRoundNumber,
    matches: tournament.matches,
    onUpdateMatches: (updatedMatches) => {
      onUpdateTournament({
        ...tournament,
        matches: updatedMatches
      });
    }
  });
  
  // Team editing state
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  
  // Team deletion state
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Handle team editing
  const handleEditTeam = (team: Team) => {
    setTeamToEdit({...team}); // Create a copy to prevent reference issues
    setIsTeamDialogOpen(true);
  };

  // Handle team addition
  const handleAddNewTeam = () => {
    const newTeam = handleAddTeam();
    setTeamToEdit({...newTeam}); // Create a copy to prevent reference issues
    setIsTeamDialogOpen(true);
  };

  // Handle team deletion
  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDeleteTeam = () => {
    if (!teamToDelete) return;

    // Check if team is in any matches
    const isInMatches = tournament.matches.some(match => 
      match.teamA.id === teamToDelete.id || 
      match.teamB.id === teamToDelete.id ||
      match.winner?.id === teamToDelete.id
    );

    // Update team references in matches if needed
    const updatedMatches = isInMatches 
      ? tournament.matches.map(match => {
          if (match.teamA.id === teamToDelete.id) {
            return { 
              ...match, 
              teamA: { 
                id: 'removed', 
                name: 'Time removido', 
                players: ['', ''] as [string, string], 
                eliminated: true, 
                totalPoints: 0, 
                lives: 0, 
                reEntered: false 
              },
              completed: true
            };
          }
          if (match.teamB.id === teamToDelete.id) {
            return { 
              ...match, 
              teamB: { 
                id: 'removed', 
                name: 'Time removido', 
                players: ['', ''] as [string, string], 
                eliminated: true, 
                totalPoints: 0, 
                lives: 0, 
                reEntered: false 
              },
              completed: true
            };
          }
          if (match.winner?.id === teamToDelete.id) {
            return { ...match, winner: undefined };
          }
          return match;
        })
      : tournament.matches;
    
    // Delete the team
    const updatedTeams = confirmDeleteTeam(teamToDelete);
    
    // Update tournament with new teams and matches
    if (isInMatches) {
      onUpdateTournament({
        ...tournament,
        teams: updatedTeams,
        matches: updatedMatches
      });
    }
    
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Times</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamsSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Times</CardTitle>
            <Button onClick={handleAddNewTeam}>
              Adicionar Time
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TeamList
            teams={teams}
            onEditTeam={handleEditTeam}
            onDeleteTeam={handleDeleteTeam}
            onReenterTeam={handleReenterTeam}
          />
        </CardContent>
      </Card>
      
      {/* Team edit dialog */}
      {teamToEdit && (
        <TeamEditDialog
          team={teamToEdit}
          open={isTeamDialogOpen}
          onClose={() => {
            setIsTeamDialogOpen(false);
            setTeamToEdit(null);
          }}
          onSave={handleSaveTeam}
          currentRound={currentRoundNumber}
          maxReentryRound={tournament.rules?.reentryAllowedUntilRound || 5}
        />
      )}
      
      {/* Team delete confirmation dialog */}
      <DeleteTeamDialog
        teamToDelete={teamToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteTeam}
        matches={tournament.matches}
      />
    </>
  );
};

export default TeamsTab;
