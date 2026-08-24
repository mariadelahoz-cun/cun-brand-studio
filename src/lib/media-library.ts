/**
 * Biblioteca de medios persistida en el navegador (MVP sin login).
 * Al activar Lovable Cloud, este módulo se reemplaza por almacenamiento
 * asociado al usuario/organización sin tocar los componentes.
 */
import { useCallback, useEffect, useState } from "react";

export type AssetCategory = "logo" | "avatar" | "apoyo";

export type MediaAsset = {
  id: string;
  name: string;
  category: AssetCategory;
  dataUrl: string;
  createdAt: number;
};

const KEY = "cun-creativo:media";

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  logo: "Logos institucionales",
  avatar: "Avatares / personas",
  apoyo: "Imágenes de apoyo",
};

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
    async (files: File[], category: AssetCategory) => {
      const created: MediaAsset[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        created.push({
          id: crypto.randomUUID(),
          name: file.name,
          category,
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
    async (url: string, name: string, category: AssetCategory) => {
      const res = await fetch(url);
      const blob = await res.blob();
      const dataUrl = await readFileAsDataUrl(new File([blob], name, { type: blob.type }));
      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        name,
        category,
        dataUrl,
        createdAt: Date.now(),
      };
      persist([...read(), asset]);
      return asset;
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => persist(read().filter((a) => a.id !== id)),
    [persist],
  );

  return { assets, addFiles, addFromUrl, remove };
}
