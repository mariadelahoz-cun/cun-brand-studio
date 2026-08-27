/**
 * Sistema de marca CUN + biblioteca de templates de campaña.
 *
 * Los templates son sets pre-diseñados por el equipo de diseño: cada uno trae
 * las tres variantes (Cuadrado, Story, Banner) con las mismas zonas fijas.
 * El usuario de mercadeo no puede mover zonas, ni cambiar tipografías/colores.
 */

export const BRAND = {
  green: "#84BD00",
  greenLight: "#C2E189",
  ink: "#12140F",
  paper: "#F4F1EA",
  white: "#FFFFFF",
  /** Titular y remate */
  fontDisplay: "'Knewave', system-ui, cursive",
  /** Programa, modalidad, SNIES, beneficio, CTA, microtextos */
  fontBody: "'Montserrat', system-ui, sans-serif",
  /** Margen de seguridad como fracción del lado menor */
  safeMarginRatio: 0.05,
} as const;

export type FormatId = "cuadrado" | "story" | "banner";

export type PieceFormat = {
  id: FormatId;
  label: string;
  slug: string;
  width: number;
  height: number;
};

export const FORMATS: Record<FormatId, PieceFormat> = {
  cuadrado: { id: "cuadrado", label: "Cuadrado", slug: "CUADRADO", width: 1080, height: 1080 },
  story: { id: "story", label: "Story", slug: "STORY", width: 1080, height: 1920 },
  banner: { id: "banner", label: "Banner", slug: "BANNER", width: 1020, height: 1080 },
};

export const FORMAT_ORDER: FormatId[] = ["cuadrado", "story", "banner"];

export type Rect = { x: number; y: number; w: number; h: number };

export type PieceLayout = {
  /** Fracciones 0-1 del lienzo */
  photo: Rect;
  brainrot: Rect;
  /** Tres zonas de textura Analogue, en orden de aplicación */
  textures: [Rect, Rect, Rect];
  text: Rect;
  /** Alto de la franja institucional inferior (0.12 – 0.18) */
  franjaRatio: number;
  align: "left" | "center";
};

export type CampaignTemplate = {
  id: string;
  name: string;
  description: string;
  palette: {
    canvas: string;
    panel: string;
    title: string;
    remate: string;
    body: string;
    ctaBg: string;
    ctaText: string;
    franja: string;
  };
  layout: (format: FormatId) => PieceLayout;
};

/** Fracción de alto que ocupa la fotografía según el formato */
const photoHeight: Record<FormatId, number> = {
  cuadrado: 0.52,
  story: 0.6,
  banner: 0.46,
};

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "bloque-verde",
    name: "Bloque Verde",
    description: "Foto arriba a sangre, bloque verde de copy abajo, franja institucional al pie.",
    palette: {
      canvas: BRAND.green,
      panel: BRAND.green,
      title: BRAND.white,
      remate: BRAND.ink,
      body: BRAND.white,
      ctaBg: BRAND.ink,
      ctaText: BRAND.greenLight,
      franja: BRAND.ink,
    },
    layout: (format) => {
      const ph = photoHeight[format];
      const franja = 0.14;
      return {
        photo: { x: 0, y: 0, w: 1, h: ph },
        brainrot: { x: 0.62, y: ph - 0.16, w: 0.3, h: 0.24 },
        textures: [
          { x: -0.04, y: ph - 0.05, w: 0.62, h: 0.1 },
          { x: 0.05, y: ph + 0.06, w: 0.5, h: 0.07 },
          { x: 0.3, y: 1 - franja - 0.12, w: 0.66, h: 0.1 },
        ],
        text: { x: 0.06, y: ph + 0.04, w: 0.88, h: 1 - ph - franja - 0.07 },
        franjaRatio: franja,
        align: "left",
      };
    },
  },
  {
    id: "recorte-oscuro",
    name: "Recorte Oscuro",
    description: "Foto a sangre completa con panel oscuro de copy y sticker Brainrot superior.",
    palette: {
      canvas: BRAND.ink,
      panel: BRAND.ink,
      title: BRAND.greenLight,
      remate: BRAND.white,
      body: BRAND.white,
      ctaBg: BRAND.green,
      ctaText: BRAND.ink,
      franja: BRAND.green,
    },
    layout: (format) => {
      const ph = photoHeight[format] + 0.12;
      const franja = 0.16;
      return {
        photo: { x: 0, y: 0, w: 1, h: ph },
        brainrot: { x: 0.06, y: 0.05, w: 0.26, h: 0.2 },
        textures: [
          { x: 0.4, y: 0.04, w: 0.6, h: 0.12 },
          { x: -0.06, y: ph - 0.08, w: 0.7, h: 0.12 },
          { x: 0.24, y: 1 - franja - 0.1, w: 0.7, h: 0.09 },
        ],
        text: { x: 0.07, y: ph + 0.02, w: 0.86, h: 1 - ph - franja - 0.05 },
        franjaRatio: franja,
        align: "left",
      };
    },
  },
  {
    id: "papel-analogo",
    name: "Papel Análogo",
    description: "Fondo papel, foto recortada con cinta, copy centrado y franja institucional.",
    palette: {
      canvas: BRAND.paper,
      panel: BRAND.paper,
      title: BRAND.ink,
      remate: BRAND.green,
      body: BRAND.ink,
      ctaBg: BRAND.green,
      ctaText: BRAND.white,
      franja: BRAND.ink,
    },
    layout: (format) => {
      const ph = photoHeight[format] - 0.08;
      const franja = 0.12;
      return {
        photo: { x: 0.08, y: 0.07, w: 0.84, h: ph },
        brainrot: { x: 0.04, y: ph - 0.02, w: 0.24, h: 0.18 },
        textures: [
          { x: 0.02, y: 0.03, w: 0.4, h: 0.08 },
          { x: 0.55, y: ph + 0.03, w: 0.45, h: 0.08 },
          { x: 0.1, y: 1 - franja - 0.13, w: 0.8, h: 0.1 },
        ],
        text: { x: 0.09, y: ph + 0.11, w: 0.82, h: 1 - ph - franja - 0.16 },
        franjaRatio: franja,
        align: "center",
      };
    },
  },
];

export function templateById(id: string | null) {
  return CAMPAIGN_TEMPLATES.find((t) => t.id === id) ?? null;
}

/** PROGRAMA_CIUDAD_FORMATO_ANCHOxALTO.png */
export function slugPart(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "SIN_DATO"
  );
}

export function exportFileName(programa: string, ciudad: string, format: FormatId) {
  const f = FORMATS[format];
  return `${slugPart(programa)}_${slugPart(ciudad)}_${f.slug}_${f.width}x${f.height}.png`;
}
