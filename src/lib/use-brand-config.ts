import { useCallback, useEffect, useState } from "react";
import { DEFAULT_BRAND, type BrandConfig } from "./brand";

const KEY = "cun-creativo:brand";

export function useBrandConfig() {
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BrandConfig;
        setBrand({
          colors: { ...DEFAULT_BRAND.colors, ...parsed.colors },
          fonts: { ...DEFAULT_BRAND.fonts, ...parsed.fonts },
          logo: { ...DEFAULT_BRAND.logo, ...parsed.logo },
          grid: { ...DEFAULT_BRAND.grid, ...parsed.grid },
          type: { ...DEFAULT_BRAND.type, ...parsed.type },
        });
      }
    } catch {
      /* valores por defecto */
    }
  }, []);

  const update = useCallback((next: BrandConfig) => {
    setBrand(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const reset = useCallback(() => {
    setBrand(DEFAULT_BRAND);
    window.localStorage.removeItem(KEY);
  }, []);

  return { brand, update, reset };
}
