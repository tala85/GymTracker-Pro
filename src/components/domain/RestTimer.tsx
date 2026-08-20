import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useWorkoutStore } from "../../stores/workoutStore";

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // si el navegador bloquea el audio, no pasa nada
  }
}

export function RestTimer() {
  const restEndsAt = useWorkoutStore((state) => state.restEndsAt);
  const extendRest = useWorkoutStore((state) => state.extendRest);
  const clearRest = useWorkoutStore((state) => state.clearRest);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!restEndsAt) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [restEndsAt]);

  useEffect(() => {
    if (restEndsAt && now >= restEndsAt) {
      playBeep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      clearRest();
    }
  }, [now, restEndsAt, clearRest]);

  if (!restEndsAt) return null;

  const reference = now === 0 ? restEndsAt : now;
  const remaining = Math.max(0, Math.ceil((restEndsAt - reference) / 1000));
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-emerald-500 px-5 py-3 text-white shadow-lg shadow-emerald-500/40">
      <span className="text-lg font-bold tabular-nums">
        {mm}:{ss}
      </span>
      <button
        onClick={() => extendRest(30)}
        className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold hover:bg-white/30"
      >
        +30s
      </button>
      <button
        onClick={clearRest}
        aria-label="Saltar descanso"
        className="hover:bg-white/20 rounded-full p-1"
      >
        <X size={18} />
      </button>
    </div>
  );
}
