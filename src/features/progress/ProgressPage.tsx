import { useState } from "react";
import { MeasurementsPage } from "../measurements/MeasurementsPage";
import { HistoryTab } from "./HistoryTab";
import { PhotosPage } from "../photos/PhotosPage";
import { WellnessPage } from "../wellness/WellnessPage";

export function ProgressPage() {
  const [tab, setTab] = useState<
    "bienestar" | "medidas" | "entrenamientos" | "fotos"
  >("bienestar");

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "bg-emerald-500 text-white"
        : "bg-slate-100 text-gray-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-gray-300"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab("medidas")}
          className={tabClass(tab === "medidas")}
        >
          Medidas
        </button>
        <button
          onClick={() => setTab("entrenamientos")}
          className={tabClass(tab === "entrenamientos")}
        >
          Entrenamientos
        </button>
        <button
          onClick={() => setTab("fotos")}
          className={tabClass(tab === "fotos")}
        >
          Fotos
        </button>
        <button
          onClick={() => setTab("bienestar")}
          className={tabClass(tab === "bienestar")}
        >
          Bienestar
        </button>
      </div>

      {tab === "medidas" && <MeasurementsPage />}
      {tab === "entrenamientos" && <HistoryTab />}
      {tab === "fotos" && <PhotosPage />}
      {tab === "bienestar" && <WellnessPage />}
    </div>
  );
}
