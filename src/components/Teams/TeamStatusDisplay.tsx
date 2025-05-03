
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface TeamStatusDisplayProps {
  eliminated: boolean;
  reEntered: boolean;
  canReenter: boolean;
  onReenter: () => void;
}

const TeamStatusDisplay = ({ 
  eliminated, 
  reEntered, 
  canReenter, 
  onReenter 
}: TeamStatusDisplayProps) => {
  return (
    <div className="col-span-3">
      {eliminated ? (
        <div className="flex items-center justify-between">
          <span className="text-red-500 font-medium">Eliminado</span>
          {!reEntered && canReenter && (
            <Button 
              variant="warning" 
              size="sm" 
              onClick={onReenter}
              className="flex items-center gap-1"
            >
              <AlertTriangle size={14} />
              Reinscrever
            </Button>
          )}
        </div>
      ) : (
        <span className="text-green-600 font-medium">Ativo</span>
      )}
      
      {reEntered && (
        <div className="bg-yellow-50 p-3 mt-3 rounded-md border border-yellow-200 flex items-center gap-2">
          <AlertTriangle size={18} className="text-yellow-500" />
          <p className="text-sm text-yellow-800">
            Este time foi reinscrito e possui apenas uma vida.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamStatusDisplay;
