
import { useState } from "react";

interface UseOptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<boolean | void>;
  onError?: (error: any, originalData: T) => void;
}

/**
 * Hook for handling optimistic UI updates with rollback on failure
 */
export function useOptimisticUpdate<T>({ onUpdate, onError }: UseOptimisticUpdateOptions<T>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (newData: T, originalData: T): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);
    
    try {
      // Call the update function
      const result = await onUpdate(newData);
      setIsUpdating(false);
      return result !== false;
    } catch (err) {
      console.error("Error during optimistic update:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Call the error handler if provided
      if (onError) {
        onError(err, originalData);
      }
      
      setIsUpdating(false);
      return false;
    }
  };

  return {
    isUpdating,
    error,
    update
  };
}
