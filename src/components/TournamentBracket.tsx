
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
  
  // Function to get match connector lines
  const getConnectorClass = (index: number, totalMatches: number, isFirst: boolean = true) => {
    if (totalMatches === 1) return ""; // Final match, no connectors
    
    // For pairs of matches
    if (isFirst) {
      return index % 2 === 0 ? "connector-top" : "";
    } else {
      return index % 2 === 0 ? "" : "connector-bottom";
    }
  };
  
  return (
    <Card className="w-full shadow-lg border-t-4 border-t-rotary-blue">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-rotary-navy text-center text-xl">Chave do Torneio</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4">
          {phaseOrder.map((phase, phaseIndex) => (
            <div key={phase} className="flex-shrink-0 md:w-80 w-72">
              <div className="text-lg font-semibold text-center mb-4 px-2 py-1 bg-slate-100 rounded-md text-rotary-navy">
                {phase}
              </div>
              <div className="space-y-10 relative">
                {matchesByPhase[phase]?.map((match, matchIndex) => (
                  <div 
                    key={match.id} 
                    className={`relative match-container ${
                      getConnectorClass(matchIndex, matchesByPhase[phase].length)
                    }`}
                  >
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
                    
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <TeamCard team={match.teamA} showSponsor={false} compact={true} />
                        <div className="absolute top-1/2 -right-10 -translate-y-1/2 font-bold text-lg text-rotary-blue">
                          {match.inProgress || match.completed ? match.scoreA : "-"}
                        </div>
                      </div>
                      
                      <div className="flex justify-center items-center text-sm py-1 text-gray-500">
                        <div className="w-10 h-px bg-gray-300"></div>
                        <span className="mx-2">VS</span>
                        <div className="w-10 h-px bg-gray-300"></div>
                      </div>
                      
                      <div className="relative">
                        <TeamCard team={match.teamB} showSponsor={false} compact={true} />
                        <div className="absolute top-1/2 -right-10 -translate-y-1/2 font-bold text-lg text-rotary-blue">
                          {match.inProgress || match.completed ? match.scoreB : "-"}
                        </div>
                      </div>
                    </div>
                    
                    {match.winner && (
                      <div className="mt-3 flex items-center justify-center">
                        <div className="bg-green-100 text-green-800 rounded-full flex items-center px-3 py-1 text-sm">
                          <span className="mr-1">Vencedor:</span> 
                          <span className="font-semibold">{match.winner.name}</span>
                          <ChevronRight size={16} className="ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Adiciona conectores entre fases */}
                    {phaseIndex < phaseOrder.length - 1 && match.winner && (
                      <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-6 h-1 bg-green-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <style jsx global>{`
        .match-container.connector-top::after {
          content: '';
          position: absolute;
          top: calc(100% + 1.5rem);
          right: -1.5rem;
          width: 1.5rem;
          height: 6rem;
          border-top-right-radius: 0.5rem;
          border-right: 2px solid #d1d5db;
          border-top: 2px solid #d1d5db;
        }

        .match-container.connector-bottom::after {
          content: '';
          position: absolute;
          bottom: calc(100% + 1rem);
          right: -1.5rem;
          width: 1.5rem;
          height: 6rem;
          border-bottom-right-radius: 0.5rem;
          border-right: 2px solid #d1d5db;
          border-bottom: 2px solid #d1d5db;
        }

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
