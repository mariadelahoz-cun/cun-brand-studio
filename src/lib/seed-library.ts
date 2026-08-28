/**
 * Semilla de bibliotecas curadas: assets pre-aprobados por diseño para que
 * el equipo de mercadeo pueda armar campañas desde el primer ingreso.
 */
import { useEffect } from "react";
import type { AssetCategory } from "./media-library";

import fotoCampus from "@/assets/fondo-campus.jpg";
import papelRasgado from "@/assets/analogue/papel-rasgado.png";
import maskingTape from "@/assets/analogue/masking-tape.png";
import marcador from "@/assets/analogue/marcador.png";
import resaltador from "@/assets/analogue/resaltador.png";
import graficaOjos from "@/assets/brainrot/grafica-ojos.png";
import laptopOjos from "@/assets/brainrot/laptop-ojos.png";

const FLAG = "cun-creativo:library-seeded:v1";

type Seed = { url: string; name: string; category: AssetCategory; tag: string };

const SEEDS: Seed[] = [
  { url: fotoCampus, name: "campus-bogota.jpg", category: "foto", tag: "Uso general" },
  { url: papelRasgado, name: "papel-rasgado.png", category: "analogue", tag: "Uso general" },
  { url: maskingTape, name: "masking-tape.png", category: "analogue", tag: "Uso general" },
  { url: marcador, name: "marcador.png", category: "analogue", tag: "Uso general" },
  { url: resaltador, name: "resaltador.png", category: "analogue", tag: "Uso general" },
  { url: graficaOjos, name: "grafica-ojos.png", category: "brainrot", tag: "Administración" },
  { url: laptopOjos, name: "laptop-ojos.png", category: "brainrot", tag: "Tecnología" },
];

type AddFromUrl = (
  url: string,
  name: string,
  category: AssetCategory,
  tag: string,
  approved?: boolean,
) => Promise<unknown>;

export function useSeedLibrary(addFromUrl: AddFromUrl) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(FLAG)) return;
    window.localStorage.setItem(FLAG, "1");
    (async () => {
      for (const seed of SEEDS) {
        try {
          await addFromUrl(seed.url, seed.name, seed.category, seed.tag, true);
        } catch {
          /* la biblioteca queda disponible desde el panel de administración */
        }
      }
    })();
  }, [addFromUrl]);
}
