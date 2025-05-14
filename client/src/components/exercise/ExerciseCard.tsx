import { Exercise } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExerciseCardProps {
  exercise: Exercise;
  onViewDetails?: (exercise: Exercise) => void;
}

export default function ExerciseCard({ exercise, onViewDetails }: ExerciseCardProps) {
  return (
    <Card className="h-full overflow-hidden">
      {/* Exercise illustration placeholder */}
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <span className="material-icons text-4xl text-gray-400">fitness_center</span>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold">{exercise.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {exercise.targetMuscles || "General fitness exercise"}
        </p>
        
        <div className="flex flex-wrap items-center mt-3 gap-2">
          {exercise.exerciseType && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {exercise.exerciseType}
            </span>
          )}
          
          {exercise.equipmentType && (
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              {exercise.equipmentType}
            </span>
          )}
        </div>
        
        <Button 
          variant="outline"
          className="w-full mt-4 bg-primary bg-opacity-10 text-primary font-medium"
          onClick={() => onViewDetails && onViewDetails(exercise)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
