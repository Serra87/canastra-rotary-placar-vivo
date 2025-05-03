
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const MatchesSkeleton: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gerenciar Partidas</h2>
        <div className="space-x-2">
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </Button>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="current">
        <TabsList className="mb-4">
          <TabsTrigger value="current">Rodada Atual</TabsTrigger>
          <TabsTrigger value="all">Todas Rodadas</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">RODADA 1</h3>
            </div>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="mb-4">
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="col-span-2">
                        <Skeleton className="h-8 w-full" />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Skeleton className="h-8 w-full" />
                      </div>
                      <div className="col-span-2">
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchesSkeleton;
