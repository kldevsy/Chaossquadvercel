import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth, AuthProvider } from "@/hooks/useAuthFinal";
import FloatingNotification from "@/components/floating-notification";
import { useFloatingNotifications } from "@/hooks/useFloatingNotifications";
import Home from "@/pages/home";
import Projects from "@/pages/projects";
import Chat from "@/pages/chat";
import ArtistProfile from "@/pages/artist-profile";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import AuthPageSimple from "@/pages/auth-simple";
import Debug from "@/pages/debug";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('Router state:', { isAuthenticated, isLoading, user: user?.username });

  if (isLoading) {
    console.log('Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('Rendering routes, authenticated:', isAuthenticated);

  return (
    <Switch>
      <Route path="/debug" component={Debug} />
      {!isAuthenticated ? (
        <>
          <Route path="/auth" component={AuthPageSimple} />
          <Route path="/*" component={AuthPageSimple} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/projects" component={Projects} />
          <Route path="/chat" component={Chat} />
          <Route path="/artist-profile/:id" component={ArtistProfile} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function AppWithNotifications() {
  const { isAuthenticated } = useAuth();
  const { currentNotification, closeNotification, handleNavigate } = useFloatingNotifications();

  return (
    <>
      <Router />
      {isAuthenticated && (
        <FloatingNotification
          notification={currentNotification}
          onClose={closeNotification}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <AppWithNotifications />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
