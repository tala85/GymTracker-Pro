import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useReminderStore } from "../stores/reminderStore";
import { getRandomPhrase } from "../data/wisdom";
import {
  getNotificationPermission,
  showNotification,
} from "../lib/notifications";

interface TimeReminder {
  key: string;
  enabled: boolean;
  time: string;
  days?: number[];
  title: string;
  body: string;
}

export function useReminderScheduler() {
  const settings = useReminderStore((state) => state.settings);
  const lastFired = useRef<Record<string, string>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      if (getNotificationPermission() !== "granted") return;

      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const hhmm = `${String(hour).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const dayKey = now.toDateString();

      const fire = (key: string, title: string, body: string) => {
        const fullKey = `${dayKey}-${key}`;
        if (lastFired.current[fullKey] === hhmm) return;
        lastFired.current[fullKey] = hhmm;
        showNotification(title, body);
        toast.info(title, { description: body, duration: 8000 });
      };

      const nutritionPhrase = getRandomPhrase("nutricion");
      const temperancePhrase = getRandomPhrase("temperancia");

      // Los 8 remedios: recordatorios con hora fija
      const timeReminders: TimeReminder[] = [
        {
          key: "workout",
          enabled: settings.workoutEnabled,
          time: settings.workoutTime,
          days: settings.workoutDays,
          title: "💪 ¡Hora de entrenar!",
          body: "Tu rutina te espera. El vos del futuro te lo va a agradecer.",
        },
        {
          key: "nutrition",
          enabled: settings.nutritionEnabled,
          time: settings.nutritionTime,
          title: "🥗 Nutrición",
          body: nutritionPhrase
            ? `Sumá frutas y verduras hoy. "${nutritionPhrase.text}" — ${nutritionPhrase.source}`
            : "Sumá frutas y verduras a tu plato. Comer bien también es entrenar.",
        },
        {
          key: "sun",
          enabled: settings.sunEnabled,
          time: settings.sunTime,
          title: "🌞 Luz de sol",
          body: "Salí 10-15 minutos al aire libre. El sol regula tu energía y tu sueño.",
        },
        {
          key: "air",
          enabled: settings.airEnabled,
          time: settings.airTime,
          title: "🍃 Aire puro",
          body: "Respirá profundo unos minutos: ventilá tu espacio o salí afuera.",
        },
        {
          key: "temperance",
          enabled: settings.temperanceEnabled,
          time: settings.temperanceTime,
          title: "⚖️ Temperancia",
          body: temperancePhrase
            ? `Momento de equilibrio. "${temperancePhrase.text}" — ${temperancePhrase.source}`
            : "Bajá pantallas y cená liviano. El equilibrio también entrena.",
        },
        {
          key: "rest",
          enabled: settings.restEnabled,
          time: settings.restTime,
          title: "😴 Hora de descansar",
          body: "El buen sueño es parte del entrenamiento. Empezá a relajarte.",
        },
      ];

      for (const reminder of timeReminders) {
        if (!reminder.enabled) continue;
        if (reminder.days && !reminder.days.includes(day)) continue;
        if (hhmm === reminder.time)
          fire(reminder.key, reminder.title, reminder.body);
      }

      // 🙏 Confianza en Dios: 3 momentos con versículo o frase de aliento
      if (settings.trustEnabled) {
        settings.trustTimes.forEach((time, index) => {
          if (hhmm !== time) return;
          const phrase = getRandomPhrase("confianza");
          fire(
            `trust-${index}`,
            "🙏 Confianza en Dios",
            phrase
              ? `"${phrase.text}" — ${phrase.source}`
              : "Dedicate unos minutos de calma, gratitud y oración.",
          );
        });
      }

      // Agua: cada X horas, solo entre 7 y 22 hs
      if (
        settings.waterEnabled &&
        now.getMinutes() === 0 &&
        hour % settings.waterIntervalHours === 0 &&
        hour >= 7 &&
        hour <= 22
      ) {
        fire(
          "water",
          "💧 Hidratate",
          "Pasaron unas horas, tomá un vaso de agua.",
        );
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [settings]);
}
