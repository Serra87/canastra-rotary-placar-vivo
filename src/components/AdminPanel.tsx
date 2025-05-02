
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
import { ArrowRight } from "lucide-react";

interface AdminPanelProps {
  tournament: Tournament;
}

export const AdminPanel = ({ tournament }: AdminPanelProps) => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>(tournament.matches);
  
  // Group matches by phase
  const matchesByPhase: Record<string, Match[]> = {};
  matches.forEach(match => {
    const displayPhase = getPhaseDisplayName(match.phase);
    if (!matchesByPhase[displayPhase]) {
      matchesByPhase[displayPhase] = [];
    }
    matchesByPhase[displayPhase].push(match);
  });
  
  // Map the old phase names to new ones for backwards compatibility
  const phaseNameMap: Record<string, string> = {
    'Quartas de Final': 'Primeira Fase',
    'Semi-Final': 'Segunda Fase',
    'Final': 'Fase Final'
  };
  
  // Function to get the display name for a phase
  const getPhaseDisplayName = (phase: string) => {
    return phaseNameMap[phase] || phase;
  };
  
  // Define the order of phases
  const phaseOrder = ['Primeira Fase', 'Segunda Fase', 'Fase Final'];
  
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
  
  const handleCompleteMatch = (matchId: string) => {
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    
    const match = matches[matchIndex];
    
    // Determine winner
    let winner: Team | undefined;
    if (match.scoreA > match.scoreB) {
      winner = match.teamA;
      
      // Update the next match if it exists (advance winner)
      const nextPhaseIndex = phaseOrder.indexOf(getPhaseDisplayName(match.phase)) + 1;
      if (nextPhaseIndex < phaseOrder.length) {
        const nextPhaseName = Object.keys(phaseNameMap).find(
          key => phaseNameMap[key] === phaseOrder[nextPhaseIndex]
        ) || phaseOrder[nextPhaseIndex];
        
        // Find the next match where this team would advance
        const nextMatchIndex = matches.findIndex(
          m => m.phase === nextPhaseName && (
            (!m.teamA.id || m.teamA.id === '') || 
            (!m.teamB.id || m.teamB.id === '')
          )
        );
        
        if (nextMatchIndex !== -1) {
          const nextMatch = matches[nextMatchIndex];
          const updatedNextMatch = { 
            ...nextMatch,
            teamA: !nextMatch.teamA.id || nextMatch.teamA.id === '' ? match.teamA : nextMatch.teamA,
            teamB: nextMatch.teamA.id && nextMatch.teamA.id !== '' ? match.teamA : nextMatch.teamB
          };
          
          // Update the matches array with the new next match
          const updatedMatches = [...matches];
          updatedMatches[nextMatchIndex] = updatedNextMatch;
          setMatches(updatedMatches);
        }
      }
      
    } else if (match.scoreB > match.scoreA) {
      winner = match.teamB;
      
      // Update the next match if it exists (advance winner)
      const nextPhaseIndex = phaseOrder.indexOf(getPhaseDisplayName(match.phase)) + 1;
      if (nextPhaseIndex < phaseOrder.length) {
        const nextPhaseName = Object.keys(phaseNameMap).find(
          key => phaseNameMap[key] === phaseOrder[nextPhaseIndex]
        ) || phaseOrder[nextPhaseIndex];
        
        // Find the next match where this team would advance
        const nextMatchIndex = matches.findIndex(
          m => m.phase === nextPhaseName && (
            (!m.teamA.id || m.teamA.id === '') || 
            (!m.teamB.id || m.teamB.id === '')
          )
        );
        
        if (nextMatchIndex !== -1) {
          const nextMatch = matches[nextMatchIndex];
          const updatedNextMatch = { 
            ...nextMatch,
            teamA: !nextMatch.teamA.id || nextMatch.teamA.id === '' ? match.teamB : nextMatch.teamA,
            teamB: nextMatch.teamA.id && nextMatch.teamA.id !== '' ? match.teamB : nextMatch.teamB
          };
          
          // Update the matches array with the new next match
          const updatedMatches = [...matches];
          updatedMatches[nextMatchIndex] = updatedNextMatch;
          setMatches(updatedMatches);
        }
      }
    }
    
    // Update completed match with winner
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
      variant: winner ? "default" : "destructive"
    });
  };
  
  const handleSetWinner = (matchId: string, team: 'A' | 'B') => {
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    
    const match = matches[matchIndex];
    const winner = team === 'A' ? match.teamA : match.teamB;
    
    // Update completed match with winner
    const updatedMatches = [...matches];
    updatedMatches[matchIndex] = {
      ...match,
      winner,
      completed: true,
      inProgress: false
    };
    
    setMatches(updatedMatches);
    
    // Update the next match if it exists (advance winner)
    const nextPhaseIndex = phaseOrder.indexOf(getPhaseDisplayName(match.phase)) + 1;
    if (nextPhaseIndex < phaseOrder.length) {
      const nextPhaseName = Object.keys(phaseNameMap).find(
        key => phaseNameMap[key] === phaseOrder[nextPhaseIndex]
      ) || phaseOrder[nextPhaseIndex];
      
      // Find the next match where this team would advance
      const nextMatchIndex = matches.findIndex(
        m => m.phase === nextPhaseName && (
          (!m.teamA.id || m.teamA.id === '') || 
          (!m.teamB.id || m.teamB.id === '')
        )
      );
      
      if (nextMatchIndex !== -1) {
        const nextMatch = matches[nextMatchIndex];
        const updatedNextMatch = { 
          ...nextMatch,
          teamA: !nextMatch.teamA.id || nextMatch.teamA.id === '' ? winner : nextMatch.teamA,
          teamB: nextMatch.teamA.id && nextMatch.teamA.id !== '' ? winner : nextMatch.teamB
        };
        
        // Update the matches array with the new next match
        updatedMatches[nextMatchIndex] = updatedNextMatch;
        setMatches(updatedMatches);
      }
    }
    
    toast({
      title: "Vencedor definido",
      description: `${winner.name} avançou para a próxima fase.`,
      variant: "success"
    });
  };
  
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

  return (
    <Tabs defaultValue="matches" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="matches">Partidas</TabsTrigger>
        <TabsTrigger value="teams">Times</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
      </TabsList>
      
      <TabsContent value="matches">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Partidas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={phaseOrder[0]} className="w-full mb-6">
              <TabsList className="grid grid-cols-3 mb-4">
                {phaseOrder.map(phase => (
                  <TabsTrigger key={phase} value={phase}>{phase}</TabsTrigger>
                ))}
              </TabsList>
              
              {phaseOrder.map(phase => (
                <TabsContent key={phase} value={phase}>
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
                      {matchesByPhase[phase]?.map(match => (
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
                                <div className="flex justify-between">
                                  <span>{match.teamA.id ? match.teamA.name : 'Time a definir'}</span>
                                  {match.completed && match.winner?.id !== match.teamA.id && (
                                    <Badge variant="destructive" className="text-xs">Eliminado</Badge>
                                  )}
                                  {match.completed && match.winner?.id === match.teamA.id && (
                                    <Badge className="bg-green-700 text-xs">Vencedor</Badge>
                                  )}
                                </div>
                                {match.teamA.id && (
                                  <div className="text-xs text-muted-foreground">
                                    {match.teamA.sponsor.name}
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center text-sm text-muted-foreground">VS</div>
                              
                              <div className={`rounded p-1 ${match.completed && match.winner?.id === match.teamB.id ? 'bg-green-700/20' : match.completed && match.winner?.id !== match.teamB.id ? 'bg-red-50 relative' : ''}`}>
                                <div className="flex justify-between">
                                  <span>{match.teamB.id ? match.teamB.name : 'Time a definir'}</span>
                                  {match.completed && match.winner?.id !== match.teamB.id && (
                                    <Badge variant="destructive" className="text-xs">Eliminado</Badge>
                                  )}
                                  {match.completed && match.winner?.id === match.teamB.id && (
                                    <Badge className="bg-green-700 text-xs">Vencedor</Badge>
                                  )}
                                </div>
                                {match.teamB.id && (
                                  <div className="text-xs text-muted-foreground">
                                    {match.teamB.sponsor.name}
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
                              <div className="flex gap-2 justify-end">
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
                              </div>
                            )}
                            
                            {/* Display which team advances */}
                            {match.completed && match.winner && (
                              <div className="flex items-center justify-end text-sm text-green-700">
                                <span>Avança: {match.winner.name}</span>
                                <ArrowRight size={16} className="ml-1" />
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!matchesByPhase[phase]?.length && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            Nenhuma partida encontrada nesta fase.
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
            <CardTitle>Gerenciar Times</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Jogadores</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="text-center">Pontos</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournament.teams.map(team => (
                  <TableRow key={team.id}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.players.join(' / ')}</TableCell>
                    <TableCell>{team.sponsor.name}</TableCell>
                    <TableCell className="text-center">{team.totalPoints}</TableCell>
                    <TableCell className="text-center">
                      {team.eliminated ? (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-600">
                          Eliminado
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mr-2"
                      >
                        Editar
                      </Button>
                      {!team.eliminated && (
                        <Button 
                          variant="destructive"
                          size="sm"
                        >
                          Eliminar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button>
                Adicionar Time
              </Button>
            </div>
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
                  value={tournament.name}
                />
              </div>
              <div>
                <Label htmlFor="tournament-location">Local</Label>
                <Input
                  id="tournament-location"
                  value={tournament.location}
                />
              </div>
              <div>
                <Label htmlFor="tournament-date">Data</Label>
                <Input
                  id="tournament-date"
                  type="date"
                  value={tournament.date.toISOString().split('T')[0]}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <Button>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminPanel;
