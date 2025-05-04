
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Bug } from "lucide-react";
import { Tournament } from "@/lib/types";

interface DebugPanelProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ tournament, onUpdateTournament }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentRoundNumber = parseInt(tournament.currentRound.replace(/\D/g, '') || "1");

  const handleForceAdvanceRound = () => {
    const nextRoundNumber = currentRoundNumber + 1;
    onUpdateTournament({
      ...tournament,
      currentRound: `RODADA ${nextRoundNumber}`,
      maxRound: Math.max(tournament.maxRound || 1, nextRoundNumber)
    });
  };

  const handleFixMatchReferences = () => {
    // Create a map of teams by id for quick lookup
    const teamsMap = tournament.teams.reduce((map, team) => {
      map[team.id] = team;
      return map;
    }, {} as Record<string, typeof tournament.teams[0]>);
    
    // Fix match references
    const fixedMatches = tournament.matches.map(match => {
      const teamA = match.teamA?.id ? teamsMap[match.teamA.id] : match.teamA;
      const teamB = match.teamB?.id ? teamsMap[match.teamB.id] : match.teamB;
      const winner = match.winner?.id ? teamsMap[match.winner.id] : match.winner;
      
      return {
        ...match,
        teamA: teamA || match.teamA,
        teamB: teamB || match.teamB,
        winner: winner
      };
    });
    
    onUpdateTournament({
      ...tournament,
      matches: fixedMatches
    });
  };

  const handleResetTeamLives = () => {
    const updatedTeams = tournament.teams.map(team => ({
      ...team,
      lives: team.reEntered ? 1 : 2,
      eliminated: false
    }));
    
    onUpdateTournament({
      ...tournament,
      teams: updatedTeams
    });
  };

  const handleDumpStateToConsole = () => {
    console.log("Current tournament state:", tournament);
    console.log("Teams:", tournament.teams);
    console.log("Matches:", tournament.matches);
    console.log("Current Round:", tournament.currentRound);
  };

  return (
    <Card className="mt-4 border-amber-500 border-dashed">
      <CardHeader className="pb-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-amber-500 flex items-center">
                <Bug className="mr-2 h-5 w-5" />
                Painel de Debug
              </CardTitle>
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-gray-500">
                Estas ferramentas são úteis para diagnóstico e teste, cuidado ao utilizá-las.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleForceAdvanceRound}
                  className="border-amber-500"
                >
                  Forçar Próxima Rodada
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleFixMatchReferences}
                  className="border-amber-500"
                >
                  Corrigir Referências de Times
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleResetTeamLives}
                  className="border-amber-500"
                >
                  Resetar Vidas dos Times
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleDumpStateToConsole}
                  className="border-amber-500"
                >
                  Log do Estado (Console)
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                Versão de Debug: v0.1 • ID do Torneio: {tournament.id.substring(0, 8)}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};

export default DebugPanel;
