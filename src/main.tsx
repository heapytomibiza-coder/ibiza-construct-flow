import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import "./i18n";
import { ServicesProvider } from "./contexts/ServicesContext";
import { FeatureFlagsProvider } from "./contexts/FeatureFlagsContext";

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
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <FeatureFlagsProvider>
        <ServicesProvider>
          <React.Suspense fallback={<div>Loading...</div>}>
            <App />
          </React.Suspense>
        </ServicesProvider>
      </FeatureFlagsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
