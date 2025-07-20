import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Setup from "@/pages/setup";
import Journal from "@/pages/journal";
import Quotes from "@/pages/quotes";
import Goals from "@/pages/goals";
import Reminders from "@/pages/reminders";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-sage">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {!(user as any)?.setupCompleted ? (
            <Route path="/" component={Setup} />
          ) : (
            <Route path="/" component={Home} />
          )}
          <Route path="/setup" component={Setup} />
          <Route path="/journal" component={Journal} />
          <Route path="/quotes" component={Quotes} />
          <Route path="/goals" component={Goals} />
          <Route path="/reminders" component={Reminders} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
