
import { Match } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamCard from "./TeamCard";
import { ArrowRight } from "lucide-react";

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

  // Define the order of phases with new names
  const phaseOrder = ['Primeira Fase', 'Segunda Fase', 'Fase Final'];
  
  // Map the old phase names to new ones for backwards compatibility with existing data
  const phaseNameMap: Record<string, string> = {
    'Quartas de Final': 'Primeira Fase',
    'Semi-Final': 'Segunda Fase',
    'Final': 'Fase Final'
  };
  
  // Function to get the display name for a phase
  const getPhaseDisplayName = (phase: string) => {
    return phaseNameMap[phase] || phase;
  };
  
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
                {matchesByPhase[Object.keys(phaseNameMap).find(key => phaseNameMap[key] === phase) || phase]?.map((match, matchIndex) => (
                  <div key={match.id} className="match-bracket relative">
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
                    <div className={`match-container border rounded-lg overflow-hidden ${match.winner ? (match.winner.id === match.teamA.id ? 'team-a-winner' : 'team-b-winner') : ''}`}>
                      {/* Team A */}
                      <div className={`p-3 border-b ${match.winner?.id === match.teamA.id ? 'bg-green-50 border-green-300' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <TeamCard 
                              team={match.teamA} 
                              showSponsor={false} 
                              compact={true} 
                            />
                          </div>
                          <div className={`ml-3 flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${match.winner?.id === match.teamA.id ? 'bg-green-100 text-green-800' : 'bg-slate-100'}`}>
                            {match.inProgress || match.completed ? match.scoreA : "-"}
                          </div>
                        </div>
                      </div>
                      
                      {/* Team B */}
                      <div className={`p-3 ${match.winner?.id === match.teamB.id ? 'bg-green-50 border-green-300' : ''}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <TeamCard 
                              team={match.teamB} 
                              showSponsor={false} 
                              compact={true} 
                            />
                          </div>
                          <div className={`ml-3 flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${match.winner?.id === match.teamB.id ? 'bg-green-100 text-green-800' : 'bg-slate-100'}`}>
                            {match.inProgress || match.completed ? match.scoreB : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Winner indicator with enhanced visibility */}
                    {match.winner && (
                      <div className="mt-3 flex items-center justify-center">
                        <div className="bg-green-100 text-green-800 border border-green-300 rounded-full flex items-center px-3 py-1 text-sm font-medium shadow-sm animate-pulse-light">
                          <span className="mr-1">Vencedor:</span> 
                          <span className="font-bold">{match.winner.name}</span>
                          {phaseIndex < phaseOrder.length - 1 && (
                            <ArrowRight size={16} className="ml-1 text-green-700" />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Connection arrows between phases */}
                    {phaseIndex < phaseOrder.length - 1 && match.winner && (
                      <div className="arrow-container absolute">
                        <div className="arrow-line"></div>
                        <div className="arrow-head"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <style jsx>{`
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-light {
          animation: pulse-light 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes pulse-light {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .team-a-winner .team-a {
          background-color: #ecfdf5;
          border-color: #6ee7b7;
        }
        
        .team-b-winner .team-b {
          background-color: #ecfdf5;
          border-color: #6ee7b7;
        }
        
        /* Arrow styles */
        .arrow-container {
          position: absolute;
          right: -30px;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 2px;
          display: block;
        }
        
        .arrow-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background-color: #22c55e;
          top: 0;
        }
        
        .arrow-head {
          position: absolute;
          right: 0;
          top: -4px;
          width: 0;
          height: 0;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-left: 8px solid #22c55e;
        }
        
        @media (max-width: 768px) {
          .arrow-container {
            display: none;
          }
        }
      `}</style>
    </Card>
  );
};

export default TournamentBracket;
