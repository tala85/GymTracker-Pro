// Servicio de notificaciones del navegador

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function showNotification(title: string, body?: string) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  new Notification(title, {
    body,
    icon: '/favicon.svg', // ajustá si tu ícono tiene otro nombre
  })
}