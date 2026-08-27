import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.tsx";
import { useAuthStore } from "./stores/authStore";
import { useExerciseStore } from "./stores/exerciseStore";
import { useRoutineStore } from "./stores/routineStore";
import "./lib/installPrompt";

useAuthStore.getState().initialize().catch(console.error);

useExerciseStore.getState().load().catch(console.error);

useRoutineStore.getState().load().catch(console.error);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        theme="light"
        position="top-center"
        toastOptions={{
          className: "rounded-xl font-semibold shadow-xl",
          duration: 3000,
        }}
      />
    </BrowserRouter>
  </StrictMode>,
);
