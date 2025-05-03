
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import { useTournament } from "@/context/TournamentContext";

const Admin = () => {
  // Usando o contexto global em vez do estado local
  const { tournament, updateTournament } = useTournament();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-rotary-navy">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie times, partidas e configurações do torneio
            </p>
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
