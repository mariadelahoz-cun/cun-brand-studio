import { BadgePercent, GraduationCap, Flame, ListChecks, type LucideIcon } from "lucide-react";

export type PieceTypeId = "urgencia" | "programa" | "motivacional" | "informativa";

export type PieceField = {
  id: string;
  label: string;
  placeholder?: string;
  maxLength: number;
  multiline?: boolean;
  required?: boolean;
};

export type PieceItemMark = "check" | "cross";

export type PieceItem = {
  id: string;
  text: string;
  mark: PieceItemMark;
};

export type PieceContent = {
  fields: Record<string, string>;
  items: PieceItem[];
};

export type PieceTypeDef = {
  id: PieceTypeId;
  label: string;
  description: string;
  icon: LucideIcon;
  fields: PieceField[];
  /** La pieza usa la lista editable de ítems ✓/✗ */
  hasItems?: boolean;
};

export const PIECE_TYPES: PieceTypeDef[] = [
  {
    id: "urgencia",
    label: "Urgencia / Precio",
    description: "Hook, precio antes y ahora, CTA y WhatsApp.",
    icon: BadgePercent,
    fields: [
      {
        id: "hook",
        label: "Hook",
        placeholder: "El gancho principal",
        maxLength: 70,
        required: true,
      },
      { id: "precioAntes", label: 'Precio "antes"', placeholder: "$0.000.000", maxLength: 24 },
      {
        id: "precioAhora",
        label: 'Precio "especial" / ahora',
        placeholder: "$0.000.000",
        maxLength: 24,
        required: true,
      },
      { id: "cta", label: "CTA", placeholder: "Enciéndete", maxLength: 40, required: true },
    ],
  },
  {
    id: "programa",
    label: "Programa específico",
    description: "Nombre y tagline del programa, CTA y código SNIES.",
    icon: GraduationCap,
    fields: [
      {
        id: "programaNombre",
        label: "Nombre del programa",
        placeholder: "Tal cual el registro oficial",
        maxLength: 90,
        required: true,
      },
      {
        id: "programaTagline",
        label: "Tagline del programa",
        placeholder: "Una línea de apoyo",
        maxLength: 120,
        multiline: true,
      },
      {
        id: "cta",
        label: "CTA",
        placeholder: "Explora el programa",
        maxLength: 40,
        required: true,
      },
      {
        id: "snies",
        label: "Código SNIES",
        placeholder: "Escríbelo tal cual el registro",
        maxLength: 20,
      },
    ],
  },
  {
    id: "motivacional",
    label: "Motivacional / Genérica",
    description: "Hook, subtexto de apoyo y CTA.",
    icon: Flame,
    fields: [
      {
        id: "hook",
        label: "Hook",
        placeholder: "¿Piensas divergente?",
        maxLength: 70,
        required: true,
      },
      {
        id: "subtexto",
        label: "Subtexto de apoyo",
        placeholder: "Una o dos líneas que refuercen el hook",
        maxLength: 160,
        multiline: true,
      },
      { id: "cta", label: "CTA", placeholder: "Enciéndete", maxLength: 40, required: true },
    ],
  },
  {
    id: "informativa",
    label: "Informativa / Lista",
    description: "Título y lista de ítems marcables como ✓ o ✗.",
    icon: ListChecks,
    hasItems: true,
    fields: [
      {
        id: "titulo",
        label: "Título",
        placeholder: "Ej. Cómo detectar un fraude",
        maxLength: 80,
        required: true,
      },
    ],
  },
];

export function pieceTypeById(id: PieceTypeId | null): PieceTypeDef | null {
  if (!id) return null;
  return PIECE_TYPES.find((t) => t.id === id) ?? null;
}

export function emptyContent(): PieceContent {
  return { fields: {}, items: [] };
}

export function emptyContentByType(): Record<PieceTypeId, PieceContent> {
  return {
    urgencia: emptyContent(),
    programa: emptyContent(),
    motivacional: emptyContent(),
    informativa: emptyContent(),
  };
}

export function getField(content: PieceContent, key: string): string {
  return content.fields[key] ?? "";
}

export function makeItem(mark: PieceItemMark = "check"): PieceItem {
  return { id: crypto.randomUUID(), text: "", mark };
}
