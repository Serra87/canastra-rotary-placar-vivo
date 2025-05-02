
import { Match } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamCard from "./TeamCard";
import { ChevronRight } from "lucide-react";

interface TournamentBracketProps {
  matches: Match[];
}

export const TournamentBracket = ({ matches }: TournamentBracketProps) => {
  // Group matches by phase
  const matchesByPhase: Record<string, Match[]> = {};
  matches.forEach(match => {
    if (!matchesByPhase[match.phase]) {
      matchesByPhase[match.phase] = [];
    }
    matchesByPhase[match.phase].push(match);
  });

  // Define the order of phases
  const phaseOrder = ['Quartas de Final', 'Semi-Final', 'Final'];
  
  return (
    <Card className="w-full shadow-lg border-t-4 border-t-rotary-blue">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-rotary-navy text-center text-xl">Chave do Torneio</CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-hidden">
        <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 min-w-full">
          {phaseOrder.map((phase, phaseIndex) => (
            <div key={phase} className="flex-shrink-0 min-w-[280px] w-full max-w-[350px]">
              <div className="text-lg font-semibold text-center mb-4 px-2 py-1 bg-slate-100 rounded-md text-rotary-navy">
                {phase}
              </div>
              
              <div className="space-y-12 relative">
                {matchesByPhase[phase]?.map((match, matchIndex) => (
                  <div key={match.id} className="match-bracket">
                    {/* Match info header */}
                    <div className="mb-2 flex justify-between items-center text-sm text-gray-600 px-1">
                      <span>Mesa {match.tableNumber || '-'}</span>
                      <span>
                        {match.inProgress && (
                          <span className="inline-flex items-center text-red-600">
                            <span className="h-2 w-2 rounded-full bg-red-600 mr-1 animate-pulse"></span>
                            Jogando agora
                          </span>
                        )}
                        {match.completed && <span className="text-green-600">Finalizado</span>}
                        {!match.inProgress && !match.completed && <span>Pendente</span>}
                      </span>
                    </div>

                    {/* Match container with teams and scores */}
                    <div className="match-container border border-slate-200 rounded-lg overflow-hidden">
                      {/* Team A */}
                      <div className="p-3 border-b border-slate-200">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <TeamCard team={match.teamA} showSponsor={false} compact={true} />
                          </div>
                          <div className="ml-3 flex items-center justify-center bg-slate-100 w-10 h-10 rounded-full font-bold text-lg">
                            {match.inProgress || match.completed ? match.scoreA : "-"}
                          </div>
                        </div>
                      </div>
                      
                      {/* Team B */}
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <TeamCard team={match.teamB} showSponsor={false} compact={true} />
                          </div>
                          <div className="ml-3 flex items-center justify-center bg-slate-100 w-10 h-10 rounded-full font-bold text-lg">
                            {match.inProgress || match.completed ? match.scoreB : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Winner indicator */}
                    {match.winner && (
                      <div className="mt-3 flex items-center justify-center">
                        <div className="bg-green-100 text-green-800 rounded-full flex items-center px-3 py-1 text-sm">
                          <span className="mr-1">Vencedor:</span> 
                          <span className="font-semibold">{match.winner.name}</span>
                          {phaseIndex < phaseOrder.length - 1 && (
                            <ChevronRight size={16} className="ml-1" />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Connection lines between phases */}
                    {phaseIndex < phaseOrder.length - 1 && match.winner && (
                      <div className="hidden md:block absolute right-[-30px] top-1/2 transform -translate-y-1/2 w-[30px] h-[2px] bg-green-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </Card>
  );
};

export default TournamentBracket;
