/**
 * Bibliotecas de assets curadas. Diseño sube y aprueba desde el panel de
 * administración; mercadeo solo puede seleccionar assets aprobados.
 * Persistencia local (MVP sin login); al activar Lovable Cloud este módulo
 * se reemplaza por almacenamiento compartido sin tocar los componentes.
 */
import { useCallback, useEffect, useState } from "react";

export type AssetCategory = "foto" | "brainrot" | "analogue" | "logo";

export type MediaAsset = {
  id: string;
  name: string;
  category: AssetCategory;
  /** Etiqueta de programa o uso general (obligatoria para Brainrot) */
  tag: string;
  approved: boolean;
  dataUrl: string;
  createdAt: number;
};

const KEY = "cun-creativo:media:v2";

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  foto: "Fotografías",
  brainrot: "Recursos Brainrot",
  analogue: "Texturas Analogue",
  logo: "Logos institucionales",
};

export const CATEGORY_RULES: Record<AssetCategory, string> = {
  foto: "Fotografía publicitaria fotorrealista colombiana, personas reales, escenario reconocible. Sin anime, 3D ni banco de imágenes genérico.",
  brainrot:
    "Objetos con ojos, gráficas que reaccionan, diagnósticos ridículos, stickers narrativos. Sin texto incrustado fuera de la lista blanca.",
  analogue:
    "Overlays PNG con transparencia: papel rasgado, masking tape, marcador, resaltador, fotocopia, impresión.",
  logo: "Solo versiones aprobadas (color, blanco, negro) para la franja institucional.",
};

export const BRAINROT_TAGS = [
  "Uso general",
  "Administración",
  "Ingeniería",
  "Diseño y comunicación",
  "Salud",
  "Tecnología",
];

function read(): MediaAsset[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as MediaAsset[];
  } catch {
    return [];
  }
}

function write(assets: MediaAsset[]) {
  window.localStorage.setItem(KEY, JSON.stringify(assets));
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function useMediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  useEffect(() => {
    setAssets(read());
  }, []);

  const persist = useCallback((next: MediaAsset[]) => {
    setAssets(next);
    write(next);
  }, []);

  const addFiles = useCallback(
    async (files: File[], category: AssetCategory, tag: string) => {
      const created: MediaAsset[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        created.push({
          id: crypto.randomUUID(),
          name: file.name,
          category,
          tag: tag || "Uso general",
          approved: false,
          dataUrl: await readFileAsDataUrl(file),
          createdAt: Date.now(),
        });
      }
      if (created.length) persist([...read(), ...created]);
      return created;
    },
    [persist],
  );

  const addFromUrl = useCallback(
    async (url: string, name: string, category: AssetCategory, tag: string, approved = true) => {
      const res = await fetch(url);
      const blob = await res.blob();
      const dataUrl = await readFileAsDataUrl(new File([blob], name, { type: blob.type }));
      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        name,
        category,
        tag,
        approved,
        dataUrl,
        createdAt: Date.now(),
      };
      persist([...read(), asset]);
      return asset;
    },
    [persist],
  );

  const setApproval = useCallback(
    (id: string, approved: boolean) =>
      persist(read().map((a) => (a.id === id ? { ...a, approved } : a))),
    [persist],
  );

  const setTag = useCallback(
    (id: string, tag: string) => persist(read().map((a) => (a.id === id ? { ...a, tag } : a))),
    [persist],
  );

  const remove = useCallback((id: string) => persist(read().filter((a) => a.id !== id)), [persist]);

  return { assets, addFiles, addFromUrl, setApproval, setTag, remove };
}

export function approvedOf(assets: MediaAsset[], category: AssetCategory) {
  return assets.filter((a) => a.category === category && a.approved);
}
