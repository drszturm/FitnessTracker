import { useQuery } from "@tanstack/react-query";
import { DataCard } from "@/components/ui/data-card";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import WeightLiftedChart from "@/components/charts/WeightLiftedChart";
import { ProgressRing } from "@/components/ui/progress-ring";

export default function Dashboard() {
  const { data: weeklyWorkouts, isLoading: loadingWeekly } = useQuery({
    queryKey: ["/api/stats/weekly-workouts"],
  });

  const { data: totalWeight, isLoading: loadingWeight } = useQuery({
    queryKey: ["/api/stats/total-weight"],
  });

  const { data: personalRecords, isLoading: loadingPRs } = useQuery({
    queryKey: ["/api/stats/personal-records"],
  });

  const { data: recentWorkouts, isLoading: loadingRecent } = useQuery({
    queryKey: ["/api/workout-sessions/recent"],
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Workouts Card */}
        <DataCard
          title="Weekly Workouts"
          icon={<span className="material-icons text-primary">fitness_center</span>}
        >
          {loadingWeekly ? (
            <Skeleton className="h-16 w-full mb-2" />
          ) : (
            <>
              <p className="text-3xl font-bold">{weeklyWorkouts?.count || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {weeklyWorkouts?.percentage > 0
                  ? `${weeklyWorkouts?.percentage}% of your goal`
                  : "No workouts this week"}
              </p>
              <Progress 
                value={weeklyWorkouts?.percentage || 0} 
                className="h-2 mt-4"
              />
              <p className="text-xs text-gray-500 mt-2">
                Goal: {weeklyWorkouts?.goal || 5} workouts
              </p>
            </>
          )}
        </DataCard>

        {/* Total Weight Lifted Card */}
        <DataCard
          title="Total Weight Lifted"
          icon={<span className="material-icons text-secondary">monitoring</span>}
        >
          {loadingWeight ? (
            <>
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : (
            <>
              <p className="text-3xl font-bold">
                {Math.round(totalWeight?.weight || 0).toLocaleString()} kg
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This month
              </p>
              <WeightLiftedChart />
            </>
          )}
        </DataCard>

        {/* Recent PRs Card */}
        <DataCard
          title="Recent PRs"
          icon={<span className="material-icons text-accent">emoji_events</span>}
        >
          {loadingPRs ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : personalRecords?.length ? (
            <>
              <ul className="space-y-3">
                {personalRecords.map((pr) => (
                  <li key={pr.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{pr.exercise.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(pr.date), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="font-bold text-accent">
                      {pr.weight} kg × {pr.reps}
                    </p>
                  </li>
                ))}
              </ul>
              <Link href="/history">
                <a className="mt-4 text-primary text-sm font-medium flex items-center">
                  View all PRs
                  <span className="material-icons text-sm ml-1">arrow_forward</span>
                </a>
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No personal records yet!</p>
              <p className="text-sm text-gray-400 mt-1">
                Complete workouts to track PRs
              </p>
            </div>
          )}
        </DataCard>
      </div>

      {/* Recent Workouts */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Workouts</h2>
          <Link href="/history">
            <a className="text-primary font-medium text-sm flex items-center">
              View all
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </a>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {loadingRecent ? (
              <div>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="border-b border-gray-100 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48 mb-3" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentWorkouts?.length ? (
              recentWorkouts.map((session) => (
                <div
                  key={session.id}
                  className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Link href="/history">
                    <a className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{session.workout.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
                          {session.duration && ` • ${session.duration} min`}
                        </p>
                        <div className="flex mt-2 space-x-2">
                          {/* Here we'd need to fetch exercise data for this session */}
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>
                      <span className="material-icons text-gray-400">chevron_right</span>
                    </a>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No workouts completed yet</p>
                <Link href="/workouts">
                  <a className="mt-2 inline-block text-primary">
                    Start your first workout
                  </a>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
