
import { useEffect, useState } from "react";
import { useTournament } from "@/context/tournament/TournamentContext";
import { Tournament } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPanel from "@/components/AdminPanel";
import { generateUUID } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Trophy } from "lucide-react";
import DebugPanel from "@/components/AdminTabs/DebugPanel"; // Import the debug panel

const Admin = () => {
  const { tournament, updateTournament, resetTournament, loading, isUpdating } = useTournament();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false); // Add debug mode state

  // Check for debug mode on mount and enable if special key is pressed
  useEffect(() => {
    const checkDebugMode = (e: KeyboardEvent) => {
      // Enable debug mode with Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => {
          const newMode = !prev;
          toast({
            title: newMode ? "Modo Debug Ativado" : "Modo Debug Desativado",
            description: newMode ? "Funcionalidades de diagnóstico disponíveis" : "Voltando ao modo normal"
          });
          return newMode;
        });
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', checkDebugMode);
    return () => window.removeEventListener('keydown', checkDebugMode);
  }, []);

  // Função para inicializar um novo torneio (ou atualizar existente)
  const handleStartTournament = async () => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-rotary-navy">Painel Administrativo</h1>
            <p className="text-gray-500">Gerencie times, partidas e configurações do torneio</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleStartTournament} className="bg-rotary-gold hover:bg-rotary-gold/90">
              {tournament?.id ? "Atualizar Torneio" : "Iniciar Torneio"}
            </Button>
            
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Resetar Torneio</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resetar o Torneio?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover todos os times e partidas do torneio. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetTournament}>
                    Sim, resetar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {tournament?.id ? (
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
        ) : (
          <Card className="mb-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy size={64} className="text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Nenhum Torneio Ativo
              </h2>
              <p className="text-gray-500 text-center max-w-md mb-6">
                Clique em "Iniciar Torneio" para começar um novo torneio ou carregar um existente.
              </p>
              <Button onClick={handleStartTournament} className="bg-rotary-gold hover:bg-rotary-gold/90">
                Iniciar Torneio
              </Button>
            </CardContent>
          </Card>
        )}
        
        {tournament?.id && (
          <>
            <AdminPanel 
              tournament={tournament} 
              onUpdateTournament={updateTournament}
              loading={isUpdating}
            />
            
            {/* Show debug panel when in debug mode */}
            {debugMode && (
              <DebugPanel 
                tournament={tournament} 
                onUpdateTournament={updateTournament} 
              />
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
