import React from "react";
import { cn } from "@/lib/utils";

interface TabListProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabList({ tabs, activeTab, onTabChange, className }: TabListProps) {
  return (
    <div className={cn("flex overflow-x-auto pb-2 hide-scrollbar", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "whitespace-nowrap px-4 py-2 rounded-lg mr-2",
            activeTab === tab.id
              ? "bg-primary text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
