
import React, { useState } from "react";
import { Match, Team, Tournament } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertTriangle, Edit, Trash2 } from "lucide-react";
import ManualMatchCreator from "@/components/ManualMatchCreator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MatchStatusEditor from "@/components/MatchStatusEditor";
import MatchEditDialog from "@/components/MatchEditDialog";
import { useMatchManagement } from "@/hooks/useMatchManagement";
import { useTeamManagement } from "@/hooks/useTeamManagement";

interface MatchesTabProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
}

const MatchesTab: React.FC<MatchesTabProps> = ({ tournament, onUpdateTournament }) => {
  // Extract current round number
  const currentRoundNumber = parseInt(tournament.currentRound.replace(/\D/g, '') || "1");
  
  // Custom hooks for match and team management
  const { 
    matches, 
    setMatches,
    matchesByRound, 
    rounds,
    handleAddManualMatch,
    handleUpdateScore,
    handleStartMatch,
    handleCompleteMatch,
    handleSetWinner,
    handleDeleteMatch
  } = useMatchManagement({
    initialMatches: tournament.matches,
    teams: tournament.teams,
    onUpdateMatches: (updatedMatches) => {
      onUpdateTournament({
        ...tournament,
        matches: updatedMatches
      });
    },
    currentRoundNumber
  });
  
  const {
    teams,
    setTeams,
    updateTeamsAfterMatch
  } = useTeamManagement({
    initialTeams: tournament.teams,
    onUpdateTeams: (updatedTeams) => {
      onUpdateTournament({
        ...tournament,
        teams: updatedTeams
      });
    },
    maxReentryRound: tournament.rules?.reentryAllowedUntilRound || 5,
    currentRound: currentRoundNumber
  });
  
  // State for dialogs
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [matchToEditStatus, setMatchToEditStatus] = useState<Match | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  
  // Create a new round with matches
  const createNewRound = () => {
    const currentRound = tournament.maxRound;
    const nextRound = currentRound + 1;
    
    // Get teams that have at least 1 life OR have been re-entered, but NOT eliminated
    const teamsAdvancing = teams.filter(team => 
      (team.lives > 0 || team.reEntered) && !team.eliminated
    );

    // Check if we have enough teams
    if (teamsAdvancing.length < 2) {
      toast({
        title: "Não é possível criar uma nova rodada",
        description: "Não há equipes suficientes para criar confrontos",
        variant: "destructive"
      });
      return;
    }

    // Create matches for the next round
    const newMatches: Match[] = [];
    
    // Pair teams for matches
    for (let i = 0; i < teamsAdvancing.length; i += 2) {
      if (i + 1 < teamsAdvancing.length) {
        newMatches.push({
          id: `match-${nextRound}-${i/2+1}`,
          teamA: teamsAdvancing[i],
          teamB: teamsAdvancing[i+1],
          scoreA: 0,
          scoreB: 0,
          round: `${nextRound}`,
          completed: false,
          inProgress: false,
          tableNumber: undefined
        });
      } else {
        // Odd number of teams, this team gets a bye
        newMatches.push({
          id: `match-${nextRound}-${i/2+1}`,
          teamA: teamsAdvancing[i],
          teamB: {
            id: 'bye',
            name: 'Bye',
            players: ['', ''] as [string, string],
            sponsor: { id: '', name: '' },
            eliminated: false,
            totalPoints: 0,
            lives: 0,
            reEntered: false
          },
          scoreA: 0,
          scoreB: 0,
          round: `${nextRound}`,
          completed: false,
          inProgress: false,
          tableNumber: undefined
        });
      }
    }

    // Update state
    const updatedMatches = [...matches, ...newMatches];
    setMatches(updatedMatches);
    
    // Update tournament with new round and matches
    onUpdateTournament({
      ...tournament,
      maxRound: nextRound,
      currentRound: `RODADA ${nextRound}`,
      matches: updatedMatches
    });

    toast({
      title: "Nova rodada criada",
      description: `RODADA ${nextRound} foi criada com ${newMatches.length} partidas`,
      variant: "default"
    });
  };

  // Handle match editing
  const handleEditMatch = (match: Match) => {
    setMatchToEdit(match);
    setIsMatchDialogOpen(true);
  };

  const handleSaveMatch = (updatedMatch: Match) => {
    const updatedMatches = matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    setMatches(updatedMatches);
    
    onUpdateTournament({
      ...tournament,
      matches: updatedMatches
    });
    
    toast({
      title: "Partida atualizada",
      description: `Alterações salvas para a partida`,
      variant: "default"
    });
  };
  
  // Handle match status editing
  const handleOpenStatusEditor = (match: Match) => {
    setMatchToEditStatus(match);
    setIsStatusDialogOpen(true);
  };
  
  const handleSaveMatchWithTeams = (updatedMatch: Match, updatedTeams: Team[]) => {
    // Update the match
    const updatedMatches = matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    setMatches(updatedMatches);
    
    // Update teams with new lives/points/status
    setTeams(updatedTeams);
    
    // Sync with parent
    onUpdateTournament({
      ...tournament,
      teams: updatedTeams,
      matches: updatedMatches
    });
    
    setIsStatusDialogOpen(false);
  };

  // Add toast to component scope
  const { toast } = useTeamManagement({ 
    initialTeams: teams, 
    maxReentryRound: tournament.rules?.reentryAllowedUntilRound || 5,
    currentRound: currentRoundNumber
  });

  // Wrapper for complete match to update teams
  const handleCompleteMatchWrapper = (matchId: string) => {
    const result = handleCompleteMatch(matchId);
    if (result && result.winner && result.loser) {
      updateTeamsAfterMatch(result.winner, result.loser);
    }
  };

  // Wrapper for set winner to update teams
  const handleSetWinnerWrapper = (matchId: string, team: 'A' | 'B') => {
    const result = handleSetWinner(matchId, team);
    if (result && result.winner && result.loser) {
      updateTeamsAfterMatch(result.winner, result.loser);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle>Gerenciar Partidas</CardTitle>
            <div className="flex items-center gap-2">
              <ManualMatchCreator 
                teams={teams} 
                roundNumber={currentRoundNumber}
                onCreateMatch={handleAddManualMatch} 
              />
              <Button onClick={createNewRound}>
                Criar Nova Rodada
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={rounds[0] || "RODADA 1"} className="w-full mb-6">
            <TabsList className="mb-4 overflow-x-auto flex w-full flex-nowrap">
              {rounds.map(round => (
                <TabsTrigger key={round} value={round} className="flex-shrink-0">
                  {round}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {rounds.map(round => (
              <TabsContent key={round} value={round}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mesa</TableHead>
                      <TableHead>Times</TableHead>
                      <TableHead className="text-center">Pontuação</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchesByRound[round]?.map(match => (
                      <TableRow key={match.id} className={
                        match.completed ? (
                          match.winner?.id === match.teamA.id 
                            ? "bg-green-700/10" 
                            : match.winner?.id === match.teamB.id 
                              ? "bg-green-700/10" 
                              : ""
                        ) : match.inProgress ? "bg-yellow-50" : ""
                      }>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            className="w-20 text-center"
                            value={match.tableNumber || ''}
                            onChange={(e) => {
                              const tableNumber = parseInt(e.target.value) || undefined;
                              setMatches(
                                matches.map(m => {
                                  if (m.id === match.id) {
                                    return { ...m, tableNumber };
                                  }
                                  return m;
                                })
                              );
                            }}
                            placeholder="Nº"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className={`rounded p-1 ${match.completed && match.winner?.id === match.teamA.id ? 'bg-green-700/20' : match.completed && match.winner?.id !== match.teamA.id ? 'bg-red-50 relative' : ''}`}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                  {match.teamA.reEntered && (
                                    <AlertTriangle size={16} className="text-yellow-500" />
                                  )}
                                  <span>{match.teamA.id ? match.teamA.name : 'Time a definir'}</span>
                                </div>
                                {match.completed && match.winner?.id !== match.teamA.id && (
                                  <Badge variant="destructive" className="text-xs">Eliminado</Badge>
                                )}
                                {match.completed && match.winner?.id === match.teamA.id && (
                                  <Badge variant="default" className="text-xs">Vencedor</Badge>
                                )}
                              </div>
                              {match.teamA.id && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  {match.teamA.sponsor.name}
                                  <span className="ml-2 flex">
                                    {Array.from({ length: match.teamA.lives }).map((_, i) => (
                                      <span key={i} className="text-red-500 mr-1">❤️</span>
                                    ))}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-center text-sm text-muted-foreground">VS</div>
                            
                            <div className={`rounded p-1 ${match.completed && match.winner?.id === match.teamB.id ? 'bg-green-700/20' : match.completed && match.winner?.id !== match.teamB.id ? 'bg-red-50 relative' : ''}`}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                  {match.teamB.reEntered && (
                                    <AlertTriangle size={16} className="text-yellow-500" />
                                  )}
                                  <span>{match.teamB.id ? match.teamB.name : 'Time a definir'}</span>
                                </div>
                                {match.completed && match.winner?.id !== match.teamB.id && (
                                  <Badge variant="destructive" className="text-xs">Eliminado</Badge>
                                )}
                                {match.completed && match.winner?.id === match.teamB.id && (
                                  <Badge variant="default" className="text-xs">Vencedor</Badge>
                                )}
                              </div>
                              {match.teamB.id && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  {match.teamB.sponsor.name}
                                  <span className="ml-2 flex">
                                    {Array.from({ length: match.teamB.lives }).map((_, i) => (
                                      <span key={i} className="text-red-500 mr-1">❤️</span>
                                    ))}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              className="w-20 text-center"
                              value={match.scoreA}
                              onChange={(e) => handleUpdateScore(match.id, 'A', parseInt(e.target.value) || 0)}
                              disabled={!match.inProgress || match.completed || !match.teamA.id}
                            />
                            <span className="text-muted-foreground">x</span>
                            <Input
                              type="number"
                              min={0}
                              className="w-20 text-center"
                              value={match.scoreB}
                              onChange={(e) => handleUpdateScore(match.id, 'B', parseInt(e.target.value) || 0)}
                              disabled={!match.inProgress || match.completed || !match.teamB.id}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenStatusEditor(match)}
                          >
                            {match.completed ? "Finalizada" : match.inProgress ? "Em andamento" : "Aguardando"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMatch(match)}
                            >
                              <Edit size={14} className="mr-1" />
                              Editar
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMatch(match.id)}
                            >
                              <Trash2 size={14} className="mr-1" />
                              Excluir
                            </Button>

                            {!match.inProgress && !match.completed && match.teamA.id && match.teamB.id && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStartMatch(match.id)}
                              >
                                Iniciar
                              </Button>
                            )}
                            
                            {match.inProgress && !match.completed && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleCompleteMatchWrapper(match.id)}
                              >
                                Finalizar
                              </Button>
                            )}
                            
                            {match.completed && !match.winner && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => handleSetWinnerWrapper(match.id, 'A')}
                                >
                                  Time A venceu
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => handleSetWinnerWrapper(match.id, 'B')}
                                >
                                  Time B venceu
                                </Button>
                              </>
                            )}
                          </div>
                          
                          {/* Display which team advances */}
                          {match.completed && match.winner && (
                            <div className="flex items-center justify-end text-sm text-green-700 mt-2">
                              <span>Avança: {match.winner.name}</span>
                              <ArrowRight size={16} className="ml-1" />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!matchesByRound[round]?.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhuma partida encontrada nesta rodada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Match edit dialog */}
      {matchToEdit && (
        <MatchEditDialog
          match={matchToEdit}
          open={isMatchDialogOpen}
          onClose={() => setIsMatchDialogOpen(false)}
          onSave={handleSaveMatch}
          availableTeams={teams}
        />
      )}
      
      {/* Match status edit dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status da Partida</DialogTitle>
          </DialogHeader>
          {matchToEditStatus && (
            <MatchStatusEditor 
              match={matchToEditStatus}
              teams={teams}
              onSave={handleSaveMatchWithTeams}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MatchesTab;
