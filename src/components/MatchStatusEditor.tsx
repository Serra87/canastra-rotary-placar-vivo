
import React, { useState } from "react";
import { Match, Team } from "@/lib/types";
import { useMatchStatusEditor } from "@/hooks/useMatchStatusEditor";
import MatchStatusSelector from "@/components/match/MatchStatusSelector";
import MatchResultDialog from "@/components/match/MatchResultDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, AlertCircle, Table as TableIcon } from "lucide-react";

interface MatchStatusEditorProps {
  match: Match;
  teams?: Team[];
  onSave?: (updatedMatch: Match, updatedTeams: Team[]) => void;
  onUpdateScore?: (matchId: string, team: "A" | "B", score: number) => void;
  onStartMatch?: () => void;
  onCompleteMatch?: () => void;
  onSetWinner?: (matchId: string, team: "A" | "B") => void;
  onDeleteMatch?: () => void;
  disabled?: boolean;
}

export default function MatchStatusEditor({ 
  match, 
  teams = [], 
  onSave, 
  onUpdateScore,
  onStartMatch,
  onCompleteMatch,
  onSetWinner,
  onDeleteMatch,
  disabled = false 
}: MatchStatusEditorProps) {
  const {
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
  } = useMatchStatusEditor({
    match,
    teams,
    onSave,
    onUpdateScore,
    onStartMatch,
    onCompleteMatch,
    onSetWinner
  });

  // Define status styles and icons
  const getStatusStyles = () => {
    switch (status) {
      case "Iniciada":
        return {
          bgColor: "bg-amber-100",
          textColor: "text-amber-800",
          borderColor: "border-amber-300",
          icon: <Clock size={16} className="text-amber-800" />
        };
      case "Finalizada":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-300",
          icon: <Trophy size={16} className="text-green-800" />
        };
      default: // "Aguardando"
        return {
          bgColor: "bg-slate-100",
          textColor: "text-slate-800",
          borderColor: "border-slate-300",
          icon: <AlertCircle size={16} className="text-slate-800" />
        };
    }
  };
  
  const statusStyle = getStatusStyles();

  return (
    <Card className={`mb-4 overflow-hidden border-l-4 ${statusStyle.borderColor}`}>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${statusStyle.bgColor} ${statusStyle.textColor} flex items-center gap-1`}>
                {statusStyle.icon} {status}
              </Badge>
              
              {match.tableNumber && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <TableIcon size={14} /> Mesa {match.tableNumber}
                </Badge>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowResultDialog(true)}
              disabled={disabled || !hasTeamNames}
            >
              Gerenciar Partida
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Time A</span>
              <span className="font-medium">{match.teamA?.name || "Time A"}</span>
              <div className="flex mt-1">
                {Array.from({ length: match.teamA?.lives || 0 }).map((_, i) => (
                  <span key={i} className="text-red-500 mr-0.5">❤️</span>
                ))}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {match.scoreA || scoreA || 0} pontos
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              <span className="text-2xl font-bold text-gray-400">VS</span>
            </div>
            
            <div className="flex flex-col text-right">
              <span className="text-sm text-gray-500">Time B</span>
              <span className="font-medium">{match.teamB?.name || "Time B"}</span>
              <div className="flex mt-1 justify-end">
                {Array.from({ length: match.teamB?.lives || 0 }).map((_, i) => (
                  <span key={i} className="text-red-500 ml-0.5">❤️</span>
                ))}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {match.scoreB || scoreB || 0} pontos
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50">
          <MatchStatusSelector 
            value={status} 
            onValueChange={handleStatusChange}
            disabled={disabled || !hasTeamNames}
          />
          
          {match.winner && (
            <div className="mt-3 flex items-center">
              <Trophy size={16} className="text-green-600 mr-1" />
              <span className="text-sm font-medium">
                Vencedor: <span className="text-green-600">{match.winner.name}</span>
              </span>
            </div>
          )}
          
          {!hasTeamNames && (
            <div className="mt-3 text-sm text-amber-600">
              É necessário adicionar times a esta partida antes de poder gerenciá-la.
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Ensure all required props are passed to the dialog */}
      <MatchResultDialog 
        match={match}
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        scoreA={scoreA}
        scoreB={scoreB}
        teamALives={teamALives}
        teamBLives={teamBLives}
        winner={winner}
        onScoreAChange={(value) => {
          setScoreA(value);
          if (onUpdateScore) {
            onUpdateScore(match.id, 'A', value);
          }
        }}
        onScoreBChange={(value) => {
          setScoreB(value);
          if (onUpdateScore) {
            onUpdateScore(match.id, 'B', value);
          }
        }}
        onTeamALivesUpdate={(increment) => handleUpdateTeamLives('A', increment)}
        onTeamBLivesUpdate={(increment) => handleUpdateTeamLives('B', increment)}
        onWinnerChange={(value) => {
          setWinner(value);
        }}
        onConfirmResult={handleConfirmResult}
        disabled={disabled}
      />
    </Card>
  );
}
