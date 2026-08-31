/**
 * Bibliotecas de assets curadas. Diseño sube y aprueba desde el panel de
 * administración; mercadeo solo puede seleccionar assets aprobados.
 * Persistencia local en IndexedDB (localStorage se quedaba sin espacio con
 * pocas imágenes). Al conectar un backend compartido este módulo se reemplaza
 * sin tocar los componentes.
 */
import { useCallback, useEffect, useState } from "react";
import { idbDelete, idbGetAll, idbPut } from "./idb";

export type AssetCategory = "foto" | "fondo" | "logo" | "elemento";

export type MediaAsset = {
  id: string;
  name: string;
  category: AssetCategory;
  /** Etiqueta de programa, ciudad, campaña o uso general */
  tag: string;
  approved: boolean;
  dataUrl: string;
  createdAt: number;
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  foto: "Fotografías",
  fondo: "Fondos",
  logo: "Logos institucionales",
  elemento: "Elementos gráficos",
};

export const CATEGORY_RULES: Record<AssetCategory, string> = {
  foto: "Fotografía publicitaria fotorrealista, persona real sobre fondo oscuro con luz de neón. Se coloca a sangre detrás del texto y se puede reposicionar.",
  fondo:
    "Imagen que se usa a sangre como fondo de la pieza (degradados, texturas, tramas oscuras y saturadas). Alternativa al color sólido.",
  logo: "Solo versiones aprobadas (blanco / color) para la franja institucional. Reemplaza al logo CUN por defecto.",
  elemento:
    "PNG con transparencia que se agrega sobre la pieza y se mueve libremente: lockup ¿Piensas divergente?, stickers, sellos, formas de la campaña.",
};

export const ASSET_TAGS = ["Uso general", "Programa", "Ciudad", "Campaña"];

/** Categorías con transparencia: se guardan como PNG */
const KEEP_PNG: AssetCategory[] = ["logo", "elemento"];
/** Lado mayor máximo al guardar */
const MAX_DIM: Record<AssetCategory, number> = {
  foto: 1600,
  fondo: 1600,
  logo: 1000,
  elemento: 1200,
};

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = src;
  });
}

/** Reescala si hace falta y comprime, para que quepa en IndexedDB sin problema */
async function normalizeImage(dataUrl: string, category: AssetCategory): Promise<string> {
  try {
    const img = await loadImage(dataUrl);
    const max = MAX_DIM[category];
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const keepPng = KEEP_PNG.includes(category);
    // Sin reescalado y ya es liviana: se deja igual
    if (scale === 1 && dataUrl.length < 900_000) return dataUrl;

    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    return keepPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return dataUrl;
  }
}

const LEGACY_KEY = "cun-creativo:media:v2";

/** Una sola vez: pasa lo que quedó en localStorage a IndexedDB */
async function migrateLegacy(): Promise<MediaAsset[]> {
  if (typeof window === "undefined") return [];
  let legacy: MediaAsset[] = [];
  try {
    legacy = JSON.parse(window.localStorage.getItem(LEGACY_KEY) ?? "[]") as MediaAsset[];
  } catch {
    legacy = [];
  }
  if (!legacy.length) return [];
  for (const asset of legacy) {
    try {
      await idbPut(asset);
    } catch {
      /* se ignora el asset que no entre */
    }
  }
  try {
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* noop */
  }
  return legacy;
}

export function useMediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      let list: MediaAsset[] = [];
      try {
        list = await idbGetAll<MediaAsset>();
      } catch {
        list = [];
      }
      if (list.length === 0) {
        const migrated = await migrateLegacy();
        if (migrated.length) list = migrated;
      }
      if (alive) {
        setAssets(list.sort((a, b) => a.createdAt - b.createdAt));
        setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const putAsset = useCallback(async (asset: MediaAsset) => {
    try {
      await idbPut(asset);
    } catch {
      /* IndexedDB bloqueado (p. ej. iframe): al menos queda en memoria esta sesión */
    }
    setAssets((prev) => {
      const rest = prev.filter((a) => a.id !== asset.id);
      return [...rest, asset].sort((a, b) => a.createdAt - b.createdAt);
    });
  }, []);

  const addFiles = useCallback(
    async (files: File[], category: AssetCategory, tag: string, approved = false) => {
      const created: MediaAsset[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const raw = await readFileAsDataUrl(file);
        const dataUrl = await normalizeImage(raw, category);
        const asset: MediaAsset = {
          id: crypto.randomUUID(),
          name: file.name,
          category,
          tag: tag || "Uso general",
          approved,
          dataUrl,
          createdAt: Date.now(),
        };
        await putAsset(asset);
        created.push(asset);
      }
      return created;
    },
    [putAsset],
  );

  const addFromUrl = useCallback(
    async (url: string, name: string, category: AssetCategory, tag: string, approved = true) => {
      const res = await fetch(url);
      const blob = await res.blob();
      const raw = await readFileAsDataUrl(new File([blob], name, { type: blob.type }));
      const dataUrl = await normalizeImage(raw, category);
      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        name,
        category,
        tag,
        approved,
        dataUrl,
        createdAt: Date.now(),
      };
      await putAsset(asset);
      return asset;
    },
    [putAsset],
  );

  const setApproval = useCallback(
    async (id: string, approved: boolean) => {
      const current = assets.find((a) => a.id === id);
      if (current) await putAsset({ ...current, approved });
    },
    [assets, putAsset],
  );

  const setTag = useCallback(
    async (id: string, tag: string) => {
      const current = assets.find((a) => a.id === id);
      if (current) await putAsset({ ...current, tag });
    },
    [assets, putAsset],
  );

  const remove = useCallback(async (id: string) => {
    try {
      await idbDelete(id);
    } catch {
      /* noop */
    }
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { assets, loaded, addFiles, addFromUrl, setApproval, setTag, remove };
}

export function approvedOf(assets: MediaAsset[], category: AssetCategory) {
  return assets.filter((a) => a.category === category && a.approved);
}
