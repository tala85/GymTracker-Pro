// Service Worker personalizado de GymTracker Pro
import { clientsClaim } from "workbox-core";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();

// En desarrollo el manifest viene vacío; el caché offline completo
// solo aplica en producción. Este if es el patrón recomendado.
// workbox-build exige que self.__WB_MANIFEST aparezca UNA sola vez
const MANIFEST = self.__WB_MANIFEST || []
if (MANIFEST.length > 0) {
  precacheAndRoute(MANIFEST)
  // SPA: cualquier navegación abre la app
  registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')))
}

// ---- Puente IndexedDB (mismo nombre que usa la app) ----
const DB_NAME = "gymtracker-reminder-sync";
const STORE = "kv";
async function readPayload() {
  try {
    const db = await openDb()
    console.log('[SW] stores visibles:', Array.from(db.objectStoreNames))
    return await new Promise((resolve) => {
      const req = db
        .transaction(STORE, 'readonly')
        .objectStore(STORE)
        .get('payload')
      req.onsuccess = () => {
        console.log('[SW] get exitoso, result:', req.result)
        resolve(req.result)
      }
      req.onerror = () => {
        console.log('[SW] get con error:', req.error)
        resolve(undefined)
      }
    })
  } catch (e) {
    console.log('[SW] readPayload falló:', e)
    return undefined
  }
}

async function writePayload(payload) {
  try {
    const db = await openDb();
    await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(payload, "payload");
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
  } catch {
    /* silencio */
  }
}

const pad = (n) => String(n).padStart(2, "0");

// Revisa los recordatorios pendientes de HOY y avisa
async function checkReminders() {
  const payload = await readPayload();
  console.log('[SW] payload:', payload)
  if (!payload || !payload.settings) return;

  const s = payload.settings;
  const now = new Date();
  const day = now.getDay();
  const dayKey = now.toDateString();
  const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const fired = { ...(payload.fired || {}) };
  let changed = false;

  const tryFire = (key, time, title, body, days) => {
    if (!time || fired[key] === dayKey) return;
    if (days && !days.includes(day)) return;
    if (hhmm < time) return; // todavía no es la hora
    console.log('[SW] disparando:', key, title)
    self.registration.showNotification(title, { body, icon: "/favicon.svg" });
    fired[key] = dayKey;
    changed = true;
  };

  if (s.workoutEnabled)
    tryFire(
      "workout",
      s.workoutTime,
      "💪 ¡Hora de entrenar!",
      "Tu rutina te espera. El vos del futuro te lo va a agradecer.",
      s.workoutDays,
    );
  if (s.nutritionEnabled)
    tryFire(
      "nutrition",
      s.nutritionTime,
      "🥗 Nutrición",
      "Sumá frutas y verduras a tu plato.",
    );
  if (s.sunEnabled)
    tryFire(
      "sun",
      s.sunTime,
      "🌞 Luz de sol",
      "Salí 10-15 minutos al aire libre.",
    );
  if (s.airEnabled)
    tryFire("air", s.airTime, "🍃 Aire puro", "Respirá profundo unos minutos.");
  if (s.temperanceEnabled)
    tryFire(
      "temperance",
      s.temperanceTime,
      "⚖️ Temperancia",
      "Bajá pantallas y cená liviano.",
    );
  if (s.restEnabled)
    tryFire(
      "rest",
      s.restTime,
      "😴 Hora de descansar",
      "El buen sueño es parte del entrenamiento.",
    );
  if (s.trustEnabled)
    (s.trustTimes || []).forEach((t, i) =>
      tryFire(
        `trust-${i}`,
        t,
        "🙏 Confianza en Dios",
        "Un momento de calma, gratitud y oración.",
      ),
    );

  if (changed) await writePayload({ settings: s, fired });
}

// El navegador despierta al SW periódicamente
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "reminders-sync") {
    event.waitUntil(checkReminders());
  }
});

// Para probar manualmente desde la consola de la app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "TEST_REMINDERS") {
    console.log('[SW] TEST_REMINDERS recibido')
    event.waitUntil(checkReminders());
  }
});
