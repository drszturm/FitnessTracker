import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

interface DataCardProps {
  title: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function DataCard({ title, icon, className, children }: DataCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-500">{title}</h3>
          {icon}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
