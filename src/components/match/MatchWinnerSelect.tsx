
import React, { useEffect } from "react";
import { Match } from "@/lib/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MatchWinnerSelectProps {
  match: Match;
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Component to select a winner for a match
 */
export const MatchWinnerSelect: React.FC<MatchWinnerSelectProps> = ({
  match,
  value,
  onValueChange,
  disabled = false
}) => {
  console.log("Rendering MatchWinnerSelect with value:", value);
  console.log("Team A:", match.teamA?.id, match.teamA?.name);
  console.log("Team B:", match.teamB?.id, match.teamB?.name);
  
  useEffect(() => {
    if (!match.teamA || !match.teamB) {
      console.error("Missing team data in MatchWinnerSelect when component mounted");
    }
  }, [match]);

  // Safety check for missing team data
  if (!match.teamA || !match.teamB) {
    console.error("Missing team data in MatchWinnerSelect, TeamA:", !!match.teamA, "TeamB:", !!match.teamB);
    // Instead of returning null, provide a disabled placeholder 
    return (
      <div>
        <Label>Vencedor</Label>
        <Select disabled={true}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Times não disponíveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="error">Erro: Times não encontrados</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  // Safety check for team IDs
  const teamAId = match.teamA.id || 'team-a';
  const teamBId = match.teamB.id || 'team-b';
  
  return (
    <div>
      <Label>Vencedor</Label>
      <Select 
        value={value} 
        onValueChange={(selectedValue) => {
          console.log(`Winner selected: ${selectedValue}`);
          onValueChange(selectedValue);
        }} 
        disabled={disabled}
      >
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Escolha o vencedor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={teamAId}>{match.teamA.name || 'Time A'}</SelectItem>
          <SelectItem value={teamBId}>{match.teamB.name || 'Time B'}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MatchWinnerSelect;
