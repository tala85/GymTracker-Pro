import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  FileDown,
  Moon,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useUiStore } from "../../stores/uiStore";
import { useAuthStore } from "../../stores/authStore";
import { useRoutineStore } from "../../stores/routineStore";
import { useExerciseStore } from "../../stores/exerciseStore";
import { exportAllData, importAllData } from "../../utils/backup";
import {
  downloadCloudBackup,
  uploadCloudBackup,
} from "../../utils/cloudBackup";
import { exportRoutineToPdf } from "../../utils/pdf";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";

const SELECT_CLASS =
  "rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white";

export function SettingsPage() {
  const navigate = useNavigate();
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const mode = useAuthStore((state) => state.mode);
  const email = useAuthStore((state) => state.email);
  const signOut = useAuthStore((state) => state.signOut);
  const routines = useRoutineStore((state) => state.routines);
  const daysByRoutine = useRoutineStore((state) => state.daysByRoutine);
  const exercisesByDay = useRoutineStore((state) => state.exercisesByDay);
  const library = useExerciseStore((state) => state.exercises);
  const { canInstall, installed, install } = useInstallPrompt();

  const fileRef = useRef<HTMLInputElement>(null);
  const [showWipe, setShowWipe] = useState(false);
  const [pdfRoutineId, setPdfRoutineId] = useState("");

  const activeRoutine = routines.find((r) => r.isActive);
  const selectedForPdf = routines.find(
    (r) => r.id === (pdfRoutineId || activeRoutine?.id),
  );

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      await importAllData(text);
      toast.success("Respaldo importado. Recargando…");
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast.error("El archivo no es un respaldo válido de GymTracker");
    }
  };

  const handleCloudUpload = async () => {
    try {
      await uploadCloudBackup();
      toast.success("Respaldo subido a la nube");
    } catch {
      toast.error("No se pudo subir el respaldo a la nube");
    }
  };

  const handleCloudRestore = async () => {
    try {
      const json = await downloadCloudBackup();
      if (!json) {
        toast.error("No hay respaldos en la nube todavía");
        return;
      }
      await importAllData(json);
      toast.success("Restaurado de la nube. Recargando…");
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast.error("No se pudo descargar el respaldo de la nube");
    }
  };

  const wipeDevice = async () => {
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
    localStorage.clear();
    toast.success("Datos locales borrados. Recargando…");
    setTimeout(() => window.location.reload(), 1200);
  };

  const exportPdf = () => {
    if (!selectedForPdf) {
      toast.error("Primero creá una rutina");
      return;
    }
    exportRoutineToPdf(
      selectedForPdf,
      daysByRoutine[selectedForPdf.id] ?? [],
      exercisesByDay,
      library,
    );
    toast.success("PDF descargado");
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Configuración</h1>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-bold">Cuenta</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {mode === "cloud"
            ? `Conectado: ${email}`
            : "Modo local: tus datos viven solo en este dispositivo."}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/perfil")}>
            <UserRound size={16} /> Perfil
          </Button>
          <Button variant="ghost" onClick={() => signOut()}>
            Cerrar sesión
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Smartphone size={16} className="text-emerald-500" /> Aplicación
        </h2>
        {installed ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ¡GymTracker Pro ya está instalada en este dispositivo!
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Instalá la app para abrirla con ícono propio, sin barra de
              navegador y con mejor experiencia offline.
            </p>
            {canInstall ? (
              <Button variant="secondary" onClick={() => install()}>
                <Download size={16} /> Instalar app
              </Button>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Si no aparece el botón: en Chrome de escritorio buscá el ícono
                de monitor con una flecha en la barra de direcciones (o menú ⋮ →
                "Instalar GymTracker Pro"); en el celular usá menú ⋮ → "Agregar
                a pantalla de inicio / Instalar app".
              </p>
            )}
          </>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-bold">Apariencia</h2>
        <Button variant="secondary" onClick={() => toggleTheme()}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-bold">Tus datos</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              await exportAllData();
              toast.success("Respaldo descargado");
            }}
          >
            <Download size={16} /> Exportar archivo
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Importar archivo
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleImport(file);
            event.target.value = "";
          }}
        />
        {mode === "cloud" && (
          <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-3 dark:border-slate-700">
            <Button variant="secondary" onClick={handleCloudUpload}>
              <Upload size={16} /> Subir a la nube
            </Button>
            <Button variant="secondary" onClick={handleCloudRestore}>
              <Download size={16} /> Restaurar de la nube
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Exportar rutina a PDF
          </label>
          <div className="flex gap-2">
            <select
              value={selectedForPdf?.id ?? ""}
              onChange={(event) => setPdfRoutineId(event.target.value)}
              className={SELECT_CLASS}
            >
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={exportPdf}>
              <FileDown size={16} /> PDF
            </Button>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 border border-red-500/30">
        <h2 className="text-sm font-bold text-red-500">Zona peligrosa</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Borra rutinas, entrenamientos, medidas y enlaces guardados en este
          dispositivo.
          {mode === "cloud" &&
            " Tu cuenta y tu respaldo en la nube no se tocan."}
        </p>
        <Button variant="danger" onClick={() => setShowWipe(true)}>
          <Trash2 size={16} /> Borrar datos del dispositivo
        </Button>
      </Card>

      <p className="text-center text-xs text-gray-400">
        GymTracker Pro · versión 1.0
      </p>

      <Modal
        open={showWipe}
        onClose={() => setShowWipe(false)}
        title="Borrar datos locales"
      >
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Esta acción elimina TODO lo guardado en este dispositivo y no se puede
          deshacer. ¿Querés continuar?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowWipe(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => wipeDevice()}>
            Borrar todo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
