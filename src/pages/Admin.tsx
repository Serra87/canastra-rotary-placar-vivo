
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import { useTournament } from "@/context/TournamentContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const Admin = () => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  // Usando o contexto global em vez do estado local
  const { tournament, updateTournament, resetTournament } = useTournament();

  const handleReset = () => {
    resetTournament();
    toast({
      title: "Torneio resetado com sucesso",
      description: "Todos os times e rodadas foram removidos",
      variant: "default"
    });
    setIsResetDialogOpen(false);
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
            <Button 
              variant="destructive" 
              onClick={() => setIsResetDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 size={18} />
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
      
      {/* Reset confirmation dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar reset do torneio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar todos os times e rodadas? Esta ação não pode ser desfeita.
              Todos os dados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, resetar torneio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
