import { useCallback, useEffect, useState } from "react";
import { DEFAULT_STYLE, FORMAT_ORDER, type FormatId, type PieceStyle } from "./brand";
import {
  EMPTY_CONTENT,
  type ListItem,
  type PieceContent,
  type PieceTypeId,
} from "./piece-types";

export type PieceStatus = "pendiente" | "revision" | "aprobado";

export type CampaignState = {
  /** Paso 1: define qué campos se muestran */
  pieceType: PieceTypeId | null;
  /** Valores de los campos del tipo activo */
  content: PieceContent;
  /** Solo para el tipo Informativa / Lista */
  listItems: ListItem[];
  ciudad: string;
  /** El SNIES queda fijo para los tres formatos una vez confirmado */
  sniesConfirmed: boolean;
  /** Precargados y editables */
  whatsapp: string;
  partner: string;
  legalEnabled: boolean;
  legalText: string;
  /** Color de fondo libre, acento y efecto neón */
  style: PieceStyle;
  recentBgs: string[];
  templateId: string | null;
  fotoId: string | null;
  brainrotId: string | null;
  texturaIds: string[];
  logoId: string | null;
  status: Record<FormatId, PieceStatus>;
};

export const EMPTY_CAMPAIGN: CampaignState = {
  pieceType: null,
  content: EMPTY_CONTENT,
  listItems: [
    { id: "l1", text: "", mark: "check" },
    { id: "l2", text: "", mark: "check" },
    { id: "l3", text: "", mark: "cross" },
  ],
  ciudad: "",
  sniesConfirmed: false,
  whatsapp: "+57 320 000 0000",
  partner: "CUN + Telecampus",
  legalEnabled: false,
  legalText: "Aplican términos y condiciones",
  style: DEFAULT_STYLE,
  recentBgs: [],
  templateId: "bloque-verde",
  fotoId: null,
  brainrotId: null,
  texturaIds: [],
  logoId: null,
  status: { cuadrado: "pendiente", story: "pendiente", banner: "pendiente" },
};

const KEY = "cun-creativo:campaign:v2";

export function useCampaign() {
  const [campaign, setCampaign] = useState<CampaignState>(EMPTY_CAMPAIGN);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CampaignState>;
        setCampaign({
          ...EMPTY_CAMPAIGN,
          ...parsed,
          content: { ...(parsed.content ?? {}) },
          listItems: parsed.listItems?.length ? parsed.listItems : EMPTY_CAMPAIGN.listItems,
          style: { ...DEFAULT_STYLE, ...(parsed.style ?? {}) },
          recentBgs: parsed.recentBgs ?? [],
          status: { ...EMPTY_CAMPAIGN.status, ...(parsed.status ?? {}) },
          texturaIds: parsed.texturaIds ?? [],
        });
      }
    } catch {
      /* estado inicial */
    }
    setLoaded(true);
  }, []);

  const save = (next: CampaignState) => {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  };

  const patch = useCallback(
    (changes: Partial<CampaignState>) => setCampaign((prev) => save({ ...prev, ...changes })),
    [],
  );

  const setContent = useCallback(
    (changes: PieceContent) =>
      setCampaign((prev) => save({ ...prev, content: { ...prev.content, ...changes } })),
    [],
  );

  const setStyle = useCallback(
    (changes: Partial<PieceStyle>) =>
      setCampaign((prev) => {
        const style = { ...prev.style, ...changes };
        const recentBgs = changes.bg
          ? [changes.bg, ...prev.recentBgs.filter((c) => c !== changes.bg)].slice(0, 6)
          : prev.recentBgs;
        return save({ ...prev, style, recentBgs });
      }),
    [],
  );

  const setStatus = useCallback(
    (format: FormatId, status: PieceStatus) =>
      setCampaign((prev) =>
        save({ ...prev, status: { ...prev.status, [format]: status } }),
      ),
    [],
  );

  const reset = useCallback(
    () =>
      setCampaign((prev) =>
        save({ ...EMPTY_CAMPAIGN, recentBgs: prev.recentBgs, style: prev.style }),
      ),
    [],
  );

  const allApproved = FORMAT_ORDER.every((f) => campaign.status[f] === "aprobado");

  return { campaign, loaded, patch, setContent, setStyle, setStatus, reset, allApproved };
}
