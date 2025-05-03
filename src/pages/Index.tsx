
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScoreboardTable from "@/components/ScoreboardTable";
import TournamentBracket from "@/components/TournamentBracket";
import ScoreboardLive from "@/components/ScoreboardLive";
import { Badge } from "@/components/ui/badge";
import { useTournament } from "@/context/TournamentContext";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, TrophyIcon, Loader2 } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = () => {
  // Usar o contexto global em vez dos dados mock estáticos
  const { tournament, rankedTeams, loading } = useTournament();
  
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
  
  // Verifica se o torneio está vazio (sem times ou partidas)
  const isTournamentEmpty = tournament.teams.length === 0 && tournament.matches.length === 0;
  
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
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon size={14} className="mr-1" />
                {formatDate(tournament.date)}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-rotary-blue" />
              <span className="ml-3 text-lg text-gray-700">Carregando dados do torneio...</span>
            </div>
          ) : (
            <ErrorBoundary>
              {isTournamentEmpty ? (
                <Card className="text-center py-12 bg-slate-50">
                  <CardContent className="flex flex-col items-center justify-center">
                    <TrophyIcon size={64} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                      Torneio Novo
                    </h2>
                    <p className="text-gray-500 text-lg max-w-lg mx-auto">
                      Ainda não há times ou partidas cadastradas. Acesse o painel administrativo para iniciar o torneio.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Dashboard />
                  <ScoreboardLive tournament={tournament} />
                  <TournamentBracket matches={tournament.matches} />
                </>
              )}
              
              <ScoreboardTable teams={rankedTeams} />
            </ErrorBoundary>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
