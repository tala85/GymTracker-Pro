import { useState, type ReactNode } from "react";
import {
  Bell,
  BellRing,
  Droplets,
  Dumbbell,
  HeartHandshake,
  Moon,
  Salad,
  Scale,
  Sun,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { useReminderStore } from "../../stores/reminderStore";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
} from "../../lib/notifications";

const DAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function TimeReminderCard({
  icon,
  title,
  enabled,
  time,
  onToggle,
  onTimeChange,
}: {
  icon: ReactNode;
  title: string;
  enabled: boolean;
  time: string;
  onToggle: (value: boolean) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg bg-white p-3 dark:bg-slate-700/50">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          {icon} {title}
        </p>
        <Toggle
          checked={enabled}
          onChange={onToggle}
          label={`Recordatorio: ${title}`}
        />
      </div>
      {enabled && (
        <label className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          Hora:
          <input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
      )}
    </div>
  );
}

export function RemindersSection() {
  const settings = useReminderStore((state) => state.settings);
  const updateSettings = useReminderStore((state) => state.updateSettings);
  const [permission, setPermission] = useState(getNotificationPermission());

  const handleEnable = async () => {
    await requestNotificationPermission();
    const current = getNotificationPermission();
    setPermission(current);
    if (current === "granted") {
      toast.success("Notificaciones activadas 🔔");
      showNotification(
        "🔔 Notificaciones activadas",
        "Te vamos a avisar en los momentos clave.",
      );
    } else {
      toast.error(
        "Permiso denegado. Habilitalo desde el candado de la barra de direcciones.",
      );
    }
  };

  const toggleDay = (day: number) => {
    const next = settings.workoutDays.includes(day)
      ? settings.workoutDays.filter((d) => d !== day)
      : [...settings.workoutDays, day];
    updateSettings({ workoutDays: next });
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
      <div>
        <h2 className="flex items-center gap-2 text-base font-bold">
          <BellRing className="text-emerald-500" size={18} /> Recordatorios
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Los 8 remedios naturales, de tu bolsillo a tu día.
        </p>
      </div>

      {permission !== "granted" ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Activá las notificaciones para recibir los avisos.
          </p>
          <button
            onClick={handleEnable}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <Bell size={16} /> Activar notificaciones
          </button>
        </div>
      ) : (
        <>
          {/* EJERCICIO */}
          <div className="rounded-lg bg-white p-3 dark:bg-slate-700/50">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Dumbbell size={16} className="text-emerald-500" />{" "}
                Entrenamiento
              </p>
              <Toggle
                checked={settings.workoutEnabled}
                onChange={(v) => updateSettings({ workoutEnabled: v })}
                label="Recordatorio de entrenamiento"
              />
            </div>
            {settings.workoutEnabled && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex flex-wrap gap-1">
                  {DAYS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => toggleDay(d.value)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        settings.workoutDays.includes(d.value)
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-gray-600 dark:bg-slate-600 dark:text-gray-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  Hora:
                  <input
                    type="time"
                    value={settings.workoutTime}
                    onChange={(e) =>
                      updateSettings({ workoutTime: e.target.value })
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
                  />
                </label>
              </div>
            )}
          </div>

          {/* AGUA */}
          <div className="rounded-lg bg-white p-3 dark:bg-slate-700/50">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Droplets size={16} className="text-blue-500" /> Hidratación
              </p>
              <Toggle
                checked={settings.waterEnabled}
                onChange={(v) => updateSettings({ waterEnabled: v })}
                label="Recordatorio de agua"
              />
            </div>
            {settings.waterEnabled && (
              <label className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                Avisarme cada:
                <select
                  value={settings.waterIntervalHours}
                  onChange={(e) =>
                    updateSettings({
                      waterIntervalHours: Number(e.target.value),
                    })
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
                >
                  <option value={1}>1 hora</option>
                  <option value={2}>2 horas</option>
                  <option value={3}>3 horas</option>
                  <option value={4}>4 horas</option>
                </select>
              </label>
            )}
          </div>

          {/* RESTO DE LOS REMEDIOS */}
          <TimeReminderCard
            icon={<Salad size={16} className="text-lime-500" />}
            title="Nutrición"
            enabled={settings.nutritionEnabled}
            time={settings.nutritionTime}
            onToggle={(v) => updateSettings({ nutritionEnabled: v })}
            onTimeChange={(v) => updateSettings({ nutritionTime: v })}
          />
          <TimeReminderCard
            icon={<Sun size={16} className="text-amber-500" />}
            title="Luz de sol"
            enabled={settings.sunEnabled}
            time={settings.sunTime}
            onToggle={(v) => updateSettings({ sunEnabled: v })}
            onTimeChange={(v) => updateSettings({ sunTime: v })}
          />
          <TimeReminderCard
            icon={<Wind size={16} className="text-teal-400" />}
            title="Aire puro"
            enabled={settings.airEnabled}
            time={settings.airTime}
            onToggle={(v) => updateSettings({ airEnabled: v })}
            onTimeChange={(v) => updateSettings({ airTime: v })}
          />
          <TimeReminderCard
            icon={<Scale size={16} className="text-purple-400" />}
            title="Temperancia"
            enabled={settings.temperanceEnabled}
            time={settings.temperanceTime}
            onToggle={(v) => updateSettings({ temperanceEnabled: v })}
            onTimeChange={(v) => updateSettings({ temperanceTime: v })}
          />
          <TimeReminderCard
            icon={<Moon size={16} className="text-indigo-400" />}
            title="Descanso"
            enabled={settings.restEnabled}
            time={settings.restTime}
            onToggle={(v) => updateSettings({ restEnabled: v })}
            onTimeChange={(v) => updateSettings({ restTime: v })}
          />
          <div className="rounded-lg bg-white p-3 dark:bg-slate-700/50">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <HeartHandshake size={16} className="text-rose-400" /> Confianza
                en Dios
              </p>
              <Toggle
                checked={settings.trustEnabled}
                onChange={(v) => updateSettings({ trustEnabled: v })}
                label="Recordatorio de confianza en Dios"
              />
            </div>
            {settings.trustEnabled && (
              <div className="mt-3 flex flex-col gap-2">
                {(["Mañana", "Tarde", "Noche"] as const).map((label, i) => (
                  <label
                    key={label}
                    className="flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300"
                  >
                    {label}:
                    <input
                      type="time"
                      value={settings.trustTimes[i] ?? ""}
                      onChange={(e) => {
                        const next = [...settings.trustTimes];
                        next[i] = e.target.value;
                        updateSettings({ trustTimes: next });
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
                    />
                  </label>
                ))}
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  En cada momento recibirás un versículo o frase de aliento.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              showNotification(
                "🔔 Prueba de notificación",
                "Así se van a ver tus recordatorios.",
              )
            }
            className="text-left text-xs font-medium text-emerald-500 hover:underline"
          >
            Probar notificación
          </button>
        </>
      )}
    </section>
  );
}
