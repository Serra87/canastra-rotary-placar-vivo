
import React, { useState } from "react";
import { Tournament, Match } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScoreboardLiveProps {
  tournament: Tournament;
}

export default function ScoreboardLive({ tournament }: ScoreboardLiveProps) {
  // State for round filtering
  const [selectedRound, setSelectedRound] = useState<string | "all">("all");
  
  // Group matches by round
  const matchesByRound: Record<string, Match[]> = {};
  tournament.matches.forEach((match) => {
    if (!match.round) return;
    
    // Ensure all rounds are formatted consistently
    const roundKey = match.round.startsWith("RODADA") ? match.round : `RODADA ${match.round}`;
    
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

  // Hearts display helper function
  const renderHearts = (team: any) => (
    <span className="flex">
      {Array.from({ length: team.lives }).map((_, i) => (
        <span key={i} className="text-red-500 mr-0.5">❤️</span>
      ))}
      {Array.from({ length: (team.reEntered ? 1 : 2) - team.lives }).map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300 mr-0.5">♡</span>
      ))}
    </span>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chave do Torneio</CardTitle>
          {rounds.length > 0 && (
            <div className="w-64">
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por rodada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as rodadas</SelectItem>
                  {rounds.map((round) => (
                    <SelectItem key={round} value={round}>
                      {round}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          {filteredRounds.length > 0 ? (
            filteredRounds.map((roundKey) => (
              <div key={roundKey} className="animate-fade-in">
                <h2 className="text-xl font-bold mb-4">{roundKey}</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Mesa</TableHead>
                      <TableHead>Times</TableHead>
                      <TableHead className="w-32 text-center">Pontuação</TableHead>
                      <TableHead className="w-40 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchesByRound[roundKey].map((match) => (
                      <TableRow key={match.id} className={match.inProgress ? "bg-yellow-50 animate-pulse" : ""}>
                        <TableCell className="text-center font-bold">
                          {match.tableNumber || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {/* Team A */}
                            <div className="p-2">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{match.teamA.name}</span>
                                {match.teamA.eliminated && (
                                  <Badge variant="destructive" className="ml-2">Eliminado</Badge>
                                )}
                                {match.completed && match.winner?.id !== match.teamA.id && !match.teamA.eliminated && (
                                  <Badge variant="outline" className="ml-2 text-slate-600">Derrota</Badge>
                                )}
                                {match.teamA.reEntered && (
                                  <div className="flex items-center">
                                    <AlertTriangle size={14} className="text-yellow-500 ml-1" />
                                    <Badge variant="outline" className="ml-1 text-yellow-700 border-yellow-300 bg-yellow-50">
                                      Reinscrito
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                <span>{match.teamA.players.join(' / ')}</span>
                                {renderHearts(match.teamA)}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center text-sm text-gray-400 my-1">vs</div>
                            
                            {/* Team B */}
                            <div className="p-2">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{match.teamB.name}</span>
                                {match.teamB.eliminated && (
                                  <Badge variant="destructive" className="ml-2">Eliminado</Badge>
                                )}
                                {match.completed && match.winner?.id !== match.teamB.id && !match.teamB.eliminated && (
                                  <Badge variant="outline" className="ml-2 text-slate-600">Derrota</Badge>
                                )}
                                {match.teamB.reEntered && (
                                  <div className="flex items-center">
                                    <AlertTriangle size={14} className="text-yellow-500 ml-1" />
                                    <Badge variant="outline" className="ml-1 text-yellow-700 border-yellow-300 bg-yellow-50">
                                      Reinscrito
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                <span>{match.teamB.players.join(' / ')}</span>
                                {renderHearts(match.teamB)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xl font-bold">
                          {match.scoreA} <span className="text-gray-400">x</span> {match.scoreB}
                        </TableCell>
                        <TableCell className="text-center">
                          {match.completed ? (
                            <div className="flex flex-col items-center">
                              <Badge variant="default" className="bg-green-600">Finalizada</Badge>
                              {match.winner && (
                                <span className="text-sm mt-1">
                                  Vencedor: <span className="font-medium">{match.winner.name}</span>
                                </span>
                              )}
                            </div>
                          ) : match.inProgress ? (
                            <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-800 animate-pulse">
                              Em andamento
                            </Badge>
                          ) : (
                            <Badge variant="outline">Aguardando</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {matchesByRound[roundKey].length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Nenhuma partida encontrada nesta rodada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="mb-2 text-lg font-semibold">Nenhuma rodada configurada</p>
              <p>Adicione equipes e crie partidas no painel administrativo para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
