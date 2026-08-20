import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePhotosStore } from '../../stores/photosStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { PhotoUploader } from '../../components/domain/PhotoUploader'

const VIEWS: { key: 'frontal' | 'espalda' | 'izquierda' | 'derecha' | 'otro'; label: string }[] = [
  { key: 'frontal', label: 'Frontal' },
  { key: 'espalda', label: 'Espalda' },
  { key: 'izquierda', label: 'Izquierda' },
  { key: 'derecha', label: 'Derecha' },
  { key: 'otro', label: 'Otro' },
]

const SELECT_CLASS =
  'rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white'

const viewLabel = (key: string) => VIEWS.find((v) => v.key === key)?.label ?? key

export function PhotosPage() {
  const photos = usePhotosStore((state) => state.photos)
  const loaded = usePhotosStore((state) => state.loaded)
  const load = usePhotosStore((state) => state.load)
  const add = usePhotosStore((state) => state.add)
  const remove = usePhotosStore((state) => state.remove)

  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [view, setView] = useState<(typeof VIEWS)[number]['key']>('frontal')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [dataUrl, setDataUrl] = useState('')

  const [filter, setFilter] = useState<string>('all')
  const [compareOpen, setCompareOpen] = useState(false)
  const [compareAId, setCompareAId] = useState('')
  const [compareBId, setCompareBId] = useState('')

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () => (filter === 'all' ? photos : photos.filter((p) => p.view === filter)),
    [photos, filter]
  )

  const compareA = photos.find((p) => p.id === compareAId)
  const compareB = photos.find((p) => p.id === compareBId)

  const submit = async () => {
    if (!dataUrl) {
      toast.error('Sacá o elegí una foto primero')
      return
    }
    await add({
      date,
      view,
      weightKg: weight.trim() !== '' ? Number(weight) : undefined,
      notes: notes.trim() || undefined,
      dataUrl,
    })
    toast.success('Foto guardada')
    setShowForm(false)
    setDataUrl('')
    setWeight('')
    setNotes('')
  }

  if (!loaded) {
    return <p className="text-sm text-gray-500">Cargando…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Fotos de progreso</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nueva
        </Button>
      </div>

      {photos.length === 0 && (
        <Card className="text-center">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Sacate fotos frontales, de espalda y de costado para comparar tu evolución.
          </p>
          <Button onClick={() => setShowForm(true)}>Primera foto</Button>
        </Card>
      )}

      {photos.length >= 2 && (
        <Button variant="secondary" onClick={() => setCompareOpen(true)}>
          Comparar dos fotos
        </Button>
      )}

      <select value={filter} onChange={(event) => setFilter(event.target.value)} className={SELECT_CLASS}>
        <option value="all">Todas las vistas</option>
        {VIEWS.map((v) => (
          <option key={v.key} value={v.key}>{v.label}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-2">
        {filtered.map((photo) => (
          <Card key={photo.id} className="flex flex-col gap-1 p-2">
            <img
              src={photo.dataUrl}
              alt={viewLabel(photo.view)}
              className="aspect-square w-full rounded-lg object-cover"
            />
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-xs font-semibold">{photo.date}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {viewLabel(photo.view)}
                  {photo.weightKg !== undefined && ` · ${photo.weightKg} kg`}
                </span>
              </div>
              <button
                onClick={() => remove(photo.id)}
                aria-label="Eliminar foto"
                className="text-red-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva foto">
        <div className="flex flex-col gap-3">
          <Input label="Fecha" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Vista
            <select
              value={view}
              onChange={(event) => setView(event.target.value as (typeof VIEWS)[number]['key'])}
              className={SELECT_CLASS}
            >
              {VIEWS.map((v) => (
                <option key={v.key} value={v.key}>{v.label}</option>
              ))}
            </select>
          </label>
          <Input
            label="Peso del día (kg) - opcional"
            type="number"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
          <PhotoUploader onDataUrl={setDataUrl} currentPreview={dataUrl || null} />
          <Input label="Notas (opcional)" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <Button onClick={submit}>Guardar foto</Button>
        </div>
      </Modal>

      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} title="Comparar fotos">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={compareAId}
              onChange={(event) => setCompareAId(event.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">Elegí la "antes"</option>
              {photos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.date} · {viewLabel(p.view)}
                </option>
              ))}
            </select>
            <select
              value={compareBId}
              onChange={(event) => setCompareBId(event.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">Elegí la "después"</option>
              {photos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.date} · {viewLabel(p.view)}
                </option>
              ))}
            </select>
          </div>
          {compareA && compareB && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <img src={compareA.dataUrl} alt="Antes" className="aspect-square w-full rounded-lg object-cover" />
                <p className="text-center text-xs text-gray-500">Antes · {compareA.date}</p>
              </div>
              <div className="flex flex-col gap-1">
                <img src={compareB.dataUrl} alt="Después" className="aspect-square w-full rounded-lg object-cover" />
                <p className="text-center text-xs text-gray-500">Después · {compareB.date}</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}