/**
 * Reglas de copy: filtro léxico, validador de CTA y conteo de palabras.
 * Se evalúa en cliente y en tiempo real sobre los campos del tipo de pieza
 * elegido (ver piece-types) más los textos de la lista de ítems.
 */

import { getField, type PieceContent, type PieceTypeDef } from "./piece-types";

export const MAX_WORDS = 24;

/** Raíces prohibidas: cubren plurales, diminutivos y conjugaciones */
const BANNED: { root: string; label: string }[] = [
  { root: "estudiant", label: "Estudiantes" },
  { root: "estudi", label: "Estudiar" },
  { root: "universi", label: "Universidad" },
  { root: "academ", label: "Academia" },
  { root: "chisp", label: "Chispa" },
  { root: "gratis", label: "Gratis" },
  { root: "gratuit", label: "Gratis" },
  { root: "bec", label: "Becas" },
  { root: "matricul", label: "Matricúlate" },
  { root: "inscrib", label: "Inscríbete" },
  { root: "inscrip", label: "Inscripción" },
  { root: "diferen", label: "Diferente" },
  { root: "carrer", label: "Carrera" },
  { root: "regal", label: "Regalar" },
  { root: "rif", label: "Rifar" },
  { root: "obsequi", label: "Obsequiar" },
  { root: "brill", label: "Brillar" },
  { root: "futur", label: "Futuro" },
  { root: "descuent", label: "Descuento" },
  { root: "practicant", label: "Practicante" },
  { root: "educa", label: "Educación" },
  { root: "educ", label: "Educación" },
];

const BANNED_PHRASES = [{ phrase: "haz parte", label: "Haz parte" }];

/** Rutas de CTA permitidas (al menos una debe aparecer en el CTA) */
export const CTA_ROUTES = [
  { root: "divergen", label: "DIVERGENTE" },
  { root: "encien", label: "ENCIÉNDETE" },
  { root: "enciend", label: "ENCIÉNDETE" },
  { root: "activ", label: "ACTÍVATE" },
  { root: "conect", label: "CONÉCTATE" },
  { root: "explor", label: "EXPLORA" },
  { root: "impuls", label: "IMPÚLSATE" },
  { root: "muev", label: "MUÉVETE" },
  { root: "descubr", label: "DESCUBRE" },
];

export const CTA_ROUTE_LABELS = Array.from(new Set(CTA_ROUTES.map((r) => r.label)));

/** Quita acentos, mayúsculas y símbolos usados para camuflar palabras (g.r.a.t.i.s) */
export function normalizeWord(word: string): string {
  return word
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[0@]/g, "o")
    .replace(/[1!¡|]/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[^a-zñ]/g, "");
}

export function words(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Campos de texto del tipo (con etiqueta) + un pseudo-campo por cada ítem de la lista */
export function collectText(
  type: PieceTypeDef,
  content: PieceContent,
): { key: string; label: string; value: string }[] {
  const out = type.fields.map((f) => ({
    key: f.id,
    label: f.label,
    value: getField(content, f.id),
  }));
  if (type.hasItems) {
    content.items.forEach((item, i) => {
      out.push({ key: `item:${item.id}`, label: `Ítem ${i + 1}`, value: item.text });
    });
  }
  return out;
}

export function countWords(type: PieceTypeDef, content: PieceContent): number {
  return collectText(type, content).reduce((n, f) => n + words(f.value).length, 0);
}

export type LexiconHit = { key: string; label: string; word: string; banned: string };

export function lexiconHits(type: PieceTypeDef, content: PieceContent): LexiconHit[] {
  const hits: LexiconHit[] = [];
  for (const { key, label, value } of collectText(type, content)) {
    const flat = normalizeWord(value.replace(/\s+/g, " ").replace(/[^\p{L}\s]/gu, " "));
    for (const { phrase, label: bannedLabel } of BANNED_PHRASES) {
      if (flat.includes(normalizeWord(phrase))) {
        hits.push({ key, label, word: phrase, banned: bannedLabel });
      }
    }
    for (const raw of words(value)) {
      const w = normalizeWord(raw);
      if (w.length < 3) continue;
      const match = BANNED.find((b) => w.startsWith(b.root));
      if (match) hits.push({ key, label, word: raw, banned: match.label });
    }
  }
  return hits;
}

export function bannedWordsFor(type: PieceTypeDef, content: PieceContent, key: string): string[] {
  return lexiconHits(type, content)
    .filter((h) => h.key === key)
    .map((h) => h.word);
}

export type CtaCheck = { ok: boolean; wordCount: number; hasRoute: boolean; message: string };

export function checkCta(cta: string): CtaCheck {
  const n = words(cta).length;
  const hasRoute = words(cta).some((raw) => {
    const w = normalizeWord(raw);
    return CTA_ROUTES.some((r) => w.startsWith(r.root));
  });
  const lengthOk = n >= 1 && n <= 5;
  let message = "CTA válido";
  if (!lengthOk) message = `El CTA debe tener entre 1 y 5 palabras (tiene ${n}).`;
  else if (!hasRoute) message = "El CTA debe incluir una ruta aprobada.";
  return { ok: lengthOk && hasRoute, wordCount: n, hasRoute, message };
}

export type PieceValidation = {
  approved: boolean;
  wordCount: number;
  wordsOk: boolean;
  hits: LexiconHit[];
  /** null si el tipo no tiene campo CTA */
  cta: CtaCheck | null;
  /** Etiquetas de los campos requeridos que faltan */
  missing: string[];
};

export function validatePiece(type: PieceTypeDef, content: PieceContent): PieceValidation {
  const wordCount = countWords(type, content);
  const hits = lexiconHits(type, content);

  const ctaField = type.fields.find((f) => f.id === "cta");
  const ctaValue = ctaField ? getField(content, ctaField.id) : "";
  const cta = ctaField && ctaValue.trim() ? checkCta(ctaValue) : ctaField ? checkCta("") : null;

  const missing: string[] = [];
  for (const f of type.fields) {
    if (f.required && !getField(content, f.id).trim()) missing.push(f.label);
  }
  if (type.hasItems && content.items.filter((i) => i.text.trim()).length === 0) {
    missing.push("Lista de ítems");
  }

  const wordsOk = wordCount > 0 && wordCount <= MAX_WORDS;
  const ctaOk = cta ? cta.ok : true;

  return {
    wordCount,
    wordsOk,
    hits,
    cta,
    missing,
    approved: wordsOk && hits.length === 0 && ctaOk && missing.length === 0,
  };
}
