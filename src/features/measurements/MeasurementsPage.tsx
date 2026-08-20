import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMeasurementStore } from "../../stores/measurementStore";
import { useAuthStore } from "../../stores/authStore";
import { measurementFormSchema } from "../../lib/validators";
import { calculateBmi, formatDateEs } from "../../utils/helpers";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

const METRICS: { key: string; label: string }[] = [
  { key: "weightKg", label: "Peso (kg)" },
  { key: "bmi", label: "IMC (calculado)" },
  { key: "waistCm", label: "Cintura (cm)" },
  { key: "chestCm", label: "Pecho (cm)" },
  { key: "bicepsCm", label: "Bíceps (cm)" },
  { key: "thighCm", label: "Muslo (cm)" },
];

const OPTIONAL_FIELDS: { key: string; label: string }[] = [
  { key: "waistCm", label: "Cintura (cm)" },
  { key: "hipsCm", label: "Cadera (cm)" },
  { key: "chestCm", label: "Pecho (cm)" },
  { key: "bicepsCm", label: "Bíceps (cm)" },
  { key: "thighCm", label: "Muslo (cm)" },
];

const SELECT_CLASS =
  "rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white";

export function MeasurementsPage() {
  const measurements = useMeasurementStore((state) => state.measurements);
  const loaded = useMeasurementStore((state) => state.loaded);
  const load = useMeasurementStore((state) => state.load);
  const add = useMeasurementStore((state) => state.add);
  const remove = useMeasurementStore((state) => state.remove);
  const profile = useAuthStore((state) => state.profile);

  const [showForm, setShowForm] = useState(false);
  const [metric, setMetric] = useState("weightKg");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, [load]);

  const num = (v: string | undefined) =>
    v && v.trim() !== "" ? Number(v) : undefined;

  const chartData = useMemo(() => {
    return [...measurements]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => {
        let value: number | undefined;
        if (metric === "bmi") {
          value = m.heightCm ? calculateBmi(m.weightKg, m.heightCm) : undefined;
        } else {
          value = m[metric as keyof typeof m] as number | undefined;
        }
        return { label: formatDateEs(m.date), value };
      })
      .filter((point) => point.value !== undefined && point.value !== null);
  }, [measurements, metric]);

  const latest = measurements[0];
  const previous = measurements[1];

  const heightForBmi = num(height) ?? profile?.heightCm;
  const liveBmi =
    weight.trim() !== "" && heightForBmi
      ? calculateBmi(Number(weight), heightForBmi)
      : null;

  const submit = async () => {
    if (!weight.trim()) {
      setErrors({ weightKg: "El peso es obligatorio" });
      return;
    }
    const payload = {
      date,
      weightKg: Number(weight),
      heightCm: heightForBmi,
      waistCm: num(values.waistCm),
      hipsCm: num(values.hipsCm),
      chestCm: num(values.chestCm),
      bicepsCm: num(values.bicepsCm),
      thighCm: num(values.thighCm),
      notes: notes.trim() || undefined,
    };
    const result = measurementFormSchema.safeParse(payload);
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) {
        map[String(issue.path[0])] = issue.message;
      }
      setErrors(map);
      return;
    }
    await add(payload);
    toast.success("Medición guardada");
    setShowForm(false);
    setWeight("");
    setValues({});
    setNotes("");
    setErrors({});
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Medidas</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Registrar
        </Button>
      </div>

      {loaded && measurements.length === 0 && (
        <Card className="text-center">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Registrá tu peso y medidas para ver tu evolución en gráficos.
          </p>
          <Button onClick={() => setShowForm(true)}>Primera medición</Button>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card className="flex flex-col gap-3">
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
            className={SELECT_CLASS}
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#64748b" />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10 }}
                stroke="#64748b"
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {latest && previous && (
        <Card className="flex flex-col gap-2">
          <h2 className="text-sm font-bold">
            Último cambio ({formatDateEs(previous.date)} →{" "}
            {formatDateEs(latest.date)})
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {latest.weightKg !== previous.weightKg && (
              <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700">
                Peso: {latest.weightKg > previous.weightKg ? "+" : ""}
                {(latest.weightKg - previous.weightKg).toFixed(1)} kg
              </span>
            )}
            {latest.waistCm !== undefined &&
              previous.waistCm !== undefined &&
              latest.waistCm !== previous.waistCm && (
                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700">
                  Cintura: {latest.waistCm > previous.waistCm ? "+" : ""}
                  {(latest.waistCm - previous.waistCm).toFixed(1)} cm
                </span>
              )}
            {latest.bicepsCm !== undefined &&
              previous.bicepsCm !== undefined &&
              latest.bicepsCm !== previous.bicepsCm && (
                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-700">
                  Bíceps: {latest.bicepsCm > previous.bicepsCm ? "+" : ""}
                  {(latest.bicepsCm - previous.bicepsCm).toFixed(1)} cm
                </span>
              )}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {measurements.map((m) => {
          const bmi = m.heightCm ? calculateBmi(m.weightKg, m.heightCm) : null;
          return (
            <Card key={m.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold">{formatDateEs(m.date)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {m.weightKg} kg{bmi !== null && ` · IMC ${bmi}`}
                  {m.waistCm !== undefined && ` · Cintura ${m.waistCm} cm`}
                  {m.bicepsCm !== undefined && ` · Bíceps ${m.bicepsCm} cm`}
                </p>
              </div>
              <button
                onClick={() => remove(m.id)}
                aria-label="Eliminar medición"
                className="text-red-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          );
        })}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Nueva medición"
      >
        <div className="flex flex-col gap-3">
          <Input
            label="Fecha"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <Input
            label="Peso (kg) *"
            type="number"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            error={errors.weightKg}
          />
          <Input
            label="Altura (cm) - opcional"
            type="number"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            placeholder={
              profile?.heightCm
                ? `Usa ${profile.heightCm} si dejás vacío`
                : undefined
            }
          />
          {liveBmi !== null && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-500">
              IMC calculado: {liveBmi}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {OPTIONAL_FIELDS.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                type="number"
                value={values[field.key] ?? ""}
                onChange={(event) =>
                  setValues({ ...values, [field.key]: event.target.value })
                }
                error={errors[field.key]}
              />
            ))}
          </div>
          <Input
            label="Notas"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <Button onClick={submit}>Guardar medición</Button>
        </div>
      </Modal>
    </div>
  );
}
