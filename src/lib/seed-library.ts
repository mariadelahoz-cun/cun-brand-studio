/**
 * Semilla de bibliotecas curadas: assets pre-aprobados por diseño para que
 * el equipo de mercadeo pueda armar campañas desde el primer ingreso.
 *
 * Es idempotente: solo agrega la semilla cuyo nombre aún no está en la
 * biblioteca, así que sirve tanto en el primer ingreso como al aparecer
 * semillas nuevas en una versión posterior.
 */
import { useEffect, useRef } from "react";
import type { AssetCategory, MediaAsset } from "./media-library";

import fotoCampus from "@/assets/fondo-campus.jpg";
import logoCun from "@/assets/logo-cun.png";
import divergente from "@/assets/divergente.png";

type Seed = { url: string; name: string; category: AssetCategory; tag: string };

const SEEDS: Seed[] = [
  { url: fotoCampus, name: "campus-bogota.jpg", category: "foto", tag: "Uso general" },
  { url: logoCun, name: "cun-color.png", category: "logo", tag: "Uso general" },
  { url: divergente, name: "lockup-divergente.png", category: "elemento", tag: "Campaña" },
];

type AddFromUrl = (
  url: string,
  name: string,
  category: AssetCategory,
  tag: string,
  approved?: boolean,
) => Promise<unknown>;

export function useSeedLibrary(assets: MediaAsset[], addFromUrl: AddFromUrl, ready = true) {
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current || typeof window === "undefined") return;
    const missing = SEEDS.filter((s) => !assets.some((a) => a.name === s.name));
    if (missing.length === 0) {
      done.current = true;
      return;
    }
    done.current = true;
    (async () => {
      for (const seed of missing) {
        try {
          await addFromUrl(seed.url, seed.name, seed.category, seed.tag, true);
        } catch {
          done.current = false; // reintenta en el próximo render
        }
      }
    })();
  }, [assets, addFromUrl, ready]);
}
