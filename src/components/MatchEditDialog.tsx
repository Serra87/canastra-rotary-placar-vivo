import { useState, useEffect } from "react";
import { Match, Team } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MatchEditDialogProps {
  match: Match;
  open: boolean;
  onClose: () => void;
  onSave: (updatedMatch: Match) => void;
  availableTeams: Team[];
}

const MatchEditDialog = ({ match, open, onClose, onSave, availableTeams }: MatchEditDialogProps) => {
  const { toast } = useToast();
  const [editedMatch, setEditedMatch] = useState<Match>({ ...match });
  
  // Reset form when match changes
  useEffect(() => {
    setEditedMatch({ ...match });
  }, [match]);

  const handleSave = () => {
    // Validate
    if (editedMatch.teamA.id && editedMatch.teamB.id && editedMatch.teamA.id === editedMatch.teamB.id) {
      toast({
        title: "Erro",
        description: "Um time não pode enfrentar a si mesmo",
        variant: "destructive"
      });
      return;
    }
    
    onSave(editedMatch);
    onClose();
  };

  const handleTeamChange = (teamId: string, side: 'A' | 'B') => {
    const selectedTeam = availableTeams.find(t => t.id === teamId) || {
      id: 'undefined',
      name: 'Time a definir',
      players: ['', ''],
      eliminated: false,
      totalPoints: 0,
      lives: 0,
      reEntered: false
    };

    if (side === 'A') {
      setEditedMatch(prev => ({ ...prev, teamA: selectedTeam }));
    } else {
      setEditedMatch(prev => ({ ...prev, teamB: selectedTeam }));
    }
  };

  const handleScoreChange = (score: number, side: 'A' | 'B') => {
    if (score < 0) score = 0;
    
    if (side === 'A') {
      setEditedMatch(prev => ({ ...prev, scoreA: score }));
    } else {
      setEditedMatch(prev => ({ ...prev, scoreB: score }));
    }
  };

  const teamOptions = [
    { id: 'undefined', name: 'Time a definir', reEntered: false },
    ...availableTeams
      .filter(t => !t.eliminated || t.id === match.teamA.id || t.id === match.teamB.id)
      .sort((a, b) => a.name.localeCompare(b.name))
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Partida</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="table-number" className="text-right">
              Mesa
            </Label>
            <Input
              id="table-number"
              type="number"
              value={editedMatch.tableNumber || ''}
              onChange={(e) => setEditedMatch({ 
                ...editedMatch, 
                tableNumber: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              min={1}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="round" className="text-right">
              Rodada
            </Label>
            <Input
              id="round"
              value={editedMatch.round || ''}
              readOnly
              disabled
              className="col-span-3 bg-slate-50"
            />
          </div>
          
          <div className="border-t pt-4 pb-2">
            <h3 className="font-medium mb-4 text-center">Times</h3>
            
            <div className="space-y-4">
              {/* Team A */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Time A</Label>
                <div className="col-span-3">
                  <Select 
                    value={editedMatch.teamA.id || 'undefined'} 
                    onValueChange={(value) => handleTeamChange(value, 'A')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um time" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamOptions.map(team => (
                        <SelectItem key={`a-${team.id || 'empty'}`} value={team.id}>
                          {team.name}
                          {team.reEntered && " ⚠️"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Team B */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Time B</Label>
                <div className="col-span-3">
                  <Select 
                    value={editedMatch.teamB.id || 'undefined'} 
                    onValueChange={(value) => handleTeamChange(value, 'B')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um time" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamOptions.map(team => (
                        <SelectItem key={`b-${team.id || 'empty'}`} value={team.id}>
                          {team.name}
                          {team.reEntered && " ⚠️"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 pb-2">
            <h3 className="font-medium mb-4 text-center">Pontuação</h3>
            
            <div className="flex justify-center items-center gap-4">
              <div>
                <Label htmlFor="score-a" className="block mb-2 text-center">
                  {editedMatch.teamA.id ? editedMatch.teamA.name : "Time A"}
                </Label>
                <Input
                  id="score-a"
                  type="number"
                  value={editedMatch.scoreA}
                  onChange={(e) => handleScoreChange(parseInt(e.target.value) || 0, 'A')}
                  min={0}
                  className="w-20 text-center"
                  disabled={!editedMatch.inProgress}
                />
              </div>
              
              <span className="text-2xl">x</span>
              
              <div>
                <Label htmlFor="score-b" className="block mb-2 text-center">
                  {editedMatch.teamB.id ? editedMatch.teamB.name : "Time B"}
                </Label>
                <Input
                  id="score-b"
                  type="number"
                  value={editedMatch.scoreB}
                  onChange={(e) => handleScoreChange(parseInt(e.target.value) || 0, 'B')}
                  min={0}
                  className="w-20 text-center"
                  disabled={!editedMatch.inProgress}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className="col-span-3">
              {editedMatch.completed && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  Finalizada
                </span>
              )}
              {editedMatch.inProgress && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                  Em andamento
                </span>
              )}
              {!editedMatch.completed && !editedMatch.inProgress && (
                <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-sm">
                  Aguardando
                </span>
              )}
            </div>
          </div>
          
          {(editedMatch.teamA.id === match.teamA.id && editedMatch.teamB.id === match.teamB.id) || 
           (editedMatch.teamA.id === match.teamB.id && editedMatch.teamB.id === match.teamA.id) ? null : (
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-500" />
              <p className="text-sm text-yellow-800">
                Alterações nos times da partida podem impactar no fluxo do torneio.
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

export default MatchEditDialog;
