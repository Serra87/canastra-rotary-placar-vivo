
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

    // Process the loser - deduct one life and check elimination status
    if (losingTeam && losingTeam.id) {
      updatedTeams = updatedTeams.map((t) => {
        if (t.id === losingTeam.id) {
          const newLives = t.lives - 1;
          // A team is eliminated if it has 0 lives AND hasn't been re-entered
          const eliminated = newLives <= 0 && !t.reEntered;
          
          return {
            ...t,
            lives: newLives < 0 ? 0 : newLives,
            eliminated
          };
        }
        return t;
      });
    }

    // Update match
    const updatedMatch: Match = {
      ...match,
      scoreA,
      scoreB,
      winner: winningTeam,
      completed: true,
      inProgress: false,
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
  const renderHearts = (team: Team) => (
    <div className="flex items-center mt-1">
      {Array.from({ length: team.lives }).map((_, i) => (
        <span key={i} className="text-red-500 mr-0.5">❤️</span>
      ))}
      {Array.from({ length: (team.reEntered ? 1 : 2) - team.lives }).map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300 mr-0.5">♡</span>
      ))}
      <span className="ml-2 text-xs">
        {team.eliminated ? "Eliminado" : team.reEntered ? "Reinscrito" : "Ativo"}
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
          <div className="space-y-2">
            <div>
              <Label>{match.teamA.name}</Label>
              <Input
                type="number"
                value={scoreA}
                onChange={(e) => setScoreA(Number(e.target.value))}
              />
              {renderHearts(match.teamA)}
            </div>
            <div>
              <Label>{match.teamB.name}</Label>
              <Input
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(Number(e.target.value))}
              />
              {renderHearts(match.teamB)}
            </div>
            <div>
              <Label>Vencedor</Label>
              <Select value={winner} onValueChange={setWinner}>
                <SelectTrigger>
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
