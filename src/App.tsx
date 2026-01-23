import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import LangLayout from "@/components/LangLayout";
import GTranslateBridge from "@/components/GTranslateBridge";

import Index from "./pages/Index";
import Solutions from "./pages/Solutions";
import Intel from "./pages/Intel";
import IntelVertical from "./pages/IntelVertical";
import ArticlePage from "./pages/ArticlePage";
import DataFeeds from "./pages/DataFeeds";
import ApiDocs from "./pages/ApiDocs";
import Login from "./pages/Login";
import Management from "./pages/Management";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <GoogleAnalytics />
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <GTranslateBridge />
            <Routes>
              {/* Non-prefixed routes (default language) */}
              <Route path="/" element={<Index />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/intel" element={<Intel />} />
              <Route path="/w3ai/vertical/:vertical" element={<IntelVertical />} />
              <Route path="/w3ai/:postId/:vertical/:slug" element={<ArticlePage />} />
              <Route path="/data-feeds" element={<DataFeeds />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/management" element={<Management />} />

              {/* Language-prefixed routes, e.g. /nl, /nl/intel */}
              <Route path="/:lang" element={<LangLayout />}>
                <Route index element={<Index />} />
                <Route path="solutions" element={<Solutions />} />
                <Route path="intel" element={<Intel />} />
                <Route path="w3ai/vertical/:vertical" element={<IntelVertical />} />
                <Route path="w3ai/:postId/:vertical/:slug" element={<ArticlePage />} />
                <Route path="data-feeds" element={<DataFeeds />} />
                <Route path="api-docs" element={<ApiDocs />} />
                <Route path="login" element={<Login />} />
                <Route path="management" element={<Management />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
