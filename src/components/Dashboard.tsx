
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrophyIcon, ArrowRight, CalendarIcon, UsersIcon } from "lucide-react";
import { useTournament } from "@/context/TournamentContext";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "destructive" | "warning";
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  variant = "default" 
}) => {
  const bgClass = {
    default: "bg-blue-50",
    success: "bg-green-50",
    destructive: "bg-red-50",
    warning: "bg-yellow-50"
  }[variant];
  
  const iconClass = {
    default: "text-blue-600",
    success: "text-green-600",
    destructive: "text-red-600",
    warning: "text-yellow-600"
  }[variant];
  
  return (
    <Card>
      <CardHeader className={`${bgClass} rounded-t-lg pb-2`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {icon && <div className={iconClass}>{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { tournament, stats, loading } = useTournament();
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="animate-pulse h-5 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="animate-pulse h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="animate-pulse h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Format date properly
  const formatDate = (dateValue: Date | string) => {
    if (!dateValue) return "";
    
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return "";
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Times Ativos" 
          value={stats.activeTeams}
          description={`De um total de ${tournament.teams.length} times`}
          icon={<UsersIcon size={18} />}
          variant="success"
        />
        
        <StatCard 
          title="Rodada Atual" 
          value={tournament.currentRound}
          description={`${stats.currentRoundCompleted} de ${stats.currentRoundMatches} partidas concluídas`}
          icon={<Badge variant="outline" className="bg-rotary-gold text-white">{tournament.currentRound}</Badge>}
        />
        
        <StatCard 
          title="Progresso do Torneio" 
          value={`${stats.completionPercentage}%`}
          description={`${stats.completedMatches} de ${stats.totalMatches} partidas concluídas`}
          icon={<CalendarIcon size={18} />}
          variant="default"
        />
        
        <StatCard 
          title="Times Eliminados" 
          value={stats.eliminatedTeams}
          description={`${stats.reenteredTeams} times reinscritos`}
          icon={<TrophyIcon size={18} />}
          variant={stats.eliminatedTeams > 0 ? "destructive" : "default"}
        />
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Progresso da Rodada Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Partidas concluídas: {stats.currentRoundCompleted} de {stats.currentRoundMatches}</span>
              <span className="font-medium">{stats.currentRoundProgress}%</span>
            </div>
            <Progress value={stats.currentRoundProgress} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 rounded-b-lg border-t">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-sm text-gray-500">
                Torneio iniciado em {formatDate(tournament.date)}
              </p>
            </div>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-1">
                Gerenciar Torneio
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default Dashboard;
