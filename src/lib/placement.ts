/**
 * Modelo de ubicación libre: encuadre de la fotografía de fondo y elementos
 * gráficos (PNG con transparencia) que se agregan encima y se mueven.
 *
 * Todas las coordenadas son fracciones del lienzo, así que un elemento queda
 * en el mismo lugar relativo en Cuadrado, Story y Banner.
 */

export type PhotoFrame = {
  /** objectPosition horizontal, 0–100 % */
  x: number;
  /** objectPosition vertical, 0–100 % */
  y: number;
  /** zoom, 1 = sin acercar */
  scale: number;
  /** opacidad de la foto sobre el fondo (0 transparente – 1 opaca) */
  opacity: number;
  /** fuerza del degradado oscuro para legibilidad del texto (0–1) */
  scrim: number;
};

export const DEFAULT_PHOTO_FRAME: PhotoFrame = { x: 50, y: 50, scale: 1, opacity: 1, scrim: 1 };

export type PlacedElement = {
  id: string;
  assetId: string;
  /** centro X como fracción del ancho del lienzo (0–1) */
  x: number;
  /** centro Y como fracción del alto del lienzo (0–1) */
  y: number;
  /** ancho como fracción del ancho del lienzo (0–1) */
  w: number;
  /** rotación en grados */
  rot: number;
  /** opacidad (0 transparente – 1 opaco) */
  opacity: number;
};

/** Elemento con la URL de su asset ya resuelta, para dibujar en el lienzo */
export type ResolvedElement = PlacedElement & { url: string | null };

export function makeElement(assetId: string): PlacedElement {
  return { id: crypto.randomUUID(), assetId, x: 0.5, y: 0.42, w: 0.44, rot: 0, opacity: 1 };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
