
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AdminHeaderProps {
  onStartTournament: () => void;
  onResetTournament: () => void;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  tournamentExists: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  onStartTournament,
  onResetTournament,
  confirmOpen,
  setConfirmOpen,
  tournamentExists
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-rotary-navy">Painel Administrativo</h1>
        <p className="text-gray-500">Gerencie times, partidas e configurações do torneio</p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onStartTournament} className="bg-rotary-gold hover:bg-rotary-gold/90">
          {tournamentExists ? "Atualizar Torneio" : "Iniciar Torneio"}
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
              <AlertDialogAction onClick={onResetTournament}>
                Sim, resetar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminHeader;
