
import React from "react";
import { Tournament } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TournamentSummaryProps {
  tournament: Tournament | null;
  onStartTournament: () => void;
}

const TournamentSummary: React.FC<TournamentSummaryProps> = ({ tournament, onStartTournament }) => {
  if (!tournament?.id) {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy size={64} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Nenhum Torneio Ativo
          </h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            Clique em "Iniciar Torneio" para começar um novo torneio ou carregar um existente.
          </p>
          <Button onClick={onStartTournament} className="bg-rotary-gold hover:bg-rotary-gold/90">
            Iniciar Torneio
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-500">Torneio</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-bold">{tournament.name}</h3>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <CalendarIcon size={14} className="mr-1" />
            {tournament.date.toLocaleDateString('pt-BR')}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-500">Times</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-bold">{tournament.teams.length}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {tournament.teams.filter(t => !t.eliminated).length} em jogo, 
            {tournament.teams.filter(t => t.eliminated).length} eliminados
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-500">Rodada Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-bold">{tournament.currentRound}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {tournament.matches.filter(m => m.round === tournament.currentRound).length} partidas nesta rodada
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentSummary;
