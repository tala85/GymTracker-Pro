import { useRef, useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Button } from '../ui/Button'

interface PhotoUploaderProps {
  onDataUrl: (dataUrl: string) => void
  currentPreview?: string | null
}

async function compressFile(file: File, maxSide = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function PhotoUploader({ onDataUrl, currentPreview }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'camera' | 'file'>('camera')
  const [loading, setLoading] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setLoading(true)
    try {
      const dataUrl = await compressFile(file)
      onDataUrl(dataUrl)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {currentPreview ? (
        <div className="relative">
          <img src={currentPreview} alt="Preview" className="aspect-square w-full rounded-lg object-cover" />
          <button
            onClick={() => onDataUrl('')}
            aria-label="Quitar foto"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setMode('camera')
              setTimeout(() => inputRef.current?.click(), 50)
            }}
          >
            <Camera size={16} /> Sacar foto
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setMode('file')
              setTimeout(() => inputRef.current?.click(), 50)
            }}
          >
            <Upload size={16} /> Elegir archivo
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={mode === 'camera' ? 'image/*' : 'image/*'}
        capture={mode === 'camera' ? 'environment' : undefined}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {loading && <p className="text-center text-xs text-gray-500">Procesando imagen…</p>}
    </div>
  )
}