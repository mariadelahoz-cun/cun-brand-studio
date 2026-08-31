
export const BRAND = {
  /** Titular y hook: sans condensada, negrita, mayúsculas */
  fontDisplay: "'Anton', 'Bebas Neue', 'Montserrat', system-ui, sans-serif",
  /** Cuerpo, taglines, CTA, microtextos */
  fontBody: "'Montserrat', system-ui, sans-serif",
  /** El cuerpo de texto siempre va blanco sobre el fondo oscuro */
  bodyColor: "#FFFFFF",
  /** Ícono de WhatsApp cuando aplica */
  whatsappGreen: "#25D366",
  /** Rosa/magenta neón: único color que se repite en todas las piezas */
  defaultAccent: "#FF1F8F",
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

/** Alto de la franja institucional inferior como fracción del alto */
export const FRANJA_RATIO: Record<FormatId, number> = {
  cuadrado: 0.13,
  story: 0.1,
  banner: 0.14,
};

export type Rect = { x: number; y: number; w: number; h: number };

/** Fondos oscuros y saturados muestreados del template de campaña */
export const DARK_BG_PRESETS: { name: string; value: string }[] = [
  { name: "Azul marino", value: "#1E1B4B" },
  { name: "Morado", value: "#4A1D96" },
  { name: "Magenta", value: "#8A1253" },
  { name: "Rojo oscuro", value: "#7A1330" },
  { name: "Naranja", value: "#B3400C" },
  { name: "Verde", value: "#0F5132" },
];

export type PieceStyle = {
  /** Fondo libre; carga en un oscuro saturado por defecto */
  bgColor: string;
  /** Id de una imagen de fondo (biblioteca "Fondos"); null = usar color sólido */
  bgImageId: string | null;
  /** Acento por pieza; carga en el rosa neón por defecto */
  accent: string;
  /** Glow alrededor de titulares y CTA */
  neon: boolean;
};

export const DEFAULT_PIECE_STYLE: PieceStyle = {
  bgColor: "#1E1B4B",
  bgImageId: null,
  accent: BRAND.defaultAccent,
  neon: false,
};

export type ResolvedPalette = {
  canvas: string;
  title: string;
  body: string;
  accent: string;
  accentText: string;
  whatsapp: string;
  markOk: string;
  markNo: string;
  legal: string;
};

export function resolvePalette(style: PieceStyle): ResolvedPalette {
  return {
    canvas: style.bgColor,
    title: BRAND.bodyColor,
    body: BRAND.bodyColor,
    accent: style.accent,
    accentText: "#FFFFFF",
    whatsapp: BRAND.whatsappGreen,
    markOk: style.accent,
    markNo: "rgba(255,255,255,0.55)",
    legal: "rgba(255,255,255,0.7)",
  };
}

/** #RRGGBB (o #RGB) -> rgba(...) con alfa. Devuelve el color tal cual si no encaja. */
export function withAlpha(hex: string, alpha: number): string {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Luminancia relativa aproximada (0 oscuro – 1 claro) */
export function luminance(hex: string): number {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return 0;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isDark(hex: string): boolean {
  return luminance(hex) <= 0.42;
}

/** text-shadow / box-shadow del efecto neón, escalado por unidad del lienzo */
export function neonGlow(color: string, unit: number): string {
  const s = Math.max(unit, 0.25);
  return `0 0 ${6 * s}px ${color}, 0 0 ${16 * s}px ${color}, 0 0 ${34 * s}px ${withAlpha(color, 0.55)}`;
}

/** Quita acentos, mayúsculas y símbolos: PROGRAMA_CIUDAD_FORMATO_ANCHOxALTO.png */
export function slugPart(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "SIN_DATO"
  );
}

export function exportFileName(programa: string, ciudad: string, format: FormatId): string {
  const f = FORMATS[format];
  return `${slugPart(programa)}_${slugPart(ciudad)}_${f.slug}_${f.width}x${f.height}.png`;
}
