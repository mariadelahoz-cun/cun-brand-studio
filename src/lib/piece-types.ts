/**
 * Tipos de pieza. Cada tipo declara SOLO los campos que el equipo de mercadeo
 * debe llenar; el resto se oculta para que el formulario sea rápido.
 */

export type PieceTypeId = "urgencia" | "programa" | "motivacional" | "informativa";

export type FieldId =
  | "hook"
  | "precioAntes"
  | "precioAhora"
  | "cta"
  | "programa"
  | "tagline"
  | "snies"
  | "subtexto"
  | "titulo";

export type FieldDef = {
  id: FieldId;
  label: string;
  placeholder?: string;
  maxLength: number;
  /** Cuenta en el conteo de palabras y pasa por el filtro léxico */
  isCopy: boolean;
  /** Se pinta como campo corto en la grilla */
  short?: boolean;
};

export type PieceTypeDef = {
  id: PieceTypeId;
  name: string;
  description: string;
  fields: FieldDef[];
  /** Lista de ítems con marca ✓ / ✗ */
  hasList?: boolean;
  /** Muestra el WhatsApp precargado dentro de la pieza */
  usesWhatsapp?: boolean;
  /** Exige confirmación manual del SNIES */
  requiresSnies?: boolean;
};

const CTA: FieldDef = {
  id: "cta",
  label: "CTA",
  placeholder: "Ej. Actívate ahora",
  maxLength: 60,
  isCopy: true,
  short: true,
};

export const PIECE_TYPES: PieceTypeDef[] = [
  {
    id: "urgencia",
    name: "Urgencia / Precio",
    description: "Hook fuerte, precio antes vs. especial y contacto directo.",
    usesWhatsapp: true,
    fields: [
      { id: "hook", label: "Hook", placeholder: "Ej. Últimos cupos", maxLength: 70, isCopy: true },
      {
        id: "precioAntes",
        label: 'Precio "antes"',
        placeholder: "$2.400.000",
        maxLength: 20,
        isCopy: false,
        short: true,
      },
      {
        id: "precioAhora",
        label: 'Precio especial / ahora',
        placeholder: "$1.290.000",
        maxLength: 20,
        isCopy: false,
        short: true,
      },
      CTA,
    ],
  },
  {
    id: "programa",
    name: "Programa específico",
    description: "Nombre del programa, tagline y código SNIES confirmado.",
    requiresSnies: true,
    fields: [
      {
        id: "programa",
        label: "Nombre del programa",
        placeholder: "Especialización en Inteligencia Artificial",
        maxLength: 90,
        isCopy: false,
      },
      {
        id: "tagline",
        label: "Tagline del programa",
        placeholder: "Ej. Domina la IA aplicada",
        maxLength: 90,
        isCopy: true,
      },
      CTA,
      {
        id: "snies",
        label: "Código SNIES",
        placeholder: "Escríbelo tal cual figura en el registro",
        maxLength: 20,
        isCopy: false,
        short: true,
      },
    ],
  },
  {
    id: "motivacional",
    name: "Motivacional / Genérica",
    description: "Hook aspiracional con subtexto de apoyo.",
    fields: [
      { id: "hook", label: "Hook", placeholder: "Ej. Enciéndete", maxLength: 70, isCopy: true },
      {
        id: "subtexto",
        label: "Subtexto de apoyo",
        placeholder: "Una línea que sostiene el hook",
        maxLength: 120,
        isCopy: true,
      },
      CTA,
    ],
  },
  {
    id: "informativa",
    name: "Informativa / Lista",
    description: "Título y lista de ítems marcables con ✓ o ✗ (fraude, seguridad, requisitos).",
    hasList: true,
    fields: [
      {
        id: "titulo",
        label: "Título",
        placeholder: "Cómo detectar un fraude",
        maxLength: 70,
        isCopy: true,
      },
    ],
  },
];

export function pieceTypeById(id: PieceTypeId | null) {
  return PIECE_TYPES.find((t) => t.id === id) ?? null;
}

export type ListItem = { id: string; text: string; mark: "check" | "cross" };

export type PieceContent = Partial<Record<FieldId, string>>;

export const EMPTY_CONTENT: PieceContent = {};

/** Campos de texto del tipo activo que entran en validación léxica y conteo */
export function copyValuesFor(type: PieceTypeDef | null, content: PieceContent, list: ListItem[]) {
  if (!type) return [] as string[];
  const values = type.fields.filter((f) => f.isCopy).map((f) => content[f.id] ?? "");
  if (type.hasList) values.push(...list.map((i) => i.text));
  return values.filter(Boolean);
}
