import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { WorkoutSessionWithDetails } from "@shared/schema";
import ExerciseForm from "./ExerciseForm";

interface ActiveWorkoutFormProps {
  workoutId?: number;
  sessionId?: number;
  onSuccess?: () => void;
}

export default function ActiveWorkoutForm({ workoutId, sessionId, onSuccess }: ActiveWorkoutFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Fetch the active workout session
  const { data: session, isLoading } = useQuery<WorkoutSessionWithDetails>({
    queryKey: sessionId ? [`/api/workout-sessions/${sessionId}`] : ["/api/workout-sessions/active"],
    queryFn: async ({ queryKey }) => {
      if (sessionId) {
        const response = await fetch(queryKey[0] as string);
        if (!response.ok) throw new Error("Failed to fetch session");
        return response.json();
      }
      
      // For new workout sessions, we need to poll for the latest created session
      const workoutSessions = await fetch("/api/workout-sessions?limit=1");
      const sessions = await workoutSessions.json();
      
      if (sessions.length === 0) throw new Error("No active session found");
      
      const latestSession = sessions[0];
      const response = await fetch(`/api/workout-sessions/${latestSession.id}`);
      if (!response.ok) throw new Error("Failed to fetch session");
      return response.json();
    },
    enabled: !!workoutId || !!sessionId,
    refetchInterval: 3000, // Poll for updates
  });

  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("No active session");
      const result = await apiRequest(
        "PUT",
        `/api/workout-sessions/${session.id}/complete`,
        {}
      );
      return await result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/weekly-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/total-weight"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/weight-by-day"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/personal-records"] });
      
      toast({
        title: "Workout completed",
        description: "Great job! Your workout has been saved.",
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete workout: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !session) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500">Loading workout session...</p>
      </div>
    );
  }

  const workout = session.workout;
  const sessionExercises = session.sessionExercises;
  const currentExercise = sessionExercises[currentExerciseIndex];
  const completedCount = sessionExercises.filter(e => e.completed).length;

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < sessionExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // This was the last exercise
      if (window.confirm("Finish this workout session?")) {
        completeSessionMutation.mutate();
      }
    }
  };

  return (
    <div>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-lg">{workout.name}</h3>
        <div className="flex items-center">
          <span className="text-gray-500 mr-4">
            {completedCount} of {sessionExercises.length} completed
          </span>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={onSuccess}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {currentExercise && (
          <ExerciseForm
            key={currentExercise.id}
            sessionExercise={currentExercise}
            onExerciseCompleted={() => {
              queryClient.invalidateQueries({ 
                queryKey: [`/api/workout-sessions/${session.id}`] 
              });
            }}
          />
        )}
        
        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrevious}
            disabled={currentExerciseIndex === 0}
          >
            Previous
          </Button>
          <Button
            className="flex-1"
            onClick={handleNext}
            disabled={completeSessionMutation.isPending}
          >
            {currentExerciseIndex < sessionExercises.length - 1 
              ? "Next Exercise" 
              : completeSessionMutation.isPending 
                ? "Completing..." 
                : "Finish Workout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
