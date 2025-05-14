import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { WorkoutSessionWithDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutDetailsProps {
  sessionId: number;
}

export default function WorkoutDetails({ sessionId }: WorkoutDetailsProps) {
  const { data: session, isLoading } = useQuery<WorkoutSessionWithDetails>({
    queryKey: [`/api/workout-sessions/${sessionId}`],
  });

  if (isLoading || !session) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-6 w-32 mb-6" />
        
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="mb-6">
            <Skeleton className="h-6 w-36 mb-2" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-24 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-xl">{session.workout.name}</h2>
        <p className="text-gray-500">
          {format(parseISO(session.date.toString()), "EEEE, MMMM d, yyyy 'at' h:mm a")}
          {session.duration && ` • ${session.duration} minutes`}
        </p>
      </div>
      
      <div className="p-4 max-h-[70vh] overflow-auto">
        <ul className="space-y-6">
          {session.sessionExercises.map((exercise) => (
            <li key={exercise.id}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{exercise.exercise.name}</span>
                <span className={`font-medium ${
                  exercise.completed ? "text-secondary" : "text-gray-400"
                }`}>
                  {exercise.completed ? "Completed" : "Not completed"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {exercise.sets.map((set) => (
                  <div key={set.id} className="bg-gray-100 rounded p-2 text-sm">
                    <span className="text-gray-500">Set {set.setNumber}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span>{set.weight ? `${set.weight} kg` : "—"}</span>
                      <span>{set.reps ? `${set.reps} reps` : "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
        
        {session.notes && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Notes</h3>
            <p className="text-gray-700">{session.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
