
import { Match } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamCard from "./TeamCard";

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
      <CardContent className="p-6">
        <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4">
          {phaseOrder.map((phase) => (
            <div key={phase} className="flex-shrink-0 w-80">
              <h3 className="text-lg font-semibold text-center mb-4 text-rotary-navy">{phase}</h3>
              <div className="space-y-8">
                {matchesByPhase[phase]?.map((match) => (
                  <div key={match.id} className="relative">
                    <div className="mb-2 flex justify-between items-center text-sm text-gray-600">
                      <span>Mesa {match.tableNumber || '-'}</span>
                      <span>
                        {match.inProgress && (
                          <span className="inline-flex items-center text-red-600">
                            <span className="h-2 w-2 rounded-full bg-red-600 mr-1 animate-pulse-light"></span>
                            Jogando agora
                          </span>
                        )}
                        {match.completed && <span className="text-green-600">Finalizado</span>}
                        {!match.inProgress && !match.completed && <span>Pendente</span>}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <TeamCard team={match.teamA} showSponsor={false} />
                        {match.inProgress || match.completed ? (
                          <div className="absolute top-1/2 -right-10 -translate-y-1/2 font-bold text-lg text-rotary-blue">
                            {match.scoreA}
                          </div>
                        ) : null}
                      </div>
                      
                      <span className="text-center text-sm py-1 text-gray-500">vs</span>
                      
                      <div className="relative">
                        <TeamCard team={match.teamB} showSponsor={false} />
                        {match.inProgress || match.completed ? (
                          <div className="absolute top-1/2 -right-10 -translate-y-1/2 font-bold text-lg text-rotary-blue">
                            {match.scoreB}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    
                    {match.winner && (
                      <div className="mt-2 text-center">
                        <span className="inline-block px-3 py-1 bg-rotary-gold text-white text-sm rounded">
                          Vencedor: {match.winner.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentBracket;
