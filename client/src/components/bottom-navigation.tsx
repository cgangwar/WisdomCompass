import { Button } from "@/components/ui/button";
import { Home, Pen, Quote, Target } from "lucide-react";

interface BottomNavigationProps {
  currentPage: 'home' | 'journal' | 'quotes' | 'goals' | 'reminders';
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-sage/10 px-6 py-3">
      <div className="flex justify-around">
        <Button
          variant="ghost"
          onClick={() => window.location.href = "/"}
          className={`flex flex-col items-center space-y-1 ${
            currentPage === 'home' ? 'text-sage' : 'text-sage/50 hover:text-sage'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.location.href = "/journal"}
          className={`flex flex-col items-center space-y-1 ${
            currentPage === 'journal' ? 'text-sage' : 'text-sage/50 hover:text-sage'
          }`}
        >
          <Pen className="w-5 h-5" />
          <span className="text-xs">Journal</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.location.href = "/quotes"}
          className={`flex flex-col items-center space-y-1 ${
            currentPage === 'quotes' ? 'text-sage' : 'text-sage/50 hover:text-sage'
          }`}
        >
          <Quote className="w-5 h-5" />
          <span className="text-xs">Quotes</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.location.href = "/goals"}
          className={`flex flex-col items-center space-y-1 ${
            currentPage === 'goals' ? 'text-sage' : 'text-sage/50 hover:text-sage'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-xs">Goals</span>
        </Button>
      </div>
    </div>
  );
}
