
import { useState } from "react";
import { Match, Team } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface ManualMatchCreatorProps {
  teams: Team[];
  onCreateMatch: (match: Match) => void;
  roundNumber?: number;
  existingMatches?: Match[]; // Add this to check for teams already playing in the round
  currentRound?: string;
  disabled?: boolean; // Add the disabled prop
}

export const ManualMatchCreator = ({ 
  teams, 
  onCreateMatch, 
  roundNumber = 1, 
  existingMatches = [],
  currentRound = "RODADA 1",
  disabled = false // Add default value
}: ManualMatchCreatorProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [teamAId, setTeamAId] = useState<string | undefined>(undefined);
  const [teamBId, setTeamBId] = useState<string | undefined>(undefined);
  const [tableNumber, setTableNumber] = useState<string>("");

  // Find teams already playing in this round
  const teamsAlreadyPlayingIds = new Set<string>();
  existingMatches.forEach(match => {
    if (match.round === currentRound || match.round === `RODADA ${roundNumber}`) {
      teamsAlreadyPlayingIds.add(match.teamA.id);
      teamsAlreadyPlayingIds.add(match.teamB.id);
    }
  });

  const handleCreate = () => {
    if (!teamAId || !teamBId) return;
    
    const teamA = teams.find((t) => t.id === teamAId);
    const teamB = teams.find((t) => t.id === teamBId);
    
    if (!teamA || !teamB || teamAId === teamBId) {
      toast({ 
        title: "Erro ao criar partida", 
        description: "Selecione duas equipes diferentes",
        variant: "destructive" 
      });
      return;
    }

    // Check if either team is already playing in this round
    if (teamsAlreadyPlayingIds.has(teamAId) || teamsAlreadyPlayingIds.has(teamBId)) {
      toast({
        title: "Erro ao criar partida",
        description: "Uma ou ambas as equipes já estão jogando nesta rodada",
        variant: "destructive"
      });
      return;
    }

    const match: Match = {
      id: `match-${roundNumber}-${Date.now()}`,
      teamA,
      teamB,
      scoreA: 0,
      scoreB: 0,
      round: currentRound || `${roundNumber}`,
      completed: false,
      inProgress: false,
      tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
    };

    onCreateMatch(match);
    setOpen(false);
    setTeamAId(undefined);
    setTeamBId(undefined);
    setTableNumber("");
    
    toast({
      title: "Partida criada",
      description: `${teamA.name} vs ${teamB.name}`,
      variant: "default"
    });
  };

  // Filter teams to only include those that have at least 1 life 
  // OR have been re-entered, even if marked as eliminated
  // AND are not already playing in this round
  const availableTeams = teams.filter(team => 
    (team.lives > 0 || team.reEntered) && 
    !team.eliminated &&
    !teamsAlreadyPlayingIds.has(team.id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" id="manual-match-creator" disabled={disabled}>Criar Partida Manual</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Partida Manual</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Dupla A</Label>
            <Select onValueChange={setTeamAId} value={teamAId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a Dupla A" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} {team.reEntered && "🔄"} {team.lives === 1 && "❤️"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Dupla B</Label>
            <Select onValueChange={setTeamBId} value={teamBId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a Dupla B" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} {team.reEntered && "🔄"} {team.lives === 1 && "❤️"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Mesa (opcional)</Label>
            <Input type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Número da mesa" />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={!teamAId || !teamBId || teamAId === teamBId}>Criar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualMatchCreator;
