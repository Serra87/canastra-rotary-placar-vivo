
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const TeamsSkeleton = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-44" />
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Carregando...
        </Button>
      </div>
      <Table>
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
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default TeamsSkeleton;
