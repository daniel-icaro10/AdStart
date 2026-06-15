"use client";

import * as React from "react";
import { Loader2, ImagePlus, X } from "lucide-react";

/** Lê um arquivo de imagem e devolve um data URL JPEG redimensionado (leve). */
export async function fileToResizedDataURL(
  file: File,
  max = 1000,
  quality = 0.7,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Uploader de até N imagens com preview (resize no navegador). */
export function ImageUploader({
  value,
  onChange,
  max = 3,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const [busy, setBusy] = React.useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const remaining = max - value.length;
    const picked = Array.from(files).slice(0, Math.max(0, remaining));
    const urls: string[] = [];
    for (const f of picked) {
      try {
        urls.push(await fileToResizedDataURL(f));
      } catch {
        // ignora arquivo inválido
      }
    }
    onChange([...value, ...urls].slice(0, max));
    setBusy(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div
            key={i}
            className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remover imagem"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded bg-black/60 p-0.5 text-white hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-[11px] text-muted-foreground transition-colors hover:bg-accent">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            Adicionar
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {value.length}/{max} imagens
      </p>
    </div>
  );
}
