
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import { useTournament } from "@/context/TournamentContext";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
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
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingOverlay from "@/components/LoadingOverlay";

const Admin = () => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  // Usando o contexto global em vez do estado local
  const { tournament, updateTournament, resetTournament, loading, isUpdating } = useTournament();

  const handleReset = () => {
    console.log("Solicitação de reset do torneio iniciada");
    resetTournament();
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
              disabled={loading || isUpdating}
            >
              {isUpdating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
              Resetar Torneio
            </Button>
          </div>
          
          <ErrorBoundary>
            <AdminPanel 
              tournament={tournament} 
              onUpdateTournament={updateTournament}
              loading={loading}
            />
          </ErrorBoundary>
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
      
      {/* Loading overlay for major operations */}
      <LoadingOverlay show={isUpdating} message="Salvando alterações..." transparent />
    </div>
  );
};

export default Admin;
