
import { useState, useEffect } from "react";
import { Team } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TeamEditForm from "@/components/Teams/TeamEditForm";

interface TeamEditDialogProps {
  team: Team;
  open: boolean;
  onClose: () => void;
  onSave: (updatedTeam: Team) => void;
  currentRound: number;
  maxReentryRound: number;
}

const TeamEditDialog = ({ team, open, onClose, onSave, currentRound, maxReentryRound }: TeamEditDialogProps) => {
  const { toast } = useToast();
  const [editedTeam, setEditedTeam] = useState<Team>({ ...team });

  // Reset the form when the team prop changes
  useEffect(() => {
    if (open) {
      setEditedTeam({ ...team });
    }
  }, [team, open]);

  const handleReenter = () => {
    if (currentRound > maxReentryRound) {
      toast({
        title: "Reinscrição não permitida",
        description: `Reinscrições são permitidas apenas até a rodada ${maxReentryRound}`,
        variant: "destructive"
      });
      return;
    }
  };

  const handleSave = () => {
    // Validate team data before saving
    if (!editedTeam.name.trim()) {
      toast({
        title: "Erro ao salvar",
        description: "O nome do time não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    onSave(editedTeam);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Time</DialogTitle>
        </DialogHeader>

        <TeamEditForm 
          team={editedTeam}
          onTeamChange={setEditedTeam}
          currentRound={currentRound}
          maxReentryRound={maxReentryRound}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamEditDialog;
