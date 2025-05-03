
import React, { useState } from "react";
import { Match, Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus, Minus } from "lucide-react";

interface MatchStatusEditorProps {
  match: Match;
  teams: Team[];
  onSave: (updatedMatch: Match, updatedTeams: Team[]) => void;
}

export default function MatchStatusEditor({ match, teams, onSave }: MatchStatusEditorProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<string>(
    match.completed ? "Finalizada" : match.inProgress ? "Iniciada" : "Aguardando"
  );
  const [scoreA, setScoreA] = useState<number>(match.scoreA);
  const [scoreB, setScoreB] = useState<number>(match.scoreB);
  const [winner, setWinner] = useState<string | undefined>(match.winner?.id);
  const [showResultDialog, setShowResultDialog] = useState(false);
  
  // Add states for team lives
  const [teamALives, setTeamALives] = useState<number>(match.teamA.lives);
  const [teamBLives, setTeamBLives] = useState<number>(match.teamB.lives);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    
    // Update match status based on selection
    if (value === "Aguardando") {
      const updatedMatch = {
        ...match,
        inProgress: false,
        completed: false
      };
      onSave(updatedMatch, teams);
      toast({ 
        title: "Status atualizado", 
        description: "Partida aguardando início"
      });
    } else if (value === "Iniciada") {
      const updatedMatch = {
        ...match,
        inProgress: true,
        completed: false
      };
      onSave(updatedMatch, teams);
      toast({ 
        title: "Status atualizado", 
        description: "Partida iniciada" 
      });
    } else if (value === "Finalizada") {
      setShowResultDialog(true);
    }
  };

  // Helper function to update team lives
  const handleUpdateTeamLives = (team: 'A' | 'B', increment: boolean) => {
    if (team === 'A') {
      const newLives = increment 
        ? Math.min((match.teamA.reEntered ? 1 : 2), teamALives + 1) 
        : Math.max(0, teamALives - 1);
      setTeamALives(newLives);
    } else {
      const newLives = increment 
        ? Math.min((match.teamB.reEntered ? 1 : 2), teamBLives + 1) 
        : Math.max(0, teamBLives - 1);
      setTeamBLives(newLives);
    }
  };

  const handleConfirmResult = () => {
    if (!winner) {
      toast({ 
        title: "Selecione um vencedor", 
        variant: "destructive"
      });
      return;
    }
    
    const winningTeam = teams.find((t) => t.id === winner);
    const losingTeam = winner === match.teamA.id ? match.teamB : match.teamA;
    let updatedTeams = [...teams];

    // Update both teams with manually adjusted lives
    updatedTeams = updatedTeams.map((t) => {
      if (t.id === match.teamA.id) {
        const eliminated = teamALives <= 0 && !match.teamA.reEntered;
        return {
          ...t,
          lives: teamALives,
          eliminated
        };
      }
      if (t.id === match.teamB.id) {
        const eliminated = teamBLives <= 0 && !match.teamB.reEntered;
        return {
          ...t,
          lives: teamBLives,
          eliminated
        };
      }
      return t;
    });

    // Update match
    const updatedMatch: Match = {
      ...match,
      scoreA,
      scoreB,
      winner: winningTeam,
      completed: true,
      inProgress: false,
      teamA: {
        ...match.teamA,
        lives: teamALives,
        eliminated: teamALives <= 0 && !match.teamA.reEntered
      },
      teamB: {
        ...match.teamB, 
        lives: teamBLives,
        eliminated: teamBLives <= 0 && !match.teamB.reEntered
      }
    };

    onSave(updatedMatch, updatedTeams);
    setShowResultDialog(false);
    toast({ 
      title: "Resultado salvo", 
      description: "Partida finalizada e sincronizada com o placar",
      variant: "default"
    });
  };

  // Helper function to render hearts for teams
  const renderHearts = (team: Team, lives: number) => (
    <div className="flex items-center mt-1">
      {Array.from({ length: lives }).map((_, i) => (
        <Heart key={i} size={16} className="text-red-500 fill-red-500 mr-0.5" />
      ))}
      {Array.from({ length: (team.reEntered ? 1 : 2) - lives }).map((_, i) => (
        <Heart key={`empty-${i}`} size={16} className="text-gray-300 mr-0.5" />
      ))}
      <span className="ml-2 text-xs">
        {lives <= 0 ? "Eliminado" : team.reEntered ? "Reinscrito" : "Ativo"}
      </span>
    </div>
  );

  return (
    <div className="space-y-4">
      <Label>Status da Partida</Label>
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Aguardando">Aguardando</SelectItem>
          <SelectItem value="Iniciada">Iniciada</SelectItem>
          <SelectItem value="Finalizada">Finalizada</SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado da Partida</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="border-b pb-3">
              <Label>{match.teamA.name}</Label>
              <div className="mt-2 flex items-center space-x-2">
                <Input
                  type="number"
                  value={scoreA}
                  onChange={(e) => setScoreA(Number(e.target.value))}
                  className="w-24"
                />
                <div className="flex items-center space-x-1">
                  <Label className="text-sm">Vidas:</Label>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUpdateTeamLives('A', false)}
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="w-8 text-center">{teamALives}</span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUpdateTeamLives('A', true)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
              {renderHearts(match.teamA, teamALives)}
            </div>
            
            <div className="border-b pb-3">
              <Label>{match.teamB.name}</Label>
              <div className="mt-2 flex items-center space-x-2">
                <Input
                  type="number"
                  value={scoreB}
                  onChange={(e) => setScoreB(Number(e.target.value))}
                  className="w-24"
                />
                <div className="flex items-center space-x-1">
                  <Label className="text-sm">Vidas:</Label>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUpdateTeamLives('B', false)}
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="w-8 text-center">{teamBLives}</span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUpdateTeamLives('B', true)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
              {renderHearts(match.teamB, teamBLives)}
            </div>
            
            <div>
              <Label>Vencedor</Label>
              <Select value={winner} onValueChange={setWinner}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Escolha o vencedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={match.teamA.id}>{match.teamA.name}</SelectItem>
                  <SelectItem value={match.teamB.id}>{match.teamB.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleConfirmResult}>Confirmar Resultado</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
