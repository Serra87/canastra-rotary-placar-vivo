
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScoreboardTable from "@/components/ScoreboardTable";
import TournamentBracket from "@/components/TournamentBracket";
import { mockTournament, getRankedTeams, getActiveMatches } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/lib/types";

const Index = () => {
  const [rankedTeams, setRankedTeams] = useState(getRankedTeams());
  const [activeMatches, setActiveMatches] = useState<Match[]>(getActiveMatches());
  
  // In a real app, we would use a websocket connection to get live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate score updates for active matches
      setActiveMatches(prevMatches => {
        return prevMatches.map(match => {
          if (match.inProgress) {
            return {
              ...match,
              scoreA: match.scoreA + Math.floor(Math.random() * 10),
              scoreB: match.scoreB + Math.floor(Math.random() * 10)
            };
          }
          return match;
        });
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-rotary-navy mb-2 md:mb-0">
              Placar ao Vivo
            </h1>
            <div className="flex items-center">
              <Badge variant="outline" className="bg-rotary-gold text-white mr-3">
                {mockTournament.currentPhase}
              </Badge>
              <span className="text-sm text-gray-600">
                {mockTournament.date.toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          
          <div className="space-y-8">
            {activeMatches.length > 0 && (
              <Card className="w-full shadow-lg border-t-4 border-t-red-500">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-center text-xl flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-red-600 mr-2 animate-pulse-light"></span>
                    Partidas em Andamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeMatches.map(match => (
                      <div key={match.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-600">{match.phase}</span>
                          <span className="text-sm bg-rotary-navy text-white px-2 py-1 rounded">
                            Mesa {match.tableNumber}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center my-4">
                          <div className="w-5/12">
                            <p className="font-semibold truncate">{match.teamA.name}</p>
                            <p className="text-sm text-gray-600 truncate">{match.teamA.sponsor.name}</p>
                          </div>
                          
                          <div className="w-2/12 flex justify-center items-center">
                            <div className="bg-slate-100 px-3 py-2 rounded font-bold text-rotary-blue">
                              {match.scoreA} x {match.scoreB}
                            </div>
                          </div>
                          
                          <div className="w-5/12 text-right">
                            <p className="font-semibold truncate">{match.teamB.name}</p>
                            <p className="text-sm text-gray-600 truncate">{match.teamB.sponsor.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-center mt-2">
                          <p className="text-xs text-red-600 font-medium">
                            Atualizando ao vivo
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <TournamentBracket matches={mockTournament.matches} />
            
            <ScoreboardTable teams={rankedTeams} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
