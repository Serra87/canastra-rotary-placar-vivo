
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
  
  // Função auxiliar para formatar a data de maneira segura
  const formatDate = (dateValue: Date | string) => {
    if (!dateValue) return "";
    
    try {
      // Se for uma string, tenta converter para Date
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "";
    }
  };
  
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
                {formatDate(tournament.date)}
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
