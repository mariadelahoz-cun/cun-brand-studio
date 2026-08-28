import { useCallback, useEffect, useState } from "react";
import { EMPTY_COPY, type CopyFields } from "./copy-rules";
import { FORMAT_ORDER, type FormatId } from "./brand";

export type PieceStatus = "pendiente" | "revision" | "aprobado";

export type CampaignState = {
  programa: string;
  ciudad: string;
  modalidad: string;
  snies: string;
  objetivo: string;
  /** El SNIES queda fijo para los tres formatos una vez confirmado */
  sniesConfirmed: boolean;
  templateId: string | null;
  copy: CopyFields;
  fotoId: string | null;
  brainrotId: string | null;
  texturaIds: string[];
  logoId: string | null;
  status: Record<FormatId, PieceStatus>;
};

export const MODALIDADES = ["Presencial", "Virtual", "Distancia"];

export const EMPTY_CAMPAIGN: CampaignState = {
  programa: "",
  ciudad: "",
  modalidad: "",
  snies: "",
  objetivo: "",
  sniesConfirmed: false,
  templateId: null,
  copy: EMPTY_COPY,
  fotoId: null,
  brainrotId: null,
  texturaIds: [],
  logoId: null,
  status: { cuadrado: "pendiente", story: "pendiente", banner: "pendiente" },
};

const KEY = "cun-creativo:campaign:v1";

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
          copy: { ...EMPTY_COPY, ...(parsed.copy ?? {}) },
          status: { ...EMPTY_CAMPAIGN.status, ...(parsed.status ?? {}) },
          texturaIds: parsed.texturaIds ?? [],
        });
      }
    } catch {
      /* estado inicial */
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: CampaignState) => {
    setCampaign(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const patch = useCallback(
    (changes: Partial<CampaignState>) =>
      setCampaign((prev) => {
        const next = { ...prev, ...changes };
        window.localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      }),
    [],
  );

  const setStatus = useCallback(
    (format: FormatId, status: PieceStatus) =>
      setCampaign((prev) => {
        const next = { ...prev, status: { ...prev.status, [format]: status } };
        window.localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      }),
    [],
  );

  const reset = useCallback(() => persist(EMPTY_CAMPAIGN), [persist]);

  const allApproved = FORMAT_ORDER.every((f) => campaign.status[f] === "aprobado");

  return { campaign, loaded, patch, setStatus, reset, allApproved };
}
