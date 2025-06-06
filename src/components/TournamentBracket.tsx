
import { Match } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TeamCard from "./TeamCard";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TournamentBracketProps {
  matches: Match[];
}

export const TournamentBracket = ({ matches }: TournamentBracketProps) => {
  // Group matches by round
  const matchesByRound: Record<string, Match[]> = {};
  matches.forEach(match => {
    if (match.round) { // Add null check for round
      const roundName = `RODADA ${match.round}`;
      if (!matchesByRound[roundName]) {
        matchesByRound[roundName] = [];
      }
      matchesByRound[roundName].push(match);
    }
  });

  // Get all rounds in order
  const rounds = Object.keys(matchesByRound).sort((a, b) => {
    const aNum = parseInt(a.replace(/\D/g, '')) || 0; // Add fallback to 0 if NaN
    const bNum = parseInt(b.replace(/\D/g, '')) || 0; // Add fallback to 0 if NaN
    return aNum - bNum;
  });

  // If there are no rounds, show a placeholder message
  if (rounds.length === 0) {
    return (
      <Card className="w-full shadow-lg border-t-4 border-t-rotary-blue">
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-rotary-navy text-center text-xl">Chave do Torneio</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            Nenhuma rodada foi configurada ainda. Crie times e partidas no painel administrativo.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-lg border-t-4 border-t-rotary-blue">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-rotary-navy text-center text-xl">Chave do Torneio</CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-hidden">
        <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 min-w-full">
          {rounds.map((round, roundIndex) => (
            <div key={round} className="flex-shrink-0 min-w-[280px] w-full max-w-[350px]">
              <div className="text-lg font-semibold text-center mb-4 px-2 py-1 bg-slate-100 rounded-md text-rotary-navy">
                {round}
              </div>
              
              <div className="space-y-12 relative">
                {matchesByRound[round]?.map((match, matchIndex) => (
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
                      <div className={`p-3 border-b ${
                        match.winner?.id === match.teamA.id 
                          ? 'bg-green-700/20 border-green-700' 
                          : match.completed && match.winner?.id !== match.teamA.id 
                            ? 'bg-red-50 border-red-300 eliminated-team' 
                            : 'border-slate-200'
                      }`}>
                        <div className="flex justify-between items-center relative">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {match.teamA.id && match.teamA.reEntered && (
                                <AlertTriangle size={16} className="text-yellow-500" />
                              )}
                              <TeamCard 
                                team={match.teamA} 
                                compact={true} 
                              />
                            </div>
                          </div>
                          <div className={`ml-3 flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                            match.winner?.id === match.teamA.id 
                              ? 'bg-green-700 text-white' 
                              : match.completed && match.winner?.id !== match.teamA.id 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100'
                          }`}>
                            {match.inProgress || match.completed ? match.scoreA : "-"}
                          </div>
                          
                          {/* Elimination indicator for Team A */}
                          {match.completed && match.winner?.id !== match.teamA.id && (
                            <div className="absolute inset-0 pointer-events-none eliminated-overlay">
                              <div className="absolute inset-0 flex items-center justify-center">
                                {match.teamA.eliminated ? (
                                  <Badge variant="destructive" className="absolute z-10">Eliminado</Badge>
                                ) : (
                                  <Badge variant="outline" className="absolute z-10 text-slate-600">Derrota</Badge>
                                )}
                                <div className="absolute h-[2px] w-full bg-red-500 rotate-12 transform"></div>
                                <div className="absolute h-[2px] w-full bg-red-500 -rotate-12 transform"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Team B */}
                      <div className={`p-3 ${
                        match.winner?.id === match.teamB.id 
                          ? 'bg-green-700/20 border-green-700' 
                          : match.completed && match.winner?.id !== match.teamB.id 
                            ? 'bg-red-50 border-red-300 eliminated-team' 
                            : ''
                      }`}>
                        <div className="flex justify-between items-center relative">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {match.teamB.id && match.teamB.reEntered && (
                                <AlertTriangle size={16} className="text-yellow-500" />
                              )}
                              <TeamCard 
                                team={match.teamB} 
                                compact={true} 
                              />
                            </div>
                          </div>
                          <div className={`ml-3 flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                            match.winner?.id === match.teamB.id 
                              ? 'bg-green-700 text-white' 
                              : match.completed && match.winner?.id !== match.teamB.id 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-slate-100'
                          }`}>
                            {match.inProgress || match.completed ? match.scoreB : "-"}
                          </div>
                          
                          {/* Elimination indicator for Team B */}
                          {match.completed && match.winner?.id !== match.teamB.id && (
                            <div className="absolute inset-0 pointer-events-none eliminated-overlay">
                              <div className="absolute inset-0 flex items-center justify-center">
                                {match.teamB.eliminated ? (
                                  <Badge variant="destructive" className="absolute z-10">Eliminado</Badge>
                                ) : (
                                  <Badge variant="outline" className="absolute z-10 text-slate-600">Derrota</Badge>
                                )}
                                <div className="absolute h-[2px] w-full bg-red-500 rotate-12 transform"></div>
                                <div className="absolute h-[2px] w-full bg-red-500 -rotate-12 transform"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Winner indicator with enhanced visibility */}
                    {match.winner && (
                      <div className="mt-3 flex items-center justify-center">
                        <div className="bg-green-700 text-white border border-green-800 rounded-full flex items-center px-3 py-1 text-sm font-medium shadow-sm animate-pulse-light">
                          <span className="mr-1">Vencedor:</span> 
                          <span className="font-bold">{match.winner.name}</span>
                          <ArrowRight size={16} className="ml-1 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Connection arrows between rounds */}
                    {roundIndex < rounds.length - 1 && match.winner && (
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
      
      <style>
        {`
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
        
        .eliminated-team {
          position: relative;
        }
        
        .eliminated-overlay {
          z-index: 5;
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
          background-color: #15803d;
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
          border-left: 8px solid #15803d;
        }
        
        @media (max-width: 768px) {
          .arrow-container {
            display: none;
          }
        }
        `}
      </style>
    </Card>
  );
};

export default TournamentBracket;
