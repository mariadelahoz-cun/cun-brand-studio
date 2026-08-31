/**
 * Fondos de campaña que vienen precargados con la app (imágenes del template
 * "Encendidos"). Son assets empaquetados: se referencian por URL directa, así
 * que funcionan aunque el navegador bloquee IndexedDB/localStorage (p. ej. en
 * un iframe de vista previa).
 *
 * En `campaign.style.bgImageId` se guardan con el prefijo `preset:`.
 */
import auroraVerde from "@/assets/backgrounds/aurora-verde.jpg";
import ondasMarino from "@/assets/backgrounds/ondas-marino.jpg";
import matrizNaranja from "@/assets/backgrounds/matriz-naranja.jpg";
import datosMorado from "@/assets/backgrounds/datos-morado.jpg";
import circuitoAzul from "@/assets/backgrounds/circuito-azul.jpg";
import mallaMagenta from "@/assets/backgrounds/malla-magenta.jpg";
import globoNaranja from "@/assets/backgrounds/globo-naranja.jpg";

export type BgPreset = { id: string; name: string; url: string };

export const BG_PRESET_PREFIX = "preset:";

export const BG_PRESETS: BgPreset[] = [
  { id: "preset:aurora-verde", name: "Aurora verde", url: auroraVerde },
  { id: "preset:ondas-marino", name: "Ondas azul marino", url: ondasMarino },
  { id: "preset:circuito-azul", name: "Circuito azul", url: circuitoAzul },
  { id: "preset:datos-morado", name: "Datos morado", url: datosMorado },
  { id: "preset:malla-magenta", name: "Malla magenta", url: mallaMagenta },
  { id: "preset:matriz-naranja", name: "Matriz naranja", url: matrizNaranja },
  { id: "preset:globo-naranja", name: "Globo naranja", url: globoNaranja },
];

export function isBgPreset(id: string | null): id is string {
  return typeof id === "string" && id.startsWith(BG_PRESET_PREFIX);
}

export function bgPresetUrl(id: string | null): string | null {
  if (!isBgPreset(id)) return null;
  return BG_PRESETS.find((p) => p.id === id)?.url ?? null;
}
