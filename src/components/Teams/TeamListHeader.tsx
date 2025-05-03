
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TeamListHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Time</TableHead>
        <TableHead>Jogadores</TableHead>
        <TableHead className="text-center">Vidas</TableHead>
        <TableHead className="text-center">Pontos</TableHead>
        <TableHead className="text-center">Status</TableHead>
        <TableHead className="text-right">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TeamListHeader;
