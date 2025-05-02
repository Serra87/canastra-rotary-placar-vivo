import { useState } from "react";
import { Match, Team, Tournament } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit, AlertTriangle, Trash2 } from "lucide-react";
import TeamEditDialog from "./TeamEditDialog";
import MatchEditDialog from "./MatchEditDialog";
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

interface AdminPanelProps {
  tournament: Tournament;
}

export const AdminPanel = ({ tournament }: AdminPanelProps) => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>(tournament.teams);
  const [matches, setMatches] = useState<Match[]>(tournament.matches);
  const [currentTournament, setCurrentTournament] = useState<Tournament>({
    ...tournament,
    currentRound: tournament.currentRound || "RODADA 1",
    maxRound: tournament.maxRound || 1,
    rules: {
      initialLives: 2,
      reentryAllowedUntilRound: 5,
      pointsToWin: 3000
    }
  });
  
  // Team editing
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  
  // Team deletion
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Match editing
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);

  // Group matches by round
  const matchesByRound: Record<string, Match[]> = {};
  matches.forEach(match => {
    if (!match.round) return; // Skip matches without a round
    
    const roundNumber = parseInt(match.round.replace(/\D/g, '') || "1");
    const roundKey = `RODADA ${roundNumber}`;
    
    if (!matchesByRound[roundKey]) {
      matchesByRound[roundKey] = [];
    }
    matchesByRound[roundKey].push(match);
  });

  // Get all rounds in order
  const rounds = Object.keys(matchesByRound).sort((a, b) => {
    const aNum = parseInt(a.replace(/\D/g, '') || "1");
    const bNum = parseInt(b.replace(/\D/g, '') || "1");
    return aNum - bNum;
  });

  // Create a new round with matches
  const createNewRound = () => {
    const currentRound = currentTournament.maxRound;
    const nextRound = currentRound + 1;
    
    // Get teams that lost lives but aren't eliminated in the current round
    const teamsAdvancing = teams.filter(team => 
      team.lives > 0 && 
      !team.eliminated
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
        // In a real system, you might handle this differently
        newMatches.push({
          id: `match-${nextRound}-${i/2+1}`,
          teamA: teamsAdvancing[i],
          teamB: {
            id: '',
            name: 'Bye',
            players: ['', ''],
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
    setMatches([...matches, ...newMatches]);
    setCurrentTournament(prev => ({
      ...prev,
      maxRound: nextRound,
      currentRound: `RODADA ${nextRound}`
    }));

    toast({
      title: "Nova rodada criada",
      description: `RODADA ${nextRound} foi criada com ${newMatches.length} partidas`,
      variant: "success"
    });
  };

  // Handle team editing
  const handleEditTeam = (team: Team) => {
    setTeamToEdit(team);
    setIsTeamDialogOpen(true);
  };

  const handleSaveTeam = (updatedTeam: Team) => {
    setTeams(prevTeams => prevTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    
    // Also update team in matches
    setMatches(prevMatches => prevMatches.map(match => {
      if (match.teamA.id === updatedTeam.id) {
        return { ...match, teamA: updatedTeam };
      }
      if (match.teamB.id === updatedTeam.id) {
        return { ...match, teamB: updatedTeam };
      }
      if (match.winner?.id === updatedTeam.id) {
        return { ...match, winner: updatedTeam };
      }
      return match;
    }));
    
    toast({
      title: "Time atualizado",
      description: `Alterações salvas para ${updatedTeam.name}`,
      variant: "success"
    });
  };

  // Handle adding a new team
  const handleAddTeam = () => {
    const newId = `team-${teams.length + 1}`;
    const newTeam: Team = {
      id: newId,
      name: `Nova Dupla ${teams.length + 1}`,
      players: ["Jogador 1", "Jogador 2"],
      sponsor: { id: `sponsor-${teams.length + 1}`, name: "Patrocinador" },
      eliminated: false,
      totalPoints: 0,
      lives: 2,
      reEntered: false
    };
    
    setTeams([...teams, newTeam]);
    setTeamToEdit(newTeam);
    setIsTeamDialogOpen(true);
  };

  // Handle team deletion
  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTeam = () => {
    if (!teamToDelete) return;

    // Check if team is in any matches
    const isInMatches = matches.some(match => 
      match.teamA.id === teamToDelete.id || 
      match.teamB.id === teamToDelete.id ||
      match.winner?.id === teamToDelete.id
    );

    if (isInMatches) {
      // Remove team from matches
      const updatedMatches = matches.map(match => {
        if (match.teamA.id === teamToDelete.id) {
          return { 
            ...match, 
            teamA: { 
              id: '', 
              name: 'Time removido', 
              players: ['', ''], 
              sponsor: { id: '', name: '' }, 
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
              id: '', 
              name: 'Time removido', 
              players: ['', ''], 
              sponsor: { id: '', name: '' }, 
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
      });
      setMatches(updatedMatches);
    }

    // Remove team from teams array
    setTeams(currentTeams => currentTeams.filter(t => t.id !== teamToDelete.id));
    
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
    
    toast({
      title: "Time removido",
      description: `${teamToDelete.name} foi removido do torneio.`,
      variant: "destructive"
    });
  };

  // Handle match editing
  const handleEditMatch = (match: Match) => {
    setMatchToEdit(match);
    setIsMatchDialogOpen(true);
  };

  const handleSaveMatch = (updatedMatch: Match) => {
    setMatches(prevMatches => prevMatches.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    
    toast({
      title: "Partida atualizada",
      description: `Alterações salvas para a partida`,
      variant: "success"
    });
  };

  // Update match score
  const handleUpdateScore = (matchId: string, team: 'A' | 'B', score: number) => {
    setMatches(
      matches.map(match => {
        if (match.id === matchId) {
          if (team === 'A') {
            return { ...match, scoreA: score };
          } else {
            return { ...match, scoreB: score };
          }
        }
        return match;
      })
    );
  };
  
  // Start match
  const handleStartMatch = (matchId: string) => {
    setMatches(
      matches.map(match => {
        if (match.id === matchId) {
          return { ...match, inProgress: true };
        }
        return match;
      })
    );
    
    toast({
      title: "Partida iniciada",
      description: "Atualize o placar conforme necessário.",
    });
  };

  // Complete match
  const handleCompleteMatch = (matchId: string) => {
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    
    const match = matches[matchIndex];
    
    // Determine winner
    let winner: Team | undefined;
    if (match.scoreA > match.scoreB) {
      winner = match.teamA;
    } else if (match.scoreB > match.scoreA) {
      winner = match.teamB;
    }
    
    // Update match with winner
    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = {
      ...match,
      winner,
      completed: true,
      inProgress: false
    };
    
    setMatches(updatedMatches);
    
    toast({
      title: "Partida finalizada",
      description: `Vencedor: ${winner ? winner.name : 'Empate - Defina um vencedor!'}`,
      variant: winner ? "success" : "destructive"
    });
    
    // If there's a winner, update team lives
    if (winner) {
      // Update loser team - reduce lives
      let loser = winner.id === match.teamA.id ? match.teamB : match.teamA;
      
      if (loser.id) {  // Only proceed if there's a valid loser team
        setTeams(prevTeams => {
          return prevTeams.map(team => {
            if (team.id === loser.id) {
              const newLives = team.lives - 1;
              const eliminated = newLives <= 0;
              
              // Update the loser in the teams array
              const updatedTeam = {
                ...team,
                lives: newLives,
                eliminated
              };
              
              // Also update the loser reference for the match
              loser = updatedTeam;
              
              // Update winner's points
              const winnerIndex = prevTeams.findIndex(t => t.id === winner?.id);
              if (winnerIndex >= 0) {
                prevTeams[winnerIndex] = {
                  ...prevTeams[winnerIndex],
                  totalPoints: prevTeams[winnerIndex].totalPoints + 100
                };
              }
              
              return updatedTeam;
            }
            return team;
          });
        });

        // Show toast if team is eliminated
        if (loser.lives <= 1) {  // Will become 0 after update
          toast({
            title: `${loser.name} eliminado!`,
            description: loser.reEntered 
              ? "Esta equipe já estava na reinscrição e foi eliminada definitivamente."
              : `A equipe pode fazer uma reinscrição até a RODADA ${currentTournament.rules?.reentryAllowedUntilRound || 5}`,
            variant: "destructive"
          });
        }
      }
    }
  };

  // Set winner manually
  const handleSetWinner = (matchId: string, team: 'A' | 'B') => {
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    
    const match = matches[matchIndex];
    const winner = team === 'A' ? match.teamA : match.teamB;
    const loser = team === 'A' ? match.teamB : match.teamA;
    
    // Update match with winner
    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = {
      ...match,
      winner,
      completed: true,
      inProgress: false
    };
    
    setMatches(updatedMatches);
    
    toast({
      title: "Vencedor definido",
      description: `${winner.name} venceu a partida.`,
      variant: "success"
    });
    
    // Update team lives
    if (loser.id) {
      setTeams(prevTeams => {
        return prevTeams.map(team => {
          if (team.id === loser.id) {
            const newLives = team.lives - 1;
            const eliminated = newLives <= 0;
            
            return {
              ...team,
              lives: newLives,
              eliminated
            };
          }
          return team;
        });
      });
    }
  };

  // Reenter a team
  const handleReenterTeam = (teamId: string) => {
    const currentRound = parseInt(currentTournament.currentRound.replace(/\D/g, ''));
    const maxReentryRound = currentTournament.rules?.reentryAllowedUntilRound || 5;
    
    if (currentRound > maxReentryRound) {
      toast({
        title: "Reinscrição não permitida",
        description: `Reinscrições são permitidas apenas até a RODADA ${maxReentryRound}`,
        variant: "destructive"
      });
      return;
    }

    setTeams(prevTeams => {
      return prevTeams.map(team => {
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
    });
    
    toast({
      title: "Time reinscrito",
      description: "O time foi reinscrito com uma vida",
      variant: "warning"
    });
  };

  return (
    <>
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="teams">Times</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gerenciar Partidas</CardTitle>
                <Button onClick={createNewRound}>
                  Criar Nova Rodada
                </Button>
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
                                      <Badge className="bg-green-700 text-xs">Vencedor</Badge>
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
                                      <Badge className="bg-green-700 text-xs">Vencedor</Badge>
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
                              {match.completed && <span className="text-green-700 font-semibold">Finalizada</span>}
                              {match.inProgress && <span className="text-orange-500">Em andamento</span>}
                              {!match.inProgress && !match.completed && <span className="text-slate-400">Aguardando</span>}
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
                                    onClick={() => handleCompleteMatch(match.id)}
                                  >
                                    Finalizar
                                  </Button>
                                )}
                                
                                {match.completed && !match.winner && (
                                  <>
                                    <Button 
                                      variant="success" 
                                      size="sm"
                                      onClick={() => handleSetWinner(match.id, 'A')}
                                    >
                                      Time A venceu
                                    </Button>
                                    <Button 
                                      variant="success" 
                                      size="sm"
                                      onClick={() => handleSetWinner(match.id, 'B')}
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
        </TabsContent>
        
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gerenciar Times</CardTitle>
                <Button onClick={handleAddTeam}>
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
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-center">Vidas</TableHead>
                    <TableHead className="text-center">Pontos</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map(team => (
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
                      <TableCell>{team.sponsor.name}</TableCell>
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
                              variant="warning"
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Torneio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="tournament-name">Nome do Torneio</Label>
                  <Input
                    id="tournament-name"
                    value={currentTournament.name}
                    onChange={(e) => setCurrentTournament({...currentTournament, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="tournament-location">Local</Label>
                  <Input
                    id="tournament-location"
                    value={currentTournament.location}
                    onChange={(e) => setCurrentTournament({...currentTournament, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="tournament-date">Data</Label>
                  <Input
                    id="tournament-date"
                    type="date"
                    value={currentTournament.date.toISOString().split('T')[0]}
                    onChange={(e) => setCurrentTournament({
                      ...currentTournament, 
                      date: new Date(e.target.value)
                    })}
                  />
                </div>
                
                <div className="border-t pt-4 mt-2">
                  <h3 className="font-semibold mb-4">Regras do Torneio</h3>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="initial-lives">Vidas Iniciais</Label>
                      <Input
                        id="initial-lives"
                        type="number"
                        min={1}
                        max={3}
                        value={currentTournament.rules?.initialLives || 2}
                        onChange={(e) => setCurrentTournament({
                          ...currentTournament, 
                          rules: {
                            ...currentTournament.rules!,
                            initialLives: parseInt(e.target.value) || 2
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reentry-limit">Limite de Rodada para Reinscrição</Label>
                      <Input
                        id="reentry-limit"
                        type="number"
                        min={1}
                        value={currentTournament.rules?.reentryAllowedUntilRound || 5}
                        onChange={(e) => setCurrentTournament({
                          ...currentTournament, 
                          rules: {
                            ...currentTournament.rules!,
                            reentryAllowedUntilRound: parseInt(e.target.value) || 5
                          }
                        })}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Equipes podem se reinscrever após eliminação até esta rodada.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="points-to-win">Pontos para Vencer</Label>
                      <Input
                        id="points-to-win"
                        type="number"
                        min={100}
                        step={100}
                        value={currentTournament.rules?.pointsToWin || 3000}
                        onChange={(e) => setCurrentTournament({
                          ...currentTournament, 
                          rules: {
                            ...currentTournament.rules!,
                            pointsToWin: parseInt(e.target.value) || 3000
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 flex justify-end">
                  <Button onClick={() => {
                    toast({
                      title: "Configurações salvas",
                      description: "As alterações foram aplicadas ao torneio."
                    });
                  }}>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Team edit dialog */}
      {teamToEdit && (
        <TeamEditDialog
          team={teamToEdit}
          open={isTeamDialogOpen}
          onClose={() => setIsTeamDialogOpen(false)}
          onSave={handleSaveTeam}
          currentRound={parseInt(currentTournament.currentRound?.replace(/\D/g, '') || "1")}
          maxReentryRound={currentTournament.rules?.reentryAllowedUntilRound || 5}
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
              {matches.some(m => 
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
            <AlertDialogAction onClick={confirmDeleteTeam}>
              Excluir Time
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
    </>
  );
};

export default AdminPanel;
