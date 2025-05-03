
import React from "react";
import { Tournament, Match, Team } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import ManualMatchCreator from "@/components/ManualMatchCreator";
import MatchStatusEditor from "@/components/MatchStatusEditor";
import { useMatchManagement } from "@/hooks/useMatchManagement";

interface MatchesTabProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
  loading?: boolean; // Added loading prop
}

const MatchesTab: React.FC<MatchesTabProps> = ({ tournament, onUpdateTournament, loading = false }) => {
  const currentRoundNumber = parseInt(tournament.currentRound.replace(/\D/g, '') || "1");
  
  // Use the match management hook to handle match operations
  const {
    matches,
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

  // Handler for advancing to the next round
  const handleNextRound = () => {
    const nextRoundNumber = currentRoundNumber + 1;
    const nextRound = `RODADA ${nextRoundNumber}`;
    
    onUpdateTournament({
      ...tournament,
      currentRound: nextRound,
      maxRound: Math.max(tournament.maxRound || 1, nextRoundNumber)
    });
  };
  
  // Update match and teams when a match is completed
  const handleSaveMatch = (updatedMatch: Match, updatedTeams: Team[]) => {
    const updatedMatches = matches.map(m => 
      m.id === updatedMatch.id ? updatedMatch : m
    );
    
    onUpdateTournament({
      ...tournament,
      matches: updatedMatches,
      teams: updatedTeams
    });
  };
  
  // If loading, show skeleton UI
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Partidas</CardTitle>
            <div className="space-x-2">
              <Button variant="outline" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </Button>
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Rodada Atual</TabsTrigger>
              <TabsTrigger value="all">Todas Rodadas</TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">RODADA 1</h3>
                </div>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="grid grid-cols-5 gap-4 items-center">
                          <div className="col-span-2">
                            <Skeleton className="h-8 w-full" />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <Skeleton className="h-8 w-full" />
                          </div>
                          <div className="col-span-2">
                            <Skeleton className="h-8 w-full" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-9 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
  
  // Check if there are any incomplete matches in the current round
  const currentRoundMatches = matchesByRound[tournament.currentRound] || [];
  const hasIncompleteMatches = currentRoundMatches.some(match => !match.completed);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gerenciar Partidas</CardTitle>
          <div className="space-x-2">
            <ManualMatchCreator
              teams={tournament.teams}
              roundNumber={currentRoundNumber}
              existingMatches={tournament.matches}
              onCreateMatch={handleAddManualMatch}
              currentRound={tournament.currentRound}
            />
            <Button
              onClick={handleNextRound}
              disabled={hasIncompleteMatches}
              title={hasIncompleteMatches ? "Finalize todas as partidas da rodada atual antes de avançar" : ""}
            >
              Próxima Rodada
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current">Rodada Atual</TabsTrigger>
            <TabsTrigger value="all">Todas Rodadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{tournament.currentRound}</h3>
              </div>
              
              {currentRoundMatches.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-lg">
                    Nenhuma partida encontrada para esta rodada.
                    <br />
                    Use o botão "Criar Partida Manual" para adicionar partidas.
                  </p>
                </div>
              ) : (
                currentRoundMatches.map(match => (
                  <MatchStatusEditor
                    key={match.id}
                    match={match}
                    teams={tournament.teams}
                    onSave={handleSaveMatch}
                    onUpdateScore={handleUpdateScore}
                    onStartMatch={() => handleStartMatch(match.id)}
                    onCompleteMatch={() => handleCompleteMatch(match.id)}
                    onSetWinner={handleSetWinner}
                    onDeleteMatch={() => handleDeleteMatch(match.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all">
            <div className="space-y-8">
              {rounds.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-lg">
                    Nenhuma rodada ou partida encontrada.
                  </p>
                </div>
              ) : (
                rounds.map(round => (
                  <div key={round} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{round}</h3>
                      {round === tournament.currentRound && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Rodada Atual
                        </span>
                      )}
                    </div>
                    
                    {(matchesByRound[round] || []).map(match => (
                      <MatchStatusEditor
                        key={match.id}
                        match={match}
                        teams={tournament.teams}
                        onSave={handleSaveMatch}
                        onUpdateScore={handleUpdateScore}
                        onStartMatch={() => handleStartMatch(match.id)}
                        onCompleteMatch={() => handleCompleteMatch(match.id)}
                        onSetWinner={handleSetWinner}
                        onDeleteMatch={() => handleDeleteMatch(match.id)}
                        disabled={round !== tournament.currentRound}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MatchesTab;
