import { useQuery } from "@tanstack/react-query";
import { TabList } from "@/components/ui/tab-list";
import { Skeleton } from "@/components/ui/skeleton";

interface ExerciseCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ExerciseCategories({ 
  activeCategory, 
  onCategoryChange 
}: ExerciseCategoriesProps) {
  const { data: categories, isLoading } = useQuery<string[]>({
    queryKey: ["/api/exercises/categories"],
  });

  if (isLoading) {
    return (
      <div className="flex overflow-x-auto pb-2 mb-4 hide-scrollbar">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-24 h-10 mr-2 rounded-lg" />
        ))}
      </div>
    );
  }

  const formattedCategories = categories?.map(cat => ({
    id: cat,
    label: cat,
  })) || [];

  return (
    <TabList
      tabs={formattedCategories}
      activeTab={activeCategory}
      onTabChange={onCategoryChange}
      className="mb-4"
    />
  );
}
