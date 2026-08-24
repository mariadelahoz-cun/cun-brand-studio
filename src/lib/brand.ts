/**
 * Sistema de marca CUN — todos los valores son tokens editables desde el
 * panel "Configuración de marca". Nada de esto debe hardcodearse por pantalla.
 *
 * NOTA: los verdes provienen de una conversión aproximada de Pantone y aún no
 * están confirmados contra el PDF oficial del manual de marca.
 */

export type BrandConfig = {
  colors: {
    /** Pantone 376 C — verde CUN principal */
    green: string;
    /** Pantone 365 C — verde claro de apoyo / símbolo de la "U" */
    greenLight: string;
    /** Negro institucional (pendiente de confirmar) */
    ink: string;
    /** Gris neutro (pendiente de confirmar) */
    gray: string;
    /** Blanco institucional */
    white: string;
  };
  fonts: {
    /** Tipografía manuscrita del logotipo — placeholder hasta confirmar */
    display: string;
    /** Tipografía de cuerpo — placeholder hasta confirmar */
    body: string;
  };
  logo: {
    /** Área de protección como fracción de la altura del logo */
    clearSpaceRatio: number;
    /** Tamaño mínimo del logo en px sobre lienzo de 1080 */
    minWidthPx: number;
    /** Ancho por defecto en px sobre lienzo de 1080 */
    defaultWidthPx: number;
  };
  grid: {
    /** Margen de seguridad como fracción del ancho de la pieza */
    safeMarginRatio: number;
  };
  /** Jerarquía tipográfica en px sobre lienzo de 1080 */
  type: {
    titleSize: number;
    subtitleSize: number;
    bodySize: number;
    ctaSize: number;
    titleLineHeight: number;
    align: "left" | "center";
  };
};

export const DEFAULT_BRAND: BrandConfig = {
  colors: {
    green: "#84BD00",
    greenLight: "#C2E189",
    ink: "#1A1A1A",
    gray: "#6B7280",
    white: "#FFFFFF",
  },
  fonts: {
    display: "'Caveat', cursive",
    body: "'Inter', system-ui, sans-serif",
  },
  logo: {
    clearSpaceRatio: 0.5,
    minWidthPx: 120,
    defaultWidthPx: 240,
  },
  grid: {
    safeMarginRatio: 0.05,
  },
  type: {
    titleSize: 86,
    subtitleSize: 40,
    bodySize: 30,
    ctaSize: 30,
    titleLineHeight: 1.05,
    align: "left",
  },
};

export type TemplateId = "post-1080";

export type Template = {
  id: TemplateId;
  label: string;
  width: number;
  height: number;
};

export const TEMPLATES: Record<TemplateId, Template> = {
  "post-1080": {
    id: "post-1080",
    label: "Post cuadrado · 1080 × 1080",
    width: 1080,
    height: 1080,
  },
};

/** Combinaciones de color permitidas por el manual (el usuario no puede salirse) */
export type ColorScheme = "verde" | "claro" | "oscuro";

export const COLOR_SCHEMES: { id: ColorScheme; label: string }[] = [
  { id: "verde", label: "Verde CUN" },
  { id: "claro", label: "Claro" },
  { id: "oscuro", label: "Oscuro" },
];

export function schemeColors(brand: BrandConfig, scheme: ColorScheme) {
  switch (scheme) {
    case "claro":
      return {
        panel: brand.colors.white,
        title: brand.colors.ink,
        text: brand.colors.gray,
        ctaBg: brand.colors.green,
        ctaText: brand.colors.white,
        accent: brand.colors.green,
      };
    case "oscuro":
      return {
        panel: brand.colors.ink,
        title: brand.colors.white,
        text: brand.colors.greenLight,
        ctaBg: brand.colors.green,
        ctaText: brand.colors.ink,
        accent: brand.colors.greenLight,
      };
    default:
      return {
        panel: brand.colors.green,
        title: brand.colors.white,
        text: brand.colors.white,
        ctaBg: brand.colors.white,
        ctaText: brand.colors.ink,
        accent: brand.colors.greenLight,
      };
  }
}

export type PieceContent = {
  title: string;
  subtitle: string;
  cta: string;
  scheme: ColorScheme;
  /** Encuadre de la imagen de fondo dentro de la zona permitida (0-100 %) */
  bgPosX: number;
  bgPosY: number;
  bgZoom: number;
  logoId: string | null;
  backgroundId: string | null;
};

export const DEFAULT_CONTENT: PieceContent = {
  title: "Estudia en la CUN",
  subtitle: "Inscripciones abiertas 2026-2",
  cta: "Inscríbete en cun.edu.co",
  scheme: "verde",
  bgPosX: 50,
  bgPosY: 50,
  bgZoom: 100,
  logoId: null,
  backgroundId: null,
};

export function fileName(templateId: TemplateId, ext: string) {
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  return `cun-${templateId}-${stamp}.${ext}`;
}
