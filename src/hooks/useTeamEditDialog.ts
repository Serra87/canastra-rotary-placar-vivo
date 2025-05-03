
import { useState, useEffect } from "react";
import { Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UseTeamEditDialogProps {
  team: Team;
  currentRound: number;
  maxReentryRound: number;
  onSave: (updatedTeam: Team) => void;
  onClose: () => void;
}

export const useTeamEditDialog = ({
  team,
  currentRound,
  maxReentryRound,
  onSave,
  onClose
}: UseTeamEditDialogProps) => {
  const { toast } = useToast();
  const [editedTeam, setEditedTeam] = useState<Team>({ ...team });

  // Reset the form when the team prop changes
  useEffect(() => {
    setEditedTeam({ ...team });
  }, [team]);

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

  const validateTeam = (team: Team): boolean => {
    if (!team.name.trim()) {
      toast({
        title: "Erro ao salvar",
        description: "O nome do time não pode estar vazio",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateTeam(editedTeam)) {
      return;
    }

    onSave(editedTeam);
    onClose();
  };

  return {
    editedTeam,
    setEditedTeam,
    handleSave,
    handleReenter
  };
};
