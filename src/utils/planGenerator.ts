import { TEMPLATES, type TemplateDef } from "../data/templates";
import { SYSTEM_EXERCISES } from "../data/exercises";
import type { TrainingGoal } from "../types";

export interface AdvisorAnswers {
  goal: TrainingGoal;
  daysPerWeek: number;
  experience: "principiante" | "intermedio" | "avanzado";
  timePerSession: "corta" | "media" | "larga";
  equipment: "gym" | "basico" | "casa";
  limitations: string[];
}

type ExerciseTuple = [string, number, string, number, number];

const findTemplate = (key: string): TemplateDef => {
  const t = TEMPLATES.find((item) => item.key === key);
  if (!t) throw new Error("Plantilla no encontrada");
  return t;
};

const clone = (t: TemplateDef): TemplateDef => ({
  ...t,
  days: t.days.map((d) => ({
    ...d,
    exercises: d.exercises.map((e) => [...e] as ExerciseTuple),
  })),
});

const equipmentOf = (name: string) =>
  SYSTEM_EXERCISES.find((e) => e.name === name)?.equipment ?? "otro";

function applySwaps(plan: TemplateDef, swaps: [string, string][]) {
  const map = new Map(swaps);
  for (const day of plan.days) {
    day.exercises = day.exercises.map((ex) => {
      const target = map.get(ex[0]);
      return target
        ? ([target, ex[1], ex[2], ex[3], ex[4]] as ExerciseTuple)
        : ex;
    });
  }
}

function dedupe(plan: TemplateDef) {
  for (const day of plan.days) {
    const seen = new Set<string>();
    day.exercises = day.exercises.filter((ex) =>
      seen.has(ex[0]) ? false : (seen.add(ex[0]), true),
    );
  }
}

const CASA_SWAPS: [string, string][] = [
  ["Press banca plano", "Flexiones"],
  ["Press inclinado con mancuernas", "Flexiones"],
  ["Press en máquina", "Flexiones"],
  ["Cruce de poleas", "Aperturas con mancuernas"],
  ["Pull over en polea", "Aperturas con mancuernas"],
  ["Remo con barra", "Remo con mancuerna"],
  ["Remo en máquina", "Remo con mancuerna"],
  ["Remo en polea baja", "Remo con mancuerna"],
  ["Jalón al pecho", "Dominadas"],
  ["Face pull", "Pájaros con mancuernas"],
  ["Elevaciones laterales en polea", "Elevaciones laterales"],
  ["Extensión de tríceps en polea", "Fondos en banco"],
  ["Tríceps overhead en polea", "Press francés con mancuernas"],
  ["Curl con barra", "Curl con mancuernas"],
  ["Curl predicador", "Curl concentrado"],
  ["Curl en polea baja", "Curl concentrado"],
  ["Press militar con barra", "Press militar con mancuernas"],
  ["Sentadilla libre", "Sentadilla búlgara"],
  ["Sentadilla hack", "Sentadilla búlgara"],
  ["Prensa 45", "Zancadas"],
  ["Extensiones de cuádriceps", "Sentadilla búlgara"],
  ["Curl femoral tumbado", "Peso muerto rumano"],
  ["Curl femoral sentado", "Peso muerto rumano"],
  ["Peso muerto", "Peso muerto rumano"],
  ["Hip thrust", "Puente de glúteo"],
  ["Patada de glúteo en polea", "Puente de glúteo"],
  ["Abductores en máquina", "Puente de glúteo"],
  ["Pantorrillas en prensa", "Elevación de talones de pie"],
  ["Elevación de talones sentado", "Elevación de talones de pie"],
  ["Crunch en polea", "Crunch"],
  ["Pallof press", "Plancha lateral"],
];

const POLEA_SWAPS: [string, string][] = CASA_SWAPS.filter(([from]) =>
  [
    "Cruce de poleas",
    "Pull over en polea",
    "Face pull",
    "Elevaciones laterales en polea",
    "Extensión de tríceps en polea",
    "Tríceps overhead en polea",
    "Curl en polea baja",
    "Crunch en polea",
    "Pallof press",
    "Patada de glúteo en polea",
    "Remo en polea baja",
    "Jalón al pecho",
  ].includes(from),
);

const CASA_ALLOWED = ["peso_corporal", "bandas", "mancuernas", "otro"];
const BASICO_ALLOWED = [
  "barra",
  "mancuernas",
  "maquina",
  "peso_corporal",
  "bandas",
  "otro",
];

export function generatePlan(a: AdvisorAnswers): {
  plan: TemplateDef;
  notes: string[];
} {
  const notes: string[] = [];
  let plan: TemplateDef;

  if (a.daysPerWeek <= 2) {
    plan = clone(findTemplate("fullbody-3"));
    plan.days = plan.days.slice(0, 2);
    plan.days.forEach((d, i) => {
      d.weekday = i === 0 ? 1 : 4;
    });
    notes.push(
      "Con 2 días, Full Body es lo más eficiente: todo el cuerpo en cada sesión.",
    );
  } else if (a.daysPerWeek === 3) {
    plan = clone(findTemplate("fullbody-3"));
  } else if (a.daysPerWeek === 4) {
    plan = clone(findTemplate("upper-lower-4"));
  } else if (a.daysPerWeek === 5) {
    plan = clone(
      findTemplate(
        a.goal === "definicion" || a.goal === "mantenimiento"
          ? "torso-pierna-5"
          : "ppl-5",
      ),
    );
  } else {
    plan = clone(findTemplate("ppl-5"));
    const enfoque = clone(findTemplate("torso-pierna-5")).days[4];
    plan.days.push(enfoque);
    plan.days.forEach((d, i) => {
      d.weekday = i + 1;
    });
    notes.push("Con 6 días sumamos un día de enfoque para brazos y hombros.");
  }

  plan.goal = a.goal;
  plan.name = "Plan del asesor";

  if (a.experience === "principiante") {
    applySwaps(plan, [
      ["Sentadilla sissy", "Extensiones de cuádriceps"],
      ["Fondos en paralelas", "Press en máquina"],
      ["Buenos días", "Hiperextensiones"],
      ["Dominadas", "Jalón al pecho"],
      ["Press militar con barra", "Press militar con mancuernas"],
    ]);
    for (const day of plan.days) {
      for (const ex of day.exercises) {
        ex[1] = Math.min(ex[1], 3);
        ex[3] = Math.max(ex[3], 2);
      }
    }
    notes.push(
      "Priorizamos la técnica: series moderadas y RIR 2-3, sin vivir al borde del fallo.",
    );
  }

  if (a.experience === "avanzado") {
    for (const day of plan.days)
      for (const ex of day.exercises) ex[3] = Math.max(0, ex[3] - 1);
    notes.push(
      "RIR más ajustados (0-1) en los básicos para estimular al máximo.",
    );
  }

  if (a.timePerSession === "corta") {
    for (const day of plan.days)
      if (day.exercises.length > 5) day.exercises = day.exercises.slice(0, 5);
    notes.push("Sesiones acotadas a 5 ejercicios para entrar en ~45 minutos.");
  }

  if (a.equipment === "casa") {
    applySwaps(plan, CASA_SWAPS);
    let removed = 0;
    for (const day of plan.days) {
      const before = day.exercises.length;
      day.exercises = day.exercises.filter((ex) =>
        CASA_ALLOWED.includes(equipmentOf(ex[0])),
      );
      removed += before - day.exercises.length;
    }
    dedupe(plan);
    notes.push(
      removed > 0
        ? `Adaptamos todo a mancuernas/peso corporal (${removed} ejercicios quedaron fuera por equipo).`
        : "Todo el plan quedó adaptado a entrenamiento en casa.",
    );
  }

  if (a.equipment === "basico") {
    applySwaps(plan, POLEA_SWAPS);
    for (const day of plan.days) {
      day.exercises = day.exercises.filter((ex) =>
        BASICO_ALLOWED.includes(equipmentOf(ex[0])),
      );
    }
    dedupe(plan);
    notes.push(
      "Reemplazamos los ejercicios de polea por equivalentes con barra y mancuernas.",
    );
  }

  if (a.limitations.includes("rodillas")) {
    applySwaps(plan, [
      ["Sentadilla libre", "Prensa 45"],
      ["Sentadilla sissy", "Extensiones de cuádriceps"],
      ["Zancadas", "Sentadilla hack"],
      ["Sentadilla búlgara", "Prensa 45"],
    ]);
    notes.push(
      "Cuidamos tus rodillas: menos ejercicios unilaterales de alto impacto.",
    );
  }
  if (a.limitations.includes("hombros")) {
    applySwaps(plan, [
      ["Press militar con barra", "Press en máquina"],
      ["Press Arnold", "Press militar con mancuernas"],
      ["Fondos en paralelas", "Press en máquina"],
    ]);
    notes.push("Evitamos posiciones comprometidas para el hombro.");
  }
  if (a.limitations.includes("espalda")) {
    applySwaps(plan, [
      ["Peso muerto", "Hip thrust"],
      ["Buenos días", "Hiperextensiones"],
      ["Peso muerto rumano", "Curl femoral sentado"],
    ]);
    notes.push("Reducimos la carga axial para proteger tu zona lumbar.");
  }

  return { plan, notes };
}
