import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

export default function Header() {
  const [_, setLocation] = useLocation();

  // Check authentication status
  const { data: authData } = useQuery({
    queryKey: ['/api/auth/status'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = authData && typeof authData === 'object' && 'authenticated' in authData && authData.authenticated;
  
  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout');
      // Force refresh auth status by invalidating the query
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">FitTrack</a>
        </Link>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-primary transition-colors">
            <span className="material-icons">notifications</span>
          </button>
          <button className="text-gray-500 hover:text-primary transition-colors">
            <span className="material-icons">settings</span>
          </button>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                <span className="material-icons text-white">person</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-1">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation('/login')}
              className="flex items-center gap-1 border-blue-500 hover:bg-blue-50"
            >
              <LogIn className="h-4 w-4 text-blue-600" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
