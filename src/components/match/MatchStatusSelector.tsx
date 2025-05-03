
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MatchStatusSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Component to select the status of a match
 */
export const MatchStatusSelector: React.FC<MatchStatusSelectorProps> = ({
  value,
  onValueChange,
  disabled = false
}) => {
  return (
    <div>
      <Label>Status da Partida</Label>
      <Select 
        value={value} 
        onValueChange={onValueChange} 
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Aguardando">Aguardando</SelectItem>
          <SelectItem value="Iniciada">Iniciada</SelectItem>
          <SelectItem value="Finalizada">Finalizada</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MatchStatusSelector;
