import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { WorkoutSession } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import WorkoutDetails from "./WorkoutDetails";

export default function WorkoutHistory() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  
  const { data: sessions, isLoading } = useQuery<(WorkoutSession & { workout: any })[]>({
    queryKey: ["/api/workout-sessions"],
  });

  // Group sessions by date
  const groupedSessions = sessions?.reduce<Record<string, (WorkoutSession & { workout: any })[]>>((acc, session) => {
    const date = format(parseISO(session.date.toString()), "EEEE, MMMM d");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-48 mb-3" />
            <Card>
              <CardContent className="p-0">
                <Skeleton className="h-24 w-full rounded-t-xl rounded-b-none" />
                <Skeleton className="h-48 w-full rounded-t-none rounded-b-xl" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="material-icons text-gray-400 text-4xl mb-4">fitness_center</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Workout History</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You haven't completed any workouts yet. Start a workout to track your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedSessions).map(([date, dateSessions]) => (
        <div key={date}>
          <h3 className="font-medium text-gray-500 mb-3">{date}</h3>
          
          {dateSessions.map((session) => (
            <Card key={session.id} className="mb-4">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between">
                  <h3 className="font-bold">{session.workout.name}</h3>
                  <span className="text-sm text-gray-500">
                    {session.duration ? `${session.duration} min` : "Duration not recorded"}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <Button 
                  variant="ghost" 
                  className="w-full text-primary text-sm"
                  onClick={() => setSelectedSession(session.id)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      <Dialog 
        open={selectedSession !== null} 
        onOpenChange={(open) => !open && setSelectedSession(null)}
      >
        <DialogContent className="max-w-3xl">
          {selectedSession && (
            <WorkoutDetails sessionId={selectedSession} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Button component needed for the WorkoutHistory component
function Button({ 
  variant = "default", 
  className = "", 
  children, 
  ...props 
}: React.ComponentProps<"button"> & { variant?: "default" | "ghost" }) {
  const baseClasses = "py-2 px-4 rounded-lg font-medium";
  const variantClasses = variant === "ghost" 
    ? "text-primary hover:bg-primary hover:bg-opacity-10" 
    : "bg-primary text-white hover:bg-primary-dark";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
