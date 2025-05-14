import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { WorkoutWithExercises } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import WorkoutForm from "./WorkoutForm";
import ActiveWorkoutForm from "./ActiveWorkoutForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface WorkoutCardProps {
  workout: WorkoutWithExercises;
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);

  const deleteWorkoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/workouts/${workout.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout deleted",
        description: "The workout has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete workout: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const startWorkoutMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("POST", "/api/workout-sessions", {
        workoutId: workout.id,
        userId: 1, // Default user for now
        date: new Date(),
        completed: 0,
        addExercises: true,
      });
      return await result.json();
    },
    onSuccess: (data) => {
      setIsStartDialogOpen(true);
      toast({
        title: "Workout started",
        description: "Let's get those gains!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to start workout: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleStartWorkout = () => {
    startWorkoutMutation.mutate();
  };

  const handleDeleteWorkout = () => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      deleteWorkoutMutation.mutate();
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="p-4 border-b border-gray-100">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg">{workout.name}</h3>
            <div className="flex space-x-2">
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <span className="material-icons">edit</span>
              </button>
              <button 
                className="text-gray-400 hover:text-accent"
                onClick={handleDeleteWorkout}
              >
                <span className="material-icons">delete</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {workout.lastCompletedAt
              ? `Last completed: ${formatDistanceToNow(new Date(workout.lastCompletedAt), { addSuffix: true })}`
              : "Not completed yet"}
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-3">
            {workout.exercises.map((exercise) => (
              <li key={exercise.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="material-icons text-gray-400 mr-3">fitness_center</span>
                  <span>{exercise.exercise.name}</span>
                </div>
                <span className="text-sm text-gray-500">{exercise.sets} × {exercise.reps}</span>
              </li>
            ))}
          </ul>
          <Button 
            onClick={handleStartWorkout}
            variant="outline"
            className="w-full mt-4 bg-primary bg-opacity-10 text-primary font-medium"
            disabled={startWorkoutMutation.isPending}
          >
            {startWorkoutMutation.isPending ? "Starting..." : "Start Workout"}
          </Button>
        </CardContent>
      </Card>

      {/* Edit Workout Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <WorkoutForm 
            workout={workout} 
            onSuccess={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Active Workout Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent className="max-w-md">
          <ActiveWorkoutForm 
            workoutId={workout.id}
            onSuccess={() => {
              setIsStartDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
              queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions/recent"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
