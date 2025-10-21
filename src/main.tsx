import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServicesRegistryProvider } from "./contexts/ServicesRegistry";
import { FeatureFlagsProvider } from "./contexts/FeatureFlagsContext";
import { BookingCartProvider } from "./contexts/BookingCartContext";
import App from "./App";
import "./index.css";
import "./i18n";
import { initWebVitals } from "./lib/performance/webVitals";
import { logBundleMetrics } from "./components/performance/BundleOptimizer";
import { setupGlobalErrorHandling } from "./lib/monitoring/errorTracking";
import { setupNavigationTracking } from "./lib/analytics/tracking";
import { validateEnvironment } from "./lib/deployment/environment";
import { analytics } from "./lib/analytics.ts";

// Validate environment (Phase 9: Production Hardening)
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
}

// Initialize Web Vitals tracking (Phase 6: Performance Optimization)
initWebVitals();

// Setup error handling (Phase 9: Error Tracking)
setupGlobalErrorHandling();

// Setup analytics (Phase 9: Analytics)
setupNavigationTracking();

// Initialize analytics-to-database bridge (Phase 31: Observability)
analytics.configure({ enabled: true, sampleRate: 1 });

// Log bundle metrics in development (Phase 7: Bundle Optimization)
if (import.meta.env.DEV) {
  window.addEventListener('load', logBundleMetrics);
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (garbage collection)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      // Keep previous data while fetching for smoother UX
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // Global retry config for mutations
      retry: 0,
      // Network mode for better offline handling
      networkMode: 'online',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <FeatureFlagsProvider>
        <ServicesRegistryProvider>
          <BookingCartProvider>
            <App />
          </BookingCartProvider>
        </ServicesRegistryProvider>
      </FeatureFlagsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
