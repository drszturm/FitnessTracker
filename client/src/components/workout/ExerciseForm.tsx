import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SessionExercise, ExerciseSet } from "@shared/schema";

interface ExerciseFormProps {
  sessionExercise: SessionExercise & { 
    exercise: any;
    sets: ExerciseSet[];
  };
  onExerciseCompleted?: () => void;
}

export default function ExerciseForm({ sessionExercise, onExerciseCompleted }: ExerciseFormProps) {
  const { toast } = useToast();
  const [sets, setSets] = useState<ExerciseSet[]>(sessionExercise.sets || []);

  const updateSetMutation = useMutation({
    mutationFn: async ({ id, weight, reps }: { id: number; weight?: number; reps?: number }) => {
      const result = await apiRequest(
        "PUT",
        `/api/exercise-sets/${id}`,
        { weight, reps }
      );
      return await result.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update set: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const completeSetMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiRequest(
        "PUT",
        `/api/exercise-sets/${id}/complete`,
        {}
      );
      return await result.json();
    },
    onSuccess: (data) => {
      // Update local state
      setSets(prev => 
        prev.map(set => set.id === data.id ? { ...set, ...data } : set)
      );
      
      // Check if all sets are completed
      const updatedSets = sets.map(set => 
        set.id === data.id ? { ...set, completed: 1 } : set
      );
      
      if (updatedSets.every(set => set.completed === 1)) {
        completeExerciseMutation.mutate();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete set: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const completeExerciseMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest(
        "PUT",
        `/api/session-exercises/${sessionExercise.id}/complete`,
        {}
      );
      return await result.json();
    },
    onSuccess: () => {
      toast({
        title: "Exercise completed",
        description: "Great job! Exercise marked as completed.",
      });
      
      if (onExerciseCompleted) {
        onExerciseCompleted();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete exercise: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addSetMutation = useMutation({
    mutationFn: async () => {
      const newSetNumber = sets.length + 1;
      const result = await apiRequest(
        "POST",
        "/api/exercise-sets",
        {
          sessionExerciseId: sessionExercise.id,
          setNumber: newSetNumber,
          completed: 0,
        }
      );
      return await result.json();
    },
    onSuccess: (data) => {
      setSets([...sets, data]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add set: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleWeightChange = (id: number, weight: string) => {
    const numWeight = weight === "" ? undefined : parseFloat(weight);
    setSets(prev => 
      prev.map(set => set.id === id ? { ...set, weight: numWeight } : set)
    );
  };

  const handleRepsChange = (id: number, reps: string) => {
    const numReps = reps === "" ? undefined : parseInt(reps);
    setSets(prev => 
      prev.map(set => set.id === id ? { ...set, reps: numReps } : set)
    );
  };

  const handleBlur = (id: number) => {
    const set = sets.find(s => s.id === id);
    if (!set) return;
    
    updateSetMutation.mutate({
      id,
      weight: set.weight,
      reps: set.reps,
    });
  };

  const handleCompleteSet = (id: number) => {
    const set = sets.find(s => s.id === id);
    if (!set) return;
    
    // Validate that set has both weight and reps
    if (set.weight === undefined || set.weight === null) {
      toast({
        title: "Missing weight",
        description: "Please enter a weight for this set",
        variant: "destructive",
      });
      return;
    }
    
    if (set.reps === undefined || set.reps === null) {
      toast({
        title: "Missing reps",
        description: "Please enter the number of reps for this set",
        variant: "destructive",
      });
      return;
    }
    
    completeSetMutation.mutate(id);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{sessionExercise.exercise.name}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${
          sessionExercise.completed 
            ? "bg-green-100 text-green-800" 
            : "bg-blue-100 text-blue-800"
        }`}>
          {sessionExercise.completed ? "Completed" : "Current"}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-3">
        Target: {sets.length} sets
        {sessionExercise.exercise.targetMuscles && (
          <span> • Muscles: {sessionExercise.exercise.targetMuscles}</span>
        )}
      </p>
      
      <div className="space-y-3">
        {sets.map((set) => (
          <div key={set.id} className="bg-white rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Set {set.setNumber}</span>
              {set.completed ? (
                <span className="text-secondary text-sm">Completed</span>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary text-sm h-8"
                  onClick={() => handleCompleteSet(set.id)}
                >
                  Mark Complete
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-500 text-xs mb-1">Weight (kg)</label>
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  value={set.weight ?? ""}
                  onChange={(e) => handleWeightChange(set.id, e.target.value)}
                  onBlur={() => handleBlur(set.id)}
                  disabled={set.completed === 1}
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1">Reps</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={set.reps ?? ""}
                  onChange={(e) => handleRepsChange(set.id, e.target.value)}
                  onBlur={() => handleBlur(set.id)}
                  disabled={set.completed === 1}
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button
          variant="outline"
          className="w-full border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
          onClick={() => addSetMutation.mutate()}
          disabled={addSetMutation.isPending}
        >
          <span className="material-icons mr-1">add</span>
          Add Set
        </Button>
      </div>
    </div>
  );
}
