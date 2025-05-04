
import { useState, useEffect } from "react";
import { Match, Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export interface UseMatchStatusEditorProps {
  match: Match;
  teams: Team[];
  onSave?: (updatedMatch: Match, updatedTeams: Team[]) => void;
  onUpdateScore?: (matchId: string, team: "A" | "B", score: number) => void;
  onStartMatch?: () => void;
  onCompleteMatch?: () => void;
  onSetWinner?: (matchId: string, team: "A" | "B") => void;
}

export function useMatchStatusEditor({
  match,
  teams = [],
  onSave,
  onUpdateScore,
  onStartMatch,
  onCompleteMatch,
  onSetWinner
}: UseMatchStatusEditorProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<string>(
    match.completed ? "Finalizada" : match.inProgress ? "Iniciada" : "Aguardando"
  );
  const [scoreA, setScoreA] = useState<number>(match.scoreA || 0);
  const [scoreB, setScoreB] = useState<number>(match.scoreB || 0);
  const [winner, setWinner] = useState<string | undefined>(match.winner?.id);
  const [showResultDialog, setShowResultDialog] = useState(false);
  
  // Team lives states
  const [teamALives, setTeamALives] = useState<number>(match.teamA?.lives || 0);
  const [teamBLives, setTeamBLives] = useState<number>(match.teamB?.lives || 0);

  // Determine if the teams have names available
  const hasTeamNames = Boolean(match.teamA?.name && match.teamB?.name);

  // Update state when match properties change
  useEffect(() => {
    console.log("Match updated in useMatchStatusEditor:", match.id);
    setStatus(match.completed ? "Finalizada" : match.inProgress ? "Iniciada" : "Aguardando");
    setScoreA(match.scoreA || 0);
    setScoreB(match.scoreB || 0);
    setWinner(match.winner?.id);
    setTeamALives(match.teamA?.lives || 0);
    setTeamBLives(match.teamB?.lives || 0);
    
    // Debug logs to help identify issues
    console.log("Teams available:", teams.length);
    console.log("Match teamA:", match.teamA?.id, match.teamA?.name, "lives:", match.teamA?.lives);
    console.log("Match teamB:", match.teamB?.id, match.teamB?.name, "lives:", match.teamB?.lives);
  }, [match, teams]);

  const handleStatusChange = (value: string) => {
    console.log("Status changed to:", value);
    setStatus(value);
    
    // Update match status based on selection
    if (value === "Aguardando") {
      const updatedMatch = {
        ...match,
        inProgress: false,
        completed: false
      };
      if (onSave) {
        onSave(updatedMatch, teams);
      }
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
      if (onSave) {
        onSave(updatedMatch, teams);
      }
      if (onStartMatch) {
        onStartMatch();
      }
      toast({ 
        title: "Status atualizado", 
        description: "Partida iniciada" 
      });
    } else if (value === "Finalizada") {
      console.log("Opening result dialog");
      setShowResultDialog(true);
      if (onCompleteMatch) {
        onCompleteMatch();
      }
    }
  };

  // Helper function to update team lives
  const handleUpdateTeamLives = (team: 'A' | 'B', increment: boolean) => {
    if (team === 'A') {
      const newLives = increment 
        ? Math.min((match.teamA?.reEntered ? 1 : 2), teamALives + 1) 
        : Math.max(0, teamALives - 1);
      console.log(`Updating team A lives from ${teamALives} to ${newLives}`);
      setTeamALives(newLives);
    } else {
      const newLives = increment 
        ? Math.min((match.teamB?.reEntered ? 1 : 2), teamBLives + 1) 
        : Math.max(0, teamBLives - 1);
      console.log(`Updating team B lives from ${teamBLives} to ${newLives}`);
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
    
    // Find the winning team reference
    const winningTeamId = winner;
    console.log("Finding winning team with ID:", winningTeamId);
    const winningTeam = teams.find((t) => t.id === winningTeamId);
    
    if (!winningTeam) {
      console.error("Winning team not found:", winningTeamId);
      console.log("Available teams:", teams.map(t => `${t.id} - ${t.name}`).join(", "));
      toast({ 
        title: "Erro ao definir vencedor", 
        description: "Time vencedor não encontrado",
        variant: "destructive"
      });
      return;
    }

    console.log("Confirming result with winner:", winningTeam.name);
    
    // Update both teams with manually adjusted lives
    let updatedTeams = teams.map((t) => {
      if (t.id === match.teamA?.id) {
        const eliminated = teamALives <= 0 && !match.teamA.reEntered;
        return {
          ...t,
          lives: teamALives,
          eliminated
        };
      }
      if (t.id === match.teamB?.id) {
        const eliminated = teamBLives <= 0 && !match.teamB.reEntered;
        return {
          ...t,
          lives: teamBLives,
          eliminated
        };
      }
      return t;
    });

    // Get updated references to the teams involved in the match
    const updatedTeamA = updatedTeams.find(t => t.id === match.teamA?.id) || match.teamA;
    const updatedTeamB = updatedTeams.find(t => t.id === match.teamB?.id) || match.teamB;

    // Update match with latest team data and result info
    const updatedMatch: Match = {
      ...match,
      scoreA,
      scoreB,
      winner: winningTeam,
      completed: true,
      inProgress: false,
      teamA: updatedTeamA,
      teamB: updatedTeamB
    };

    if (onSave) {
      console.log("Saving updated match:", updatedMatch);
      onSave(updatedMatch, updatedTeams);
    }

    if (onSetWinner && winner) {
      onSetWinner(match.id, winner === match.teamA?.id ? 'A' : 'B');
    }

    setShowResultDialog(false);
    toast({ 
      title: "Resultado salvo", 
      description: "Partida finalizada e sincronizada com o placar",
      variant: "default"
    });
  };

  return {
    status,
    scoreA,
    scoreB,
    winner,
    teamALives,
    teamBLives,
    showResultDialog,
    hasTeamNames,
    setShowResultDialog,
    setWinner,
    handleStatusChange,
    handleUpdateTeamLives,
    handleConfirmResult,
    setScoreA,
    setScoreB
  };
}
