import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorkoutHistory from "@/components/history/WorkoutHistory";

export default function History() {
  const [timePeriod, setTimePeriod] = useState("month");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Workout History</h2>
        <div className="flex items-center">
          <Select
            value={timePeriod}
            onValueChange={setTimePeriod}
          >
            <SelectTrigger className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm w-40">
              <span className="material-icons text-sm mr-1">calendar_today</span>
              <SelectValue placeholder="This Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <WorkoutHistory />
    </div>
  );
}
