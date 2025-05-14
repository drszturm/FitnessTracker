import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="text-xl font-bold text-primary">FitTrack</a>
        </Link>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-primary transition-colors">
            <span className="material-icons">notifications</span>
          </button>
          <button className="text-gray-500 hover:text-primary transition-colors">
            <span className="material-icons">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="material-icons text-gray-600">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
