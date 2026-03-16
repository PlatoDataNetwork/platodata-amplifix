import { Suspense, lazy } from "react";
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
import SeoHreflang from "@/components/SeoHreflang";
import GoogleTranslateLoader from "@/components/GoogleTranslateLoader";

import Index from "./pages/Index";

// Lazy-loaded routes for code-splitting
const Solutions = lazy(() => import("./pages/Solutions"));
const Intel = lazy(() => import("./pages/Intel"));
const IntelVertical = lazy(() => import("./pages/IntelVertical"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const DataFeeds = lazy(() => import("./pages/DataFeeds"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const Login = lazy(() => import("./pages/Login"));
const Management = lazy(() => import("./pages/Management"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
            <GoogleTranslateLoader />
            <div id="google_translate_element" className="hidden" />
            <GTranslateBridge />
            <Suspense fallback={<div className="min-h-screen" />}>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
