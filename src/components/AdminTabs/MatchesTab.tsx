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
import { useToast } from "@/hooks/use-toast";

interface MatchesTabProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
}

const MatchesTab: React.FC<MatchesTabProps> = ({ tournament, onUpdateTournament }) => {
  // Extract current round number
  const currentRoundNumber = parseInt(tournament.currentRound.replace(/\D/g, '') || "1");
  
  // Get toast directly from useToast hook
  const { toast } = useToast();
  
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
  
  // Helper function to detect winners and losers from previous round
  const getPreviousRoundResults = (nextRoundNumber: number) => {
    if (nextRoundNumber <= 1) return { winners: [], losers: [] };
    
    // Get the previous round name
    const previousRoundName = `RODADA ${nextRoundNumber - 1}`;
    
    // Get matches from previous round
    const previousRoundMatches = matchesByRound[previousRoundName] || [];
    
    // Extract winners and losers
    const winners: Team[] = [];
    const losers: Team[] = [];
    
    previousRoundMatches.forEach(match => {
      if (match.completed && match.winner) {
        winners.push(match.winner);
        
        // Get loser (the team that didn't win)
        const loser = match.teamA.id === match.winner.id ? match.teamB : match.teamA;
        if (loser.id !== 'bye') {  // Ignore "bye" teams
          losers.push(loser);
        }
      }
    });
    
    return { winners, losers };
  };
  
  // Create a new round with matches based on previous results
  const createNewRound = () => {
    // Calculate the actual next round number by getting the max existing round number + 1
    let maxExistingRoundNumber = 0;
    
    // Go through all matches and find the highest round number
    tournament.matches.forEach(match => {
      if (match.round) {
        const roundNum = parseInt(match.round.replace(/\D/g, '') || "0");
        maxExistingRoundNumber = Math.max(maxExistingRoundNumber, roundNum);
      }
    });
    
    const nextRoundNumber = maxExistingRoundNumber + 1;
    
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

    // Get winners and losers from previous round
    const { winners, losers } = getPreviousRoundResults(nextRoundNumber);
    
    // Create matches for the next round
    const newMatches: Match[] = [];
    
    // Create matches pairing winners with winners when possible
    let remainingWinners = [...winners];
    let remainingLosers = [...losers];
    
    // Separating teams that are not in winners or losers list
    const otherTeams = teamsAdvancing.filter(team => 
      !winners.find(w => w.id === team.id) && 
      !losers.find(l => l.id === team.id)
    );
    
    console.log("Next round:", nextRoundNumber);
    console.log("Winners:", winners.map(w => w.name));
    console.log("Losers:", losers.map(l => l.name));
    console.log("Other teams:", otherTeams.map(t => t.name));
    
    // First, pair up winners with winners
    while (remainingWinners.length >= 2) {
      const teamA = remainingWinners.shift()!;
      const teamB = remainingWinners.shift()!;
      
      newMatches.push({
        id: `match-${nextRoundNumber}-${newMatches.length+1}`,
        teamA,
        teamB,
        scoreA: 0,
        scoreB: 0,
        round: `RODADA ${nextRoundNumber}`,
        completed: false,
        inProgress: false,
        tableNumber: undefined
      });
    }
    
    // Then, pair up losers with losers
    while (remainingLosers.length >= 2) {
      const teamA = remainingLosers.shift()!;
      const teamB = remainingLosers.shift()!;
      
      newMatches.push({
        id: `match-${nextRoundNumber}-${newMatches.length+1}`,
        teamA,
        teamB,
        scoreA: 0,
        scoreB: 0,
        round: `RODADA ${nextRoundNumber}`,
        completed: false,
        inProgress: false,
        tableNumber: undefined
      });
    }
    
    // Combine any remaining winners, losers, and other teams
    const remainingTeams = [...remainingWinners, ...remainingLosers, ...otherTeams];
    
    // Pair the remaining teams
    while (remainingTeams.length >= 2) {
      const teamA = remainingTeams.shift()!;
      const teamB = remainingTeams.shift()!;
      
      newMatches.push({
        id: `match-${nextRoundNumber}-${newMatches.length+1}`,
        teamA,
        teamB,
        scoreA: 0,
        scoreB: 0,
        round: `RODADA ${nextRoundNumber}`,
        completed: false,
        inProgress: false,
        tableNumber: undefined
      });
    }
    
    // If there's one team left, give it a bye
    if (remainingTeams.length === 1) {
      const teamA = remainingTeams[0];
      
      newMatches.push({
        id: `match-${nextRoundNumber}-${newMatches.length+1}`,
        teamA,
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
        round: `RODADA ${nextRoundNumber}`,
        completed: false,
        inProgress: false,
        tableNumber: undefined
      });
    }

    // Update state
    const updatedMatches = [...matches, ...newMatches];
    setMatches(updatedMatches);
    
    // Update tournament with new round and matches
    onUpdateTournament({
      ...tournament,
      maxRound: nextRoundNumber,
      currentRound: `RODADA ${nextRoundNumber}`,
      matches: updatedMatches
    });

    toast({
      title: "Nova rodada criada",
      description: `RODADA ${nextRoundNumber} foi criada com ${newMatches.length} partidas`,
      variant: "default"
    });
  };

  // DELETE ROUND FUNCTION
  const deleteRound = (round: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar todas as partidas da ${round}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const matchesToRemove = matchesByRound[round] || [];

    // Reverter efeitos das partidas finalizadas
    const updatedTeams = [...teams];
    matchesToRemove.forEach((match) => {
      if (match.completed && match.winner) {
        // Restaurar vida ao perdedor
        const loser = match.winner.id === match.teamA.id ? match.teamB : match.teamA;
        const loserIndex = updatedTeams.findIndex(t => t.id === loser.id);
        if (loserIndex !== -1) {
          updatedTeams[loserIndex].lives += 1;
          if (updatedTeams[loserIndex].lives > 2) {
            updatedTeams[loserIndex].lives = 2; // Guarantee max 2 lives
          }
          updatedTeams[loserIndex].eliminated = false;
        }
      }
    });

    // Remover as partidas da rodada
    const updatedMatches = matches.filter(m => m.round !== round);

    setMatches(updatedMatches);
    setTeams(updatedTeams);

    toast({
      title: `Rodada deletada`,
      description: `${matchesToRemove.length} partidas removidas da ${round}`,
      variant: "destructive"
    });

    // Syncronize with tournament state
    onUpdateTournament({
      ...tournament,
      matches: updatedMatches,
      teams: updatedTeams,
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
            
            {/* Keep existing table structure and match rendering */}
            {rounds.map(round => (
              <TabsContent key={round} value={round}>
                {/* Round header with delete button */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{round}</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteRound(round)}
                  >
                    Deletar Rodada
                  </Button>
                </div>
                
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
                              const updatedMatches = matches.map(m => {
                                if (m.id === match.id) {
                                  return { ...m, tableNumber };
                                }
                                return m;
                              });
                              setMatches(updatedMatches);
                              onUpdateTournament({
                                ...tournament,
                                matches: updatedMatches
                              });
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
                                {match.completed && match.winner?.id !== match.teamA.id && match.teamA.eliminated && (
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
                                    {Array.from({ length: (match.teamA.reEntered ? 1 : 2) - match.teamA.lives }).map((_, i) => (
                                      <span key={`empty-${i}`} className="text-gray-300 mr-1">♡</span>
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
                                {match.completed && match.winner?.id !== match.teamB.id && match.teamB.eliminated && (
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
                                    {Array.from({ length: (match.teamB.reEntered ? 1 : 2) - match.teamB.lives }).map((_, i) => (
                                      <span key={`empty-${i}`} className="text-gray-300 mr-1">♡</span>
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
                              onChange={(e) => {
                                handleUpdateScore(match.id, 'A', parseInt(e.target.value) || 0);
                                // Syncronize with tournament
                                onUpdateTournament({
                                  ...tournament,
                                  matches: matches.map(m => m.id === match.id ? {...m, scoreA: parseInt(e.target.value) || 0} : m)
                                });
                              }}
                              disabled={!match.inProgress || match.completed || !match.teamA.id}
                            />
                            <span className="text-muted-foreground">x</span>
                            <Input
                              type="number"
                              min={0}
                              className="w-20 text-center"
                              value={match.scoreB}
                              onChange={(e) => {
                                handleUpdateScore(match.id, 'B', parseInt(e.target.value) || 0);
                                // Syncronize with tournament
                                onUpdateTournament({
                                  ...tournament,
                                  matches: matches.map(m => m.id === match.id ? {...m, scoreB: parseInt(e.target.value) || 0} : m)
                                });
                              }}
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
