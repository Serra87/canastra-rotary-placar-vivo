
import { useState, useEffect } from "react";
import { Team } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

  const handleLivesChange = (lives: number) => {
    if (lives >= 0 && lives <= (editedTeam.reEntered ? 1 : 2)) {
      setEditedTeam(prev => ({
        ...prev,
        lives,
        eliminated: lives === 0
      }));
    }
  };

  const handleReenter = () => {
    if (currentRound > maxReentryRound) {
      toast({
        title: "Reinscrição não permitida",
        description: `Reinscrições são permitidas apenas até a rodada ${maxReentryRound}`,
        variant: "destructive"
      });
      return;
    }

    setEditedTeam(prev => ({
      ...prev,
      lives: 1,
      eliminated: false,
      reEntered: true
    }));
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team-name" className="text-right">
              Nome
            </Label>
            <Input
              id="team-name"
              value={editedTeam.name}
              onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player1" className="text-right">
              Jogador 1
            </Label>
            <Input
              id="player1"
              value={editedTeam.players[0]}
              onChange={(e) => {
                const newPlayers: [string, string] = [e.target.value, editedTeam.players[1]];
                setEditedTeam({ ...editedTeam, players: newPlayers });
              }}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player2" className="text-right">
              Jogador 2
            </Label>
            <Input
              id="player2"
              value={editedTeam.players[1]}
              onChange={(e) => {
                const newPlayers: [string, string] = [editedTeam.players[0], e.target.value];
                setEditedTeam({ ...editedTeam, players: newPlayers });
              }}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Vidas</Label>
            <div className="col-span-3 flex gap-2 items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleLivesChange(editedTeam.lives - 1)}
                disabled={editedTeam.lives === 0}
              >
                -
              </Button>
              
              <div className="flex mx-2">
                {Array.from({ length: editedTeam.lives }).map((_, i) => (
                  <Heart key={i} size={20} className="text-red-500 fill-red-500 mr-1" />
                ))}
                {Array.from({ length: (editedTeam.reEntered ? 1 : 2) - editedTeam.lives }).map((_, i) => (
                  <Heart key={`empty-${i}`} size={20} className="text-gray-300 mr-1" />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleLivesChange(editedTeam.lives + 1)}
                disabled={editedTeam.lives === (editedTeam.reEntered ? 1 : 2)}
              >
                +
              </Button>
              
              <span className="ml-2 text-sm">
                {editedTeam.lives}/{editedTeam.reEntered ? 1 : 2}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className="col-span-3">
              {editedTeam.eliminated ? (
                <div className="flex items-center justify-between">
                  <span className="text-red-500 font-medium">Eliminado</span>
                  {!editedTeam.reEntered && currentRound <= maxReentryRound && (
                    <Button 
                      variant="warning" 
                      size="sm" 
                      onClick={handleReenter}
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle size={14} />
                      Reinscrever
                    </Button>
                  )}
                </div>
              ) : (
                <span className="text-green-600 font-medium">Ativo</span>
              )}
            </div>
          </div>

          {editedTeam.reEntered && (
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-500" />
              <p className="text-sm text-yellow-800">
                Este time foi reinscrito e possui apenas uma vida.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamEditDialog;
