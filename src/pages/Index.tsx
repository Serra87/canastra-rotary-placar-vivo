
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScoreboardTable from "@/components/ScoreboardTable";
import TournamentBracket from "@/components/TournamentBracket";
import { mockTournament, getRankedTeams } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [rankedTeams] = useState(getRankedTeams());
  
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
                {mockTournament.currentRound}
              </Badge>
              <span className="text-sm text-gray-600">
                {mockTournament.date.toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          
          <div className="space-y-8">
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
