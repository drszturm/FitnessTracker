import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Exercise, WorkoutWithExercises } from "@shared/schema";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ExerciseForm from "./ExerciseForm";

// Form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Workout name is required" }),
  userId: z.number().default(1), // Default user ID
});

type WorkoutFormValues = z.infer<typeof formSchema>;

interface WorkoutFormProps {
  workout?: WorkoutWithExercises;
  onSuccess?: () => void;
}

export default function WorkoutForm({ workout, onSuccess }: WorkoutFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [exercises, setExercises] = useState<{
    exerciseId: number;
    sets: number;
    reps: string;
    weight?: string;
    exercise?: Exercise;
  }[]>(workout?.exercises.map(e => ({
    exerciseId: e.exerciseId,
    sets: e.sets,
    reps: e.reps,
    weight: e.weight,
    exercise: e.exercise,
  })) || []);

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workout?.name || "",
      userId: workout?.userId || 1,
    },
  });

  const { data: exerciseOptions = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (values: WorkoutFormValues & { exercises: typeof exercises }) => {
      const result = await apiRequest(
        workout ? "PUT" : "POST",
        workout ? `/api/workouts/${workout.id}` : "/api/workouts",
        values
      );
      return await result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: workout ? "Workout updated" : "Workout created",
        description: workout 
          ? "Your workout has been updated successfully." 
          : "Your new workout has been created successfully.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${workout ? "update" : "create"} workout: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: WorkoutFormValues) => {
    // Ensure there are exercises to create a workout
    if (exercises.length === 0) {
      toast({
        title: "No exercises",
        description: "Please add at least one exercise to your workout.",
        variant: "destructive",
      });
      return;
    }

    createWorkoutMutation.mutate({ ...values, exercises });
  };

  const addExercise = () => {
    if (exerciseOptions.length === 0) return;
    
    setExercises([
      ...exercises,
      {
        exerciseId: exerciseOptions[0].id,
        sets: 3,
        reps: "8-10",
        exercise: exerciseOptions[0],
      },
    ]);
  };

  const updateExercise = (index: number, data: Partial<typeof exercises[0]>) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], ...data };
    
    // If exercise ID changed, update the exercise object
    if (data.exerciseId && data.exerciseId !== newExercises[index].exerciseId) {
      const selectedExercise = exerciseOptions.find(e => e.id === data.exerciseId);
      if (selectedExercise) {
        newExercises[index].exercise = selectedExercise;
      }
    }
    
    setExercises(newExercises);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-lg">{workout ? "Edit Workout" : "Add New Workout"}</h3>
      </div>
      
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., Leg Day, Upper Body, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Exercises
              </label>
              
              {exercises.map((exercise, index) => (
                <div key={index} className="border border-gray-300 rounded-lg p-2 mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex-1 mr-2">
                      <Select
                        value={exercise.exerciseId.toString()}
                        onValueChange={(value) => updateExercise(index, { exerciseId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {exerciseOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id.toString()}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <button 
                      type="button" 
                      className="text-gray-400 hover:text-accent"
                      onClick={() => removeExercise(index)}
                    >
                      <span className="material-icons">remove_circle</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">Sets</label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, { sets: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">Reps</label>
                      <Input
                        type="text"
                        placeholder="e.g. 8-10"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, { reps: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">Weight (kg)</label>
                      <Input
                        type="text"
                        placeholder="Optional"
                        value={exercise.weight || ""}
                        onChange={(e) => updateExercise(index, { weight: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
                onClick={addExercise}
              >
                <span className="material-icons mr-1">add</span>
                Add Exercise
              </Button>
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onSuccess}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createWorkoutMutation.isPending}
              >
                {createWorkoutMutation.isPending ? "Saving..." : "Save Workout"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
