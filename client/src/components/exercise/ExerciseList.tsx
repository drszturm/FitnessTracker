import { useQuery } from "@tanstack/react-query";
import { Exercise } from "@shared/schema";
import ExerciseCard from "./ExerciseCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ExerciseListProps {
  category: string;
  searchQuery?: string;
}

export default function ExerciseList({ category, searchQuery }: ExerciseListProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises", category],
    queryFn: async () => {
      const url = new URL("/api/exercises", window.location.origin);
      if (category !== "All") {
        url.searchParams.append("category", category);
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      return response.json();
    },
  });

  const filteredExercises = exercises?.filter(exercise => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      exercise.name.toLowerCase().includes(query) ||
      (exercise.targetMuscles && exercise.targetMuscles.toLowerCase().includes(query)) ||
      (exercise.equipmentType && exercise.equipmentType.toLowerCase().includes(query)) ||
      (exercise.exerciseType && exercise.exerciseType.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex mb-4">
                <Skeleton className="h-6 w-16 mr-2 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises?.length === 0 ? (
          <div className="col-span-3 py-8 text-center">
            <p className="text-gray-500">
              No exercises found. Try a different category or search term.
            </p>
          </div>
        ) : (
          filteredExercises?.map((exercise) => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              onViewDetails={() => setSelectedExercise(exercise)}
            />
          ))
        )}
      </div>

      <Dialog open={!!selectedExercise} onOpenChange={(open) => !open && setSelectedExercise(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedExercise?.name}</DialogTitle>
            <DialogDescription>
              Details for this exercise
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedExercise?.description && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                <p>{selectedExercise.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {selectedExercise?.targetMuscles && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Target Muscles</h4>
                  <p>{selectedExercise.targetMuscles}</p>
                </div>
              )}
              
              {selectedExercise?.equipmentType && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Equipment</h4>
                  <p>{selectedExercise.equipmentType}</p>
                </div>
              )}
              
              {selectedExercise?.exerciseType && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Type</h4>
                  <p>{selectedExercise.exerciseType}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
