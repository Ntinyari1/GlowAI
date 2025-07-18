import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Tips from "@/pages/tips";
import Products from "@/pages/products";
import Routine from "@/pages/routine";
import Social from "@/pages/social";
import Profile from "./pages/profile";
import Navbar from "@/components/layout/navbar";

function Router() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/tips" component={Tips} />
        <Route path="/products" component={Products} />
        <Route path="/routine" component={Routine} />
        <Route path="/social" component={Social} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </div>
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
