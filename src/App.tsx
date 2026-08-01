import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/protected-route";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Builder from "@/pages/builder";
import Templates from "@/pages/templates";
import AiTools from "@/pages/ai-tools";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import OAuthCallback from "@/pages/oauth-callback";
import AdminPortal from "@/pages/admin";
import MyResumes from "@/pages/my-resumes";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import PaymentSuccess from "@/pages/payment-success";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/oauth-callback" component={OAuthCallback} />
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/builder">
        <ProtectedRoute><Builder /></ProtectedRoute>
      </Route>
      <Route path="/templates">
        <ProtectedRoute><Templates /></ProtectedRoute>
      </Route>
      <Route path="/ai-tools">
        <ProtectedRoute><AiTools /></ProtectedRoute>
      </Route>
      <Route path="/my-resumes">
        <ProtectedRoute><MyResumes /></ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute><Analytics /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><Settings /></ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute adminOnly><AdminPortal /></ProtectedRoute>
      </Route>
      <Route path="/payment-success">
  <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;