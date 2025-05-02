
import { useState } from "react";
import { Match, Team, Tournament } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface AdminPanelProps {
  tournament: Tournament;
}

export const AdminPanel = ({ tournament }: AdminPanelProps) => {
  const { toast } = useToast();
  const [activeMatches, setActiveMatches] = useState<Match[]>(
    tournament.matches.filter(match => !match.completed)
  );
  
  const handleUpdateScore = (matchId: string, team: 'A' | 'B', score: number) => {
    setActiveMatches(
      activeMatches.map(match => {
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
    const match = activeMatches.find(m => m.id === matchId);
    if (!match) return;
    
    // Determine winner
    let winner: Team | undefined;
    if (match.scoreA > match.scoreB) {
      winner = match.teamA;
    } else if (match.scoreB > match.scoreA) {
      winner = match.teamB;
    }
    
    // In a real app, this would update the backend
    toast({
      title: "Partida finalizada",
      description: `Vencedor: ${winner ? winner.name : 'Empate'}`,
    });
  };
  
  const handleStartMatch = (matchId: string) => {
    setActiveMatches(
      activeMatches.map(match => {
        if (match.id === matchId) {
          return { ...match, inProgress: true };
        }
        return match;
      })
    );
    
    toast({
      title: "Partida iniciada",
      description: "O placar está sendo atualizado em tempo real.",
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Times</TableHead>
                  <TableHead className="text-center">Pontuação</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeMatches.map(match => (
                  <TableRow key={match.id}>
                    <TableCell>{match.tableNumber || '-'}</TableCell>
                    <TableCell>{match.phase}</TableCell>
                    <TableCell>
                      <div>
                        {match.teamA.name} vs {match.teamB.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {match.teamA.sponsor.name} / {match.teamB.sponsor.name}
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
                          disabled={!match.inProgress || match.completed}
                        />
                        <span className="text-muted-foreground">x</span>
                        <Input
                          type="number"
                          min={0}
                          className="w-20 text-center"
                          value={match.scoreB}
                          onChange={(e) => handleUpdateScore(match.id, 'B', parseInt(e.target.value) || 0)}
                          disabled={!match.inProgress || match.completed}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {match.completed && <span className="text-green-600">Finalizado</span>}
                      {match.inProgress && <span className="text-orange-500">Em andamento</span>}
                      {!match.inProgress && !match.completed && <span className="text-slate-400">Pendente</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {!match.inProgress && !match.completed && (
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
