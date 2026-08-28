import type { ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "./components/common/AppLayout";
import { Spinner } from "./components/ui/Spinner";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { OnboardingPage } from "./features/auth/OnboardingPage";
import { ProfilePage } from "./features/auth/ProfilePage";
import { RoutinesPage } from "./features/routines/RoutinesPage";
import { RoutineEditorPage } from "./features/routines/RoutineEditorPage";
import { ExercisesPage } from "./features/exercises/ExercisesPage";
import { WorkoutStartPage } from "./features/workout/WorkoutStartPage";
import { WorkoutActivePage } from "./features/workout/WorkoutActivePage";
import { ProgressPage } from "./features/progress/ProgressPage";
import { HomePage } from "./features/home/HomePage";
import { LinksPage } from "./features/links/LinksPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { useAuthStore } from "./stores/authStore";
import { useUiStore } from "./stores/uiStore";
import { AdvisorPage } from "./features/advisor/AdvisorPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const userId = useAuthStore((state) => state.userId);
  const profile = useAuthStore((state) => state.profile);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const location = useLocation();

  if (!isInitialized) return <Spinner full />;
  if (!userId) return <Navigate to="/login" replace />;
  if (!profile) return <Spinner full />;
  if (!profile.fullName && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  if (profile.fullName && location.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const userId = useAuthStore((state) => state.userId);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) return <Spinner full />;
  if (userId) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const theme = useUiStore((state) => state.theme);

  return (
    <>
       <Routes>
        {/* ===== ZONA 1: RUTAS PÚBLICAS (sin sesión) ===== */}
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="/registro"
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />

        {/* ===== ZONA 2: RUTAS PROTEGIDAS (con sesión) ===== */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="rutinas" element={<RoutinesPage />} />
          <Route path="rutinas/:id" element={<RoutineEditorPage />} />
          <Route path="ejercicios" element={<ExercisesPage />} />
          <Route path="entrenar" element={<WorkoutStartPage />} />
          <Route path="entrenar/activo" element={<WorkoutActivePage />} />
          <Route path="progreso" element={<ProgressPage />} />
          <Route path="enlaces" element={<LinksPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="asesor" element={<AdvisorPage />} />
        </Route>

        {/* ===== ZONA 3: COMODÍN ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster theme={theme} position="top-center" />
    </>
    
  );
}
