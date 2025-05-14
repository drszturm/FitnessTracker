import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkoutWithExercises } from "@shared/schema";
import WorkoutCard from "@/components/workout/WorkoutCard";
import WorkoutForm from "@/components/workout/WorkoutForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Workouts() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: workouts, isLoading } = useQuery<WorkoutWithExercises[]>({
    queryKey: ["/api/workouts"],
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">My Workout Routines</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center">
          <span className="material-icons text-sm mr-1">add</span>
          New Routine
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-48 mt-1" />
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Skeleton className="h-6 w-6 mr-3 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : workouts && workouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="material-icons text-gray-400 text-5xl mb-4">fitness_center</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Workout Routines</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Create your first workout routine to start tracking your fitness journey.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <span className="material-icons text-sm mr-1">add</span>
            Create Workout
          </Button>
        </div>
      )}

      {/* Add Workout Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <WorkoutForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
