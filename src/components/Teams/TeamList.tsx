
import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Team } from "@/lib/types";
import TeamListHeader from "./TeamListHeader";
import TeamListItem from "./TeamListItem";

interface TeamListProps {
  teams: Team[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
  onReenterTeam: (teamId: string) => void;
}

const TeamList = ({ teams, onEditTeam, onDeleteTeam, onReenterTeam }: TeamListProps) => {
  return (
    <Table>
      <TeamListHeader />
      <TableBody>
        {teams.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-8 text-muted-foreground">
              Nenhum time cadastrado. Clique em "Adicionar Time" para começar.
            </td>
          </tr>
        ) : (
          teams.map(team => (
            <TeamListItem 
              key={team.id} 
              team={team} 
              onEditTeam={onEditTeam} 
              onDeleteTeam={onDeleteTeam} 
              onReenterTeam={onReenterTeam}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TeamList;
