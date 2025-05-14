import { useState } from "react";
import { Input } from "@/components/ui/input";
import ExerciseCategories from "@/components/exercise/ExerciseCategories";
import ExerciseList from "@/components/exercise/ExerciseList";

export default function Exercises() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Exercise Library</h2>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search exercises..."
            className="pl-10 pr-4 py-2 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
        </div>
      </div>

      <ExerciseCategories 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      <ExerciseList 
        category={activeCategory} 
        searchQuery={searchQuery}
      />
    </div>
  );
}
