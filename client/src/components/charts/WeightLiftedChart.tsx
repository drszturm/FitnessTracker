import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface DayData {
  day: string;
  weight: number;
}

export default function WeightLiftedChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/stats/weight-by-day"],
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex space-x-1 h-16">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col">
            <Skeleton className="flex-1 rounded-t-sm" />
            <div className="h-4 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  const chartData: DayData[] = data || [];
  
  // Find the maximum weight value for scaling
  const maxWeight = Math.max(...chartData.map(d => d.weight), 100);

  return (
    <div className="mt-4 flex space-x-1">
      {chartData.map((day, index) => (
        <div key={index} className="flex-1">
          <div className="bg-secondary bg-opacity-20 rounded-t-sm h-16 relative">
            <div 
              className="absolute bottom-0 w-full bg-secondary rounded-t-sm"
              style={{ height: `${Math.max((day.weight / maxWeight) * 100, 5)}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1 text-gray-500">{day.day}</p>
        </div>
      ))}
    </div>
  );
}
