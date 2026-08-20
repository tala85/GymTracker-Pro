# GymTracker Pro 🏋️

PWA (Progressive Web App) para seguimiento de rutinas de gimnasio y control de medidas corporales. Funciona offline, se instala como app nativa y sincroniza con la nube.

## Funcionalidades

- **Autenticación:** email/contraseña y Google (Supabase), con modo local sin cuenta.
- **Rutinas:** plantillas basadas en evidencia (PPL, Weider, Torso/Pierna, Full Body, Upper/Lower) y editor 100% libre (1 a 7 días).
- **Ejercicios:** catálogo de 67 ejercicios con video, favoritos y ejercicios personalizados.
- **Entrenamiento activo:** series con peso/reps/RIR, temporizador de descanso con sonido y vibración, copiar sesión anterior, reanudar si cerrás la app.
- **Progreso:** medidas con gráficos e IMC automático, fotos de progreso con comparación, historial de sesiones, récords personales y 1RM estimado.
- **Datos:** offline-first (IndexedDB), respaldo en la nube, exportar/importar JSON y rutinas en PDF.
- **PWA:** instalable en PC y celular, funciona sin conexión.

## Stack

React 18 + TypeScript + Vite · Tailwind CSS · Zustand · Supabase (Auth + PostgreSQL) · IndexedDB (idb) · Recharts · jsPDF

## Arranque local

1. `npm install`
2. Copiá `.env.example` a `.env` y completá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. `npm run dev`

## Producción
