
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import { useTournament } from "@/context/TournamentContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  // Usando o contexto global em vez do estado local
  const { tournament, updateTournament, resetTournament } = useTournament();

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja apagar todos os times e rodadas? Esta ação não pode ser desfeita.")) {
      resetTournament();
      toast({
        title: "Torneio resetado",
        description: "Todos os times e rodadas foram removidos",
        variant: "default"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-rotary-navy">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie times, partidas e configurações do torneio
              </p>
            </div>
            <Button variant="destructive" onClick={handleReset}>
              Resetar Torneio
            </Button>
          </div>
          
          <AdminPanel 
            tournament={tournament} 
            onUpdateTournament={updateTournament}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
