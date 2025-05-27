import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Workouts from "@/pages/workouts";
import Exercises from "@/pages/exercises";
import History from "@/pages/history";
import Login from "@/pages/login";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import { useState } from "react";

// Tabs configuration
export type AppTab = "dashboard" | "workouts" | "exercises" | "history";
export const tabs: { id: AppTab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "workouts", label: "Workouts", icon: "fitness_center" },
  { id: "exercises", label: "Exercises", icon: "category" },
  { id: "history", label: "History", icon: "history" },
];

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/exercises" component={Exercises} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-auto pb-16 md:pb-4">
            <div className="bg-white border-b border-gray-200">
              <div className="container mx-auto">
                <div className="flex overflow-x-auto hide-scrollbar" id="tabs">
                  {tabs.map((tab) => (
                    <a 
                      key={tab.id}
                      href={tab.id === "dashboard" ? "/" : `/${tab.id}`}
                      className={`px-6 py-3 font-medium whitespace-nowrap ${
                        activeTab === tab.id
                          ? "text-primary border-b-2 border-primary"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <Router />
          </main>
          <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
