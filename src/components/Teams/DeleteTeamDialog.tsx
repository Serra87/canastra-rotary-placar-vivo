
import React from "react";
import { Team, Match } from "@/lib/types";
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

interface DeleteTeamDialogProps {
  teamToDelete: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  matches: Match[];
}

const DeleteTeamDialog = ({ 
  teamToDelete, 
  isOpen, 
  onClose, 
  onConfirm, 
  matches 
}: DeleteTeamDialogProps) => {
  if (!teamToDelete) {
    return null;
  }

  const hasActiveMatches = matches.some(m => 
    (m.teamA.id === teamToDelete?.id || m.teamB.id === teamToDelete?.id) && 
    !m.completed
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o time {teamToDelete.name}? Esta ação não pode ser desfeita.
            {hasActiveMatches && (
              <p className="mt-2 text-red-500 font-semibold">
                Atenção: Este time possui partidas em andamento ou agendadas. Excluí-lo afetará essas partidas.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Excluir Time
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTeamDialog;
