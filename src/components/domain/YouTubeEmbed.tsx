import { Play } from "lucide-react";
import { getYouTubeVideoId } from "../../utils/helpers";

interface YouTubeEmbedProps {
  url: string;
  title: string;
}

export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const videoId = getYouTubeVideoId(url);

  if (videoId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <a
      href={url || "https://www.youtube.com"}
      target="_blank"
      rel="noreferrer"
      className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 text-center"
    >
      <span className="flex h-12 w-16 items-center justify-center rounded-xl bg-red-600">
        <Play size={24} className="fill-white text-white" />
      </span>
      <p className="px-4 text-sm font-semibold text-white">
        Ver demostración en YouTube
      </p>
      <p className="px-4 text-xs text-gray-400">
        Se abre la búsqueda del ejercicio con videos de técnica correcta
      </p>
    </a>
  );
}
