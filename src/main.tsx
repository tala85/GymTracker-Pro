import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './stores/authStore'
import { useExerciseStore } from './stores/exerciseStore'
import { useRoutineStore } from './stores/routineStore'
import './lib/installPrompt'

useAuthStore
  .getState()
  .initialize()
  .catch(console.error)

useExerciseStore
  .getState()
  .load()
  .catch(console.error)

useRoutineStore
  .getState()
  .load()
  .catch(console.error)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)