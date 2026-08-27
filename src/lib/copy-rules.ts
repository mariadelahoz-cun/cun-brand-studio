/**
 * Reglas de copy: filtro léxico, validador de CTA y conteo de palabras.
 * Todo se evalúa en cliente y en tiempo real; no hay generación automática.
 */

export type CopyFields = {
  titular: string;
  remate: string;
  beneficio: string;
  cta: string;
  micro1: string;
  micro2: string;
};

export const COPY_FIELD_LABELS: Record<keyof CopyFields, string> = {
  titular: "Titular",
  remate: "Remate",
  beneficio: "Beneficio",
  cta: "CTA",
  micro1: "Microtexto 1",
  micro2: "Microtexto 2",
};

export const EMPTY_COPY: CopyFields = {
  titular: "",
  remate: "",
  beneficio: "",
  cta: "",
  micro1: "",
  micro2: "",
};

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

/** Rutas de CTA permitidas (al menos una debe aparecer) */
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
export function normalizeWord(word: string) {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[0@]/g, "o")
    .replace(/[1!¡|]/g, "i")
    .replace(/3/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[^a-zñ]/g, "");
}

export function words(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

export function countWords(copy: CopyFields) {
  return (
    words(copy.titular).length +
    words(copy.remate).length +
    words(copy.beneficio).length +
    words(copy.cta).length +
    words(copy.micro1).length +
    words(copy.micro2).length
  );
}

export type LexiconHit = { field: keyof CopyFields; word: string; banned: string };

export function lexiconHits(copy: CopyFields): LexiconHit[] {
  const hits: LexiconHit[] = [];
  (Object.keys(copy) as (keyof CopyFields)[]).forEach((field) => {
    const value = copy[field];
    const flat = normalizeWord(value.replace(/\s+/g, " ").replace(/[^\p{L}\s]/gu, " "));
    for (const { phrase, label } of BANNED_PHRASES) {
      if (flat.includes(normalizeWord(phrase))) {
        hits.push({ field, word: phrase, banned: label });
      }
    }
    for (const raw of words(value)) {
      const w = normalizeWord(raw);
      if (w.length < 3) continue;
      const match = BANNED.find((b) => w.startsWith(b.root));
      if (match) hits.push({ field, word: raw, banned: match.label });
    }
  });
  return hits;
}

export function bannedWordsInField(copy: CopyFields, field: keyof CopyFields) {
  return lexiconHits(copy)
    .filter((h) => h.field === field)
    .map((h) => h.word);
}

export type CtaCheck = { ok: boolean; wordCount: number; hasRoute: boolean; message: string };

export function checkCta(cta: string): CtaCheck {
  const n = words(cta).length;
  const hasRoute = words(cta).some((raw) => {
    const w = normalizeWord(raw);
    return CTA_ROUTES.some((r) => w.startsWith(r.root));
  });
  const lengthOk = n >= 2 && n <= 5;
  let message = "CTA válido";
  if (!lengthOk) message = `El CTA debe tener entre 2 y 5 palabras (tiene ${n}).`;
  else if (!hasRoute) message = "El CTA debe incluir una ruta aprobada.";
  return { ok: lengthOk && hasRoute, wordCount: n, hasRoute, message };
}

export type CopyValidation = {
  approved: boolean;
  wordCount: number;
  wordsOk: boolean;
  hits: LexiconHit[];
  cta: CtaCheck;
  missing: (keyof CopyFields)[];
};

export function validateCopy(copy: CopyFields): CopyValidation {
  const wordCount = countWords(copy);
  const hits = lexiconHits(copy);
  const cta = checkCta(copy.cta);
  const missing = (Object.keys(copy) as (keyof CopyFields)[]).filter((f) => !copy[f].trim());
  const wordsOk = wordCount > 0 && wordCount <= MAX_WORDS;
  return {
    wordCount,
    wordsOk,
    hits,
    cta,
    missing,
    approved: wordsOk && hits.length === 0 && cta.ok && missing.length === 0,
  };
}
