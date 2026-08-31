import { useCallback, useEffect, useState } from "react";
import { FORMAT_ORDER, DEFAULT_PIECE_STYLE, type FormatId, type PieceStyle } from "./brand";
import {
  emptyContent,
  emptyContentByType,
  makeItem,
  type PieceContent,
  type PieceItem,
  type PieceItemMark,
  type PieceTypeId,
} from "./piece-types";
import { DEFAULT_PHOTO_FRAME, makeElement, type PhotoFrame, type PlacedElement } from "./placement";

export type PieceStatus = "pendiente" | "revision" | "aprobado";

export const LEGAL_PRESETS = ["Aplican términos y condiciones", "Cupos limitados"];

export type FixedData = {
  /** Partner que acompaña a CUN en la franja de logos (Telecampus u otro) */
  partner: string;
  /** WhatsApp de contacto que se repite en la mayoría de piezas */
  whatsapp: string;
  /** Mostrar la línea legal como remate */
  legalEnabled: boolean;
  legalText: string;
};

export const DEFAULT_FIXED: FixedData = {
  partner: "Telecampus",
  whatsapp: "+57 300 000 0000",
  legalEnabled: false,
  legalText: LEGAL_PRESETS[0] ?? "",
};

export type CampaignState = {
  /** Nombre de campaña — solo para el nombre de archivo */
  programa: string;
  ciudad: string;
  pieceType: PieceTypeId | null;
  contentByType: Record<PieceTypeId, PieceContent>;
  style: PieceStyle;
  /** Colores de fondo usados recientemente, más reciente primero (máx 8) */
  recentColors: string[];
  fixed: FixedData;
  fotoId: string | null;
  /** Encuadre (posición y zoom) de la fotografía de fondo */
  photoFrame: PhotoFrame;
  /** Elementos gráficos añadidos sobre la pieza, en orden de apilado */
  elements: PlacedElement[];
  /** Override opcional de la franja; null = logo CUN recoloreado */
  logoId: string | null;
  status: Record<FormatId, PieceStatus>;
};

export const EMPTY_CAMPAIGN: CampaignState = {
  programa: "",
  ciudad: "",
  pieceType: null,
  contentByType: emptyContentByType(),
  style: DEFAULT_PIECE_STYLE,
  recentColors: [],
  fixed: DEFAULT_FIXED,
  fotoId: null,
  photoFrame: DEFAULT_PHOTO_FRAME,
  elements: [],
  logoId: null,
  status: { cuadrado: "pendiente", story: "pendiente", banner: "pendiente" },
};

const KEY = "cun-creativo:campaign:v2";
const MAX_RECENT = 8;

function hydrate(parsed: Partial<CampaignState>): CampaignState {
  const byType = { ...emptyContentByType(), ...(parsed.contentByType ?? {}) };
  return {
    ...EMPTY_CAMPAIGN,
    ...parsed,
    contentByType: byType,
    style: { ...DEFAULT_PIECE_STYLE, ...(parsed.style ?? {}) },
    recentColors: Array.isArray(parsed.recentColors)
      ? parsed.recentColors.slice(0, MAX_RECENT)
      : [],
    fixed: { ...DEFAULT_FIXED, ...(parsed.fixed ?? {}) },
    photoFrame: { ...DEFAULT_PHOTO_FRAME, ...(parsed.photoFrame ?? {}) },
    elements: Array.isArray(parsed.elements) ? parsed.elements : [],
    status: { ...EMPTY_CAMPAIGN.status, ...(parsed.status ?? {}) },
  };
}

export function useCampaign() {
  const [campaign, setCampaign] = useState<CampaignState>(EMPTY_CAMPAIGN);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setCampaign(hydrate(JSON.parse(raw) as Partial<CampaignState>));
    } catch {
      /* estado inicial */
    }
    setLoaded(true);
  }, []);

  const commit = useCallback((updater: (prev: CampaignState) => CampaignState) => {
    setCampaign((prev) => {
      const next = updater(prev);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* cuota agotada: el estado en memoria sigue vigente */
      }
      return next;
    });
  }, []);

  const patch = useCallback(
    (changes: Partial<CampaignState>) => commit((prev) => ({ ...prev, ...changes })),
    [commit],
  );

  const setPieceType = useCallback(
    (pieceType: PieceTypeId) => commit((prev) => ({ ...prev, pieceType })),
    [commit],
  );

  const currentContent = useCallback(
    (prev: CampaignState): PieceContent =>
      prev.pieceType ? (prev.contentByType[prev.pieceType] ?? emptyContent()) : emptyContent(),
    [],
  );

  const setContent = useCallback(
    (updater: (content: PieceContent) => PieceContent) =>
      commit((prev) => {
        if (!prev.pieceType) return prev;
        const current = prev.contentByType[prev.pieceType] ?? emptyContent();
        return {
          ...prev,
          contentByType: { ...prev.contentByType, [prev.pieceType]: updater(current) },
        };
      }),
    [commit],
  );

  const setField = useCallback(
    (key: string, value: string) =>
      setContent((c) => ({ ...c, fields: { ...c.fields, [key]: value } })),
    [setContent],
  );

  const addItem = useCallback(
    () => setContent((c) => ({ ...c, items: [...c.items, makeItem()] })),
    [setContent],
  );

  const updateItem = useCallback(
    (id: string, changes: Partial<Pick<PieceItem, "text" | "mark">>) =>
      setContent((c) => ({
        ...c,
        items: c.items.map((it) => (it.id === id ? { ...it, ...changes } : it)),
      })),
    [setContent],
  );

  const toggleItemMark = useCallback(
    (id: string) =>
      setContent((c) => ({
        ...c,
        items: c.items.map((it) =>
          it.id === id
            ? { ...it, mark: (it.mark === "check" ? "cross" : "check") as PieceItemMark }
            : it,
        ),
      })),
    [setContent],
  );

  const removeItem = useCallback(
    (id: string) => setContent((c) => ({ ...c, items: c.items.filter((it) => it.id !== id) })),
    [setContent],
  );

  const setStyle = useCallback(
    (changes: Partial<PieceStyle>) =>
      commit((prev) => ({ ...prev, style: { ...prev.style, ...changes } })),
    [commit],
  );

  /** Fija el color actual y lo mueve al historial de recientes */
  const commitColor = useCallback(
    (raw: string) =>
      commit((prev) => {
        const hex = raw.toUpperCase();
        const recentColors = [
          hex,
          ...prev.recentColors.filter((c) => c.toUpperCase() !== hex),
        ].slice(0, MAX_RECENT);
        // elegir un color sólido descarta la imagen de fondo
        return {
          ...prev,
          style: { ...prev.style, bgColor: hex, bgImageId: null },
          recentColors,
        };
      }),
    [commit],
  );

  const setFixed = useCallback(
    (changes: Partial<FixedData>) =>
      commit((prev) => ({ ...prev, fixed: { ...prev.fixed, ...changes } })),
    [commit],
  );

  const setPhotoFrame = useCallback(
    (changes: Partial<PhotoFrame>) =>
      commit((prev) => ({ ...prev, photoFrame: { ...prev.photoFrame, ...changes } })),
    [commit],
  );

  const addElement = useCallback(
    (assetId: string) =>
      commit((prev) => ({ ...prev, elements: [...prev.elements, makeElement(assetId)] })),
    [commit],
  );

  const updateElement = useCallback(
    (id: string, changes: Partial<PlacedElement>) =>
      commit((prev) => ({
        ...prev,
        elements: prev.elements.map((el) => (el.id === id ? { ...el, ...changes } : el)),
      })),
    [commit],
  );

  const removeElement = useCallback(
    (id: string) =>
      commit((prev) => ({ ...prev, elements: prev.elements.filter((el) => el.id !== id) })),
    [commit],
  );

  const bringElementFront = useCallback(
    (id: string) =>
      commit((prev) => {
        const el = prev.elements.find((e) => e.id === id);
        if (!el) return prev;
        return { ...prev, elements: [...prev.elements.filter((e) => e.id !== id), el] };
      }),
    [commit],
  );

  const setStatus = useCallback(
    (format: FormatId, status: PieceStatus) =>
      commit((prev) => ({ ...prev, status: { ...prev.status, [format]: status } })),
    [commit],
  );

  const reset = useCallback(() => commit(() => EMPTY_CAMPAIGN), [commit]);

  const allApproved = FORMAT_ORDER.every((f) => campaign.status[f] === "aprobado");

  const content: PieceContent = currentContent(campaign);

  return {
    campaign,
    content,
    loaded,
    patch,
    setPieceType,
    setContent,
    setField,
    addItem,
    updateItem,
    toggleItemMark,
    removeItem,
    setStyle,
    commitColor,
    setFixed,
    setPhotoFrame,
    addElement,
    updateElement,
    removeElement,
    bringElementFront,
    setStatus,
    reset,
    allApproved,
  };
}
