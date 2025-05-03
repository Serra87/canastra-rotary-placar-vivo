
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScoreboardTable from "@/components/ScoreboardTable";
import TournamentBracket from "@/components/TournamentBracket";
import ScoreboardLive from "@/components/ScoreboardLive";
import { Badge } from "@/components/ui/badge";
import { useTournament } from "@/context/TournamentContext";

const Index = () => {
  // Usar o contexto global em vez dos dados mock estáticos
  const { tournament, rankedTeams } = useTournament();
  
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
                {tournament.currentRound}
              </Badge>
              <span className="text-sm text-gray-600">
                {tournament.date.toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          
          <div className="space-y-8">
            <ScoreboardLive tournament={tournament} />
            
            <TournamentBracket matches={tournament.matches} />
            
            <ScoreboardTable teams={rankedTeams} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
