
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Team } from "@/lib/types";

interface TeamListItemProps {
  team: Team;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
  onReenterTeam: (teamId: string) => void;
}

const TeamListItem = ({ team, onEditTeam, onDeleteTeam, onReenterTeam }: TeamListItemProps) => {
  return (
    <TableRow key={team.id} className={team.eliminated ? "bg-slate-50" : ""}>
      <TableCell>
        <div className="flex items-center gap-1">
          {team.reEntered && (
            <AlertTriangle size={16} className="text-yellow-500" />
          )}
          <span>{team.name}</span>
        </div>
      </TableCell>
      <TableCell>{team.players.join(' / ')}</TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center">
          {Array.from({ length: team.lives }).map((_, i) => (
            <span key={i} className="text-red-500 mr-1">❤️</span>
          ))}
          {Array.from({ length: (team.reEntered ? 1 : 2) - team.lives }).map((_, i) => (
            <span key={`empty-${i}`} className="text-gray-300 mr-1">♡</span>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-center">{team.totalPoints}</TableCell>
      <TableCell className="text-center">
        {team.eliminated ? (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-600">
            Eliminado
          </span>
        ) : team.reEntered ? (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Reinscrito
          </span>
        ) : (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Ativo
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditTeam(team)}
          >
            <Edit size={14} className="mr-1" />
            Editar
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDeleteTeam(team)}
          >
            <Trash2 size={14} className="mr-1" />
            Excluir
          </Button>
          
          {team.eliminated && !team.reEntered && (
            <Button 
              variant="default"
              size="sm"
              onClick={() => onReenterTeam(team.id)}
              className="flex items-center gap-1"
            >
              <AlertTriangle size={14} />
              Reinscrever
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TeamListItem;
