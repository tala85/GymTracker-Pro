import { useSyncExternalStore } from 'react'
import { getCanInstall, getInstalled, promptInstall, subscribeInstall } from '../lib/installPrompt'

export function useInstallPrompt() {
  const canInstall = useSyncExternalStore(subscribeInstall, getCanInstall)
  const installed = useSyncExternalStore(subscribeInstall, getInstalled)
  return { canInstall, installed, install: promptInstall }
}