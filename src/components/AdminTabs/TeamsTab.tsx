
import React, { useState } from "react";
import { Team, Tournament } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Edit, Trash2 } from "lucide-react";
import TeamEditDialog from "@/components/TeamEditDialog";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Match } from "@/lib/types";

interface TeamsTabProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
}

const TeamsTab: React.FC<TeamsTabProps> = ({ tournament, onUpdateTournament }) => {
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
    const updatedMatches: Match[] = isInMatches 
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Jogadores</TableHead>
                <TableHead className="text-center">Vidas</TableHead>
                <TableHead className="text-center">Pontos</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum time cadastrado. Clique em "Adicionar Time" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                teams.map(team => (
                  <TableRow key={team.id} className={team.eliminated ? "bg-slate-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {team.reEntered && (
                          <AlertTriangle size={16} className="text-yellow-500" />
                        )}
                        <span>{team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{team.players.join(' / ')}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {Array.from({ length: team.lives }).map((_, i) => (
                          <span key={i} className="text-red-500 mr-1">❤️</span>
                        ))}
                        {Array.from({ length: (team.reEntered ? 1 : 2) - team.lives }).map((_, i) => (
                          <span key={`empty-${i}`} className="text-gray-300 mr-1">♡</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{team.totalPoints}</TableCell>
                    <TableCell className="text-center">
                      {team.eliminated ? (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-600">
                          Eliminado
                        </span>
                      ) : team.reEntered ? (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Reinscrito
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTeam(team)}
                        >
                          <Edit size={14} className="mr-1" />
                          Editar
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteTeam(team)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Excluir
                        </Button>
                        
                        {team.eliminated && !team.reEntered && (
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => handleReenterTeam(team.id)}
                            className="flex items-center gap-1"
                          >
                            <AlertTriangle size={14} />
                            Reinscrever
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o time {teamToDelete?.name}? Esta ação não pode ser desfeita.
              {tournament.matches.some(m => 
                (m.teamA.id === teamToDelete?.id || m.teamB.id === teamToDelete?.id) && 
                !m.completed
              ) && (
                <p className="mt-2 text-red-500 font-semibold">
                  Atenção: Este time possui partidas em andamento ou agendadas. Excluí-lo afetará essas partidas.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteTeam}>
              Excluir Time
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeamsTab;
