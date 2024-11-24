import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <div className="container">
        <div className="header">
          <img src="/logo.svg" alt="logo" className="h-5" />
        </div>
        <App />
      </div>
    </React.StrictMode>
  </QueryClientProvider>
);
