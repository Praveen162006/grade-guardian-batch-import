
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./providers/AuthProvider";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";
import PerformanceReport from "./pages/PerformanceReport";
import BrandSentiment from "./pages/BrandSentiment";
import BrandSentimentDemo from "./components/BrandSentimentDemo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <PrivateRoute>
                <Index />
              </PrivateRoute>
            } />
            <Route path="/performance-report" element={
              <PrivateRoute>
                <PerformanceReport />
              </PrivateRoute>
            } />
            <Route path="/brand-sentiment" element={
              <PrivateRoute>
                <BrandSentiment />
              </PrivateRoute>
            } />
            <Route path="/demo" element={<BrandSentimentDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
