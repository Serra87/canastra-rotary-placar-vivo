
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
import { useToast } from "@/components/ui/use-toast";

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
    let updatedMatch = { ...match };
    
    if (value === "Aguardando") {
      updatedMatch = {
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
      updatedMatch = {
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

    // Update winner's points
    if (winningTeam) {
      updatedTeams = updatedTeams.map((t) =>
        t.id === winningTeam.id ? { ...t, totalPoints: t.totalPoints + 100 } : t
      );
    }

    // Reduce loser's lives
    if (losingTeam && losingTeam.id) {
      updatedTeams = updatedTeams.map((t) => {
        if (t.id === losingTeam.id) {
          const newLives = t.lives - 1;
          const eliminated = newLives <= 0;
          
          return {
            ...t,
            lives: newLives,
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
      description: "Partida finalizada e placar atualizado",
      variant: "default"
    });
  };

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
            </div>
            <div>
              <Label>{match.teamB.name}</Label>
              <Input
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(Number(e.target.value))}
              />
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
