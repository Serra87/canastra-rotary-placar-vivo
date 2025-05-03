
import { Team } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TeamEditForm from "@/components/Teams/TeamEditForm";
import { useTeamEditDialog } from "@/hooks/useTeamEditDialog";

interface TeamEditDialogProps {
  team: Team;
  open: boolean;
  onClose: () => void;
  onSave: (updatedTeam: Team) => void;
  currentRound: number;
  maxReentryRound: number;
}

const TeamEditDialog = ({ team, open, onClose, onSave, currentRound, maxReentryRound }: TeamEditDialogProps) => {
  const { editedTeam, setEditedTeam, handleSave } = useTeamEditDialog({
    team,
    currentRound,
    maxReentryRound,
    onSave,
    onClose
  });

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
