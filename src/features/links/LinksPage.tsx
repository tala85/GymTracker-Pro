import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLinksStore } from '../../stores/linksStore'
import { LINK_CATEGORIES } from '../../data/links'
import { linkFormSchema } from '../../lib/validators'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

const SELECT_CLASS =
  'rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white'

export function LinksPage() {
  const links = useLinksStore((state) => state.links)
  const loaded = useLinksStore((state) => state.loaded)
  const load = useLinksStore((state) => state.load)
  const addCustom = useLinksStore((state) => state.addCustom)
  const toggleFavorite = useLinksStore((state) => state.toggleFavorite)
  const remove = useLinksStore((state) => state.remove)
  const resetSystem = useLinksStore((state) => state.resetSystem)

  const [category, setCategory] = useState('Todos')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [formCategory, setFormCategory] = useState(LINK_CATEGORIES[0])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () =>
      links
        .filter((l) => category === 'Todos' || l.category === category)
        .filter((l) => !onlyFavorites || l.isFavorite)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [links, category, onlyFavorites]
  )

  const submit = async () => {
    const result = linkFormSchema.safeParse({ title, url, category: formCategory })
    if (!result.success) {
      const map: Record<string, string> = {}
      for (const issue of result.error.issues) {
        map[String(issue.path[0])] = issue.message
      }
      setErrors(map)
      return
    }
    await addCustom({ title: title.trim(), url: url.trim(), category: formCategory })
    toast.success('Enlace agregado')
    setShowForm(false)
    setTitle('')
    setUrl('')
    setErrors({})
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Enlaces de interés</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await resetSystem()
              toast.success('Enlaces sugeridos restaurados')
            }}
          >
            Restaurar
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Nuevo
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <select value={category} onChange={(event) => setCategory(event.target.value)} className={SELECT_CLASS}>
          <option value="Todos">Todos</option>
          {LINK_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          aria-label="Ver favoritos"
          className={`rounded-lg border px-3 py-2 text-sm ${
            onlyFavorites
              ? 'border-amber-400 bg-amber-400/10 text-amber-400'
              : 'border-gray-300 text-gray-500 dark:border-slate-600'
          }`}
        >
          <Star size={16} className={onlyFavorites ? 'fill-amber-400' : ''} />
        </button>
      </div>

      {!loaded && <p className="text-sm text-gray-500">Cargando…</p>}

      {loaded && filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">No hay enlaces en esta categoría.</p>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((l) => (
          <Card key={l.id} className="flex items-center gap-2">
            <a href={l.url} target="_blank" rel="noreferrer" className="flex flex-1 items-center gap-2">
              <ExternalLink size={15} className="shrink-0 text-emerald-500" />
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{l.title}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{l.category}</span>
              </span>
            </a>
            <button
              onClick={() => toggleFavorite(l.id)}
              aria-label="Favorito"
              className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Star size={16} className={l.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400'} />
            </button>
            <button
              onClick={() => remove(l.id)}
              aria-label="Eliminar enlace"
              className="rounded p-2 text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Trash2 size={16} />
            </button>
          </Card>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo enlace">
        <div className="flex flex-col gap-3">
          <Input
            label="Título"
            placeholder="Ej: Guía de sentadilla"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            error={errors.title}
          />
          <Input
            label="URL"
            placeholder="https://…"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            error={errors.url}
          />
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Categoría
            <select value={formCategory} onChange={(event) => setFormCategory(event.target.value)} className={SELECT_CLASS}>
              {LINK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <Button onClick={submit}>Guardar enlace</Button>
        </div>
      </Modal>
    </div>
  )
}