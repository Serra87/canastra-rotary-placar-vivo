
import { useState } from "react";
import { useTournament } from "@/context/tournament/TournamentContext";
import { Tournament } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Separator } from "@/components/ui/separator";
import AdminPanel from "@/components/AdminPanel";
import { generateUUID } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import AdminHeader from "@/components/Admin/AdminHeader";
import TournamentSummary from "@/components/Admin/TournamentSummary";

const Admin = () => {
  const { tournament, updateTournament, resetTournament, loading, isUpdating } = useTournament();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Função para inicializar um novo torneio (ou atualizar existente)
  const handleStartTournament = async () => {
    const now = new Date();
    
    const newTournament: Tournament = {
      id: tournament?.id || generateUUID(),
      name: tournament?.name || "Torneio de Canasta",
      date: tournament?.date || now,
      location: tournament?.location || "Rotary Club",
      teams: tournament?.teams || [],
      matches: tournament?.matches || [],
      currentRound: tournament?.currentRound || "RODADA 1",
      maxRound: tournament?.maxRound || 1,
      rules: tournament?.rules || {
        reentryAllowedUntilRound: 3,
        pointsToWin: 3000
      }
    };

    try {
      await updateTournament(newTournament);
      toast({
        title: "Torneio iniciado!",
        description: `${newTournament.name} foi iniciado com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao iniciar torneio:", error);
      toast({
        variant: "destructive",
        title: "Erro ao iniciar torneio",
        description: "Não foi possível iniciar o torneio."
      });
    }
  };
  
  // Função para resetar o torneio
  const handleResetTournament = async () => {
    try {
      await resetTournament();
      setConfirmOpen(false);
    } catch (error) {
      console.error("Erro ao resetar torneio:", error);
      toast({
        variant: "destructive",
        title: "Erro ao resetar torneio",
        description: "Não foi possível resetar o torneio."
      });
    }
  };
  
  if (loading) {
    return <LoadingOverlay show={true} message="Carregando dados do torneio..." />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <LoadingOverlay show={isUpdating} transparent message="Salvando alterações..." />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdminHeader 
          onStartTournament={handleStartTournament}
          onResetTournament={handleResetTournament}
          confirmOpen={confirmOpen}
          setConfirmOpen={setConfirmOpen}
          tournamentExists={!!tournament?.id}
        />
        
        <Separator className="my-6" />
        
        <TournamentSummary 
          tournament={tournament} 
          onStartTournament={handleStartTournament} 
        />
        
        {tournament?.id && (
          <AdminPanel 
            tournament={tournament} 
            onUpdateTournament={updateTournament}
            loading={isUpdating}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
