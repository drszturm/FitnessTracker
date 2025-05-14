import { Link } from "wouter";
import { AppTab, tabs } from "@/App";

interface MobileNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  return (
    <>
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10 md:hidden">
        <div className="grid grid-cols-4">
          {tabs.map((tab) => (
            <Link key={tab.id} href={tab.id === "dashboard" ? "/" : `/${tab.id}`}>
              <a
                className={`flex flex-col items-center justify-center py-2 ${
                  activeTab === tab.id ? "text-primary" : "text-gray-500"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="material-icons">{tab.icon}</span>
                <span className="text-xs mt-1">{tab.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Floating Action Button for mobile */}
      <Link href="/workouts">
        <a 
          className="fixed right-6 bottom-20 md:hidden bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-10"
          onClick={() => setActiveTab("workouts")}
        >
          <span className="material-icons">add</span>
        </a>
      </Link>
    </>
  );
}
