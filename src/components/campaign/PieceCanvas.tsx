import { forwardRef, useCallback, useRef, type CSSProperties, type PointerEvent } from "react";

import {
  BRAND,
  FORMATS,
  FRANJA_RATIO,
  neonGlow,
  resolvePalette,
  withAlpha,
  type FormatId,
  type PieceStyle,
} from "@/lib/brand";
import { getField, type PieceContent, type PieceTypeDef } from "@/lib/piece-types";
import { clamp, type PhotoFrame, type PlacedElement, type ResolvedElement } from "@/lib/placement";
import type { FixedData } from "@/lib/use-campaign";
import { CunLogo } from "./CunLogo";

export type CanvasAssets = {
  /** Imagen de fondo a sangre (alternativa al color sólido) */
  bgUrl: string | null;
  fotoUrl: string | null;
  logoUrl: string | null;
};

type Props = {
  format: FormatId;
  type: PieceTypeDef;
  content: PieceContent;
  style: PieceStyle;
  fixed: FixedData;
  meta: { programa: string; ciudad: string };
  assets: CanvasAssets;
  photoFrame: PhotoFrame;
  elements: ResolvedElement[];
  /** Modo edición: habilita arrastrar la foto y los elementos */
  interactive?: boolean;
  /** Escala a la que se muestra el lienzo (para convertir píxeles a fracciones) */
  displayScale?: number;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onElementChange?: (id: string, patch: Partial<PlacedElement>) => void;
  onPhotoChange?: (patch: Partial<PhotoFrame>) => void;
};

function WhatsAppMark({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.887 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 0 0 5.71 1.447h.006c6.585 0 11.946-5.334 11.949-11.892a11.821 11.821 0 0 0-3.495-8.411z" />
    </svg>
  );
}

type DragState = {
  mode: "move-photo" | "move-element" | "resize-element";
  id?: string;
  startX: number;
  startY: number;
  base: { a: number; b: number };
};

/**
 * Lienzo de una variante de la pieza a resolución nativa.
 * Layout adaptativo por tipo; el color de fondo, el acento y el neón vienen del
 * panel de estilo. Fijos: cuerpo blanco, franja de logos y WhatsApp en verde.
 * En modo `interactive` se pueden arrastrar la foto y los elementos.
 */
export const PieceCanvas = forwardRef<HTMLDivElement, Props>(function PieceCanvas(
  {
    format,
    type,
    content,
    style,
    fixed,
    meta,
    assets,
    photoFrame,
    elements,
    interactive = false,
    displayScale = 1,
    selectedId = null,
    onSelect,
    onElementChange,
    onPhotoChange,
  },
  ref,
) {
  const f = FORMATS[format];
  const { width, height } = f;
  const unit = Math.min(width, height) / 1080;
  const pal = resolvePalette(style);
  const safe = width * BRAND.safeMarginRatio;
  const franjaH = height * FRANJA_RATIO[format];
  const legalOn = fixed.legalEnabled && fixed.legalText.trim().length > 0;
  const legalH = legalOn ? 46 * unit : 0;

  const glow = style.neon ? neonGlow(pal.accent, unit) : "none";

  const drag = useRef<DragState | null>(null);
  const live = useRef({ width, height, displayScale, onElementChange, onPhotoChange });
  live.current = { width, height, displayScale, onElementChange, onPhotoChange };

  const onMove = useCallback((e: globalThis.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const { width: w, height: h, displayScale: s } = live.current;
    const dxF = (e.clientX - d.startX) / (s * w);
    const dyF = (e.clientY - d.startY) / (s * h);
    if (d.mode === "move-photo") {
      live.current.onPhotoChange?.({
        x: clamp(d.base.a - dxF * 100, 0, 100),
        y: clamp(d.base.b - dyF * 100, 0, 100),
      });
    } else if (d.mode === "move-element" && d.id) {
      live.current.onElementChange?.(d.id, {
        x: clamp(d.base.a + dxF, -0.25, 1.25),
        y: clamp(d.base.b + dyF, -0.25, 1.25),
      });
    } else if (d.mode === "resize-element" && d.id) {
      live.current.onElementChange?.(d.id, { w: clamp(d.base.a + dxF * 2, 0.05, 1.6) });
    }
  }, []);

  const onUp = useCallback(() => {
    drag.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  }, [onMove]);

  const begin = useCallback(
    (e: PointerEvent, state: DragState) => {
      if (!interactive) return;
      e.preventDefault();
      e.stopPropagation();
      drag.current = state;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [interactive, onMove, onUp],
  );

  const displayBase: CSSProperties = {
    fontFamily: BRAND.fontDisplay,
    textTransform: "uppercase",
    color: pal.title,
    lineHeight: 1.02,
    letterSpacing: 0.5,
    margin: 0,
  };
  const bodyStyle: CSSProperties = {
    fontFamily: BRAND.fontBody,
    color: pal.body,
    fontSize: 34 * unit,
    fontWeight: 500,
    lineHeight: 1.3,
    margin: 0,
  };

  function ctaPill(text: string) {
    return (
      <span
        style={{
          alignSelf: "flex-start",
          backgroundColor: pal.accent,
          color: pal.accentText,
          fontFamily: BRAND.fontDisplay,
          fontSize: 34 * unit,
          textTransform: "uppercase",
          letterSpacing: 1,
          padding: `${16 * unit}px ${34 * unit}px`,
          borderRadius: 999,
          boxShadow: style.neon ? neonGlow(pal.accent, unit * 0.7) : "none",
        }}
      >
        {text}
      </span>
    );
  }

  const hook = getField(content, "hook");
  const cta = getField(content, "cta");

  return (
    <div
      ref={ref}
      onClick={interactive ? () => onSelect?.(null) : undefined}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        backgroundColor: pal.canvas,
        fontFamily: BRAND.fontBody,
      }}
    >
      {/* Imagen de fondo a sangre (alternativa al color sólido) */}
      {assets.bgUrl ? (
        <>
          <img
            src={assets.bgUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: withAlpha("#000000", 0.28) }} />
        </>
      ) : null}

      {/* Fotografía a sangre (posición y zoom editables) */}
      {assets.fotoUrl ? (
        <>
          <img
            src={assets.fotoUrl}
            alt=""
            draggable={false}
            onPointerDown={(e) =>
              begin(e, {
                mode: "move-photo",
                startX: e.clientX,
                startY: e.clientY,
                base: { a: photoFrame.x, b: photoFrame.y },
              })
            }
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${photoFrame.x}% ${photoFrame.y}%`,
              transform: `scale(${photoFrame.scale})`,
              transformOrigin: `${photoFrame.x}% ${photoFrame.y}%`,
              opacity: photoFrame.opacity ?? 1,
              display: "block",
              cursor: interactive ? "grab" : "default",
              touchAction: "none",
            }}
          />
          {(photoFrame.scrim ?? 1) > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `linear-gradient(90deg, ${withAlpha(pal.canvas, photoFrame.scrim ?? 1)} 34%, ${withAlpha(pal.canvas, (photoFrame.scrim ?? 1) * 0.55)} 62%, ${withAlpha(pal.canvas, (photoFrame.scrim ?? 1) * 0.1)} 100%)`,
              }}
            />
          ) : null}
        </>
      ) : null}

      {/* Viñeta / brillo sutil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(120% 80% at 85% 0%, ${withAlpha("#ffffff", 0.08)}, transparent 60%)`,
        }}
      />

      {/* Columna de contenido */}
      <div
        style={{
          position: "absolute",
          left: safe,
          right: safe,
          top: safe,
          bottom: franjaH + legalH + safe * 0.5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 18 * unit,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: BRAND.fontBody,
            fontSize: 22 * unit,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: withAlpha("#ffffff", 0.75),
          }}
        >
          {[meta.programa, meta.ciudad].filter(Boolean).join(" · ")}
        </div>

        {type.id === "urgencia" && (
          <>
            {hook ? (
              <h2 style={{ ...displayBase, fontSize: 84 * unit, textShadow: glow }}>{hook}</h2>
            ) : null}
            <div
              style={{ display: "flex", alignItems: "baseline", gap: 20 * unit, flexWrap: "wrap" }}
            >
              {getField(content, "precioAntes") ? (
                <span
                  style={{
                    ...bodyStyle,
                    fontSize: 34 * unit,
                    textDecoration: "line-through",
                    opacity: 0.7,
                  }}
                >
                  {getField(content, "precioAntes")}
                </span>
              ) : null}
              {getField(content, "precioAhora") ? (
                <span
                  style={{
                    ...displayBase,
                    fontSize: 78 * unit,
                    color: pal.accent,
                    textShadow: glow,
                  }}
                >
                  {getField(content, "precioAhora")}
                </span>
              ) : null}
            </div>
            {cta ? ctaPill(cta) : null}
            {fixed.whatsapp ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 * unit }}>
                <WhatsAppMark size={40 * unit} fill={pal.whatsapp} />
                <span style={{ ...bodyStyle, fontWeight: 700 }}>{fixed.whatsapp}</span>
              </div>
            ) : null}
          </>
        )}

        {type.id === "programa" && (
          <>
            {getField(content, "programaNombre") ? (
              <h2 style={{ ...displayBase, fontSize: 72 * unit, textShadow: glow }}>
                {getField(content, "programaNombre")}
              </h2>
            ) : null}
            {getField(content, "programaTagline") ? (
              <p style={bodyStyle}>{getField(content, "programaTagline")}</p>
            ) : null}
            {cta ? ctaPill(cta) : null}
            {getField(content, "snies") ? (
              <span style={{ ...bodyStyle, fontSize: 24 * unit, fontWeight: 700, opacity: 0.85 }}>
                SNIES {getField(content, "snies")}
              </span>
            ) : null}
          </>
        )}

        {type.id === "motivacional" && (
          <>
            {hook ? (
              <h2 style={{ ...displayBase, fontSize: 96 * unit, textShadow: glow }}>{hook}</h2>
            ) : null}
            {getField(content, "subtexto") ? (
              <p style={bodyStyle}>{getField(content, "subtexto")}</p>
            ) : null}
            {cta ? ctaPill(cta) : null}
          </>
        )}

        {type.id === "informativa" && (
          <>
            {getField(content, "titulo") ? (
              <h2 style={{ ...displayBase, fontSize: 68 * unit, textShadow: glow }}>
                {getField(content, "titulo")}
              </h2>
            ) : null}
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14 * unit,
              }}
            >
              {content.items
                .filter((it) => it.text.trim())
                .map((it) => (
                  <li
                    key={it.id}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14 * unit }}
                  >
                    <span
                      style={{
                        fontFamily: BRAND.fontDisplay,
                        fontSize: 32 * unit,
                        lineHeight: 1.1,
                        color: it.mark === "check" ? pal.markOk : pal.markNo,
                        textShadow: it.mark === "check" ? glow : "none",
                      }}
                    >
                      {it.mark === "check" ? "✓" : "✕"}
                    </span>
                    <span style={{ ...bodyStyle, fontSize: 32 * unit }}>{it.text}</span>
                  </li>
                ))}
            </ul>
          </>
        )}
      </div>

      {/* Elementos gráficos sobre la pieza */}
      {elements.map((el) => {
        if (!el.url) return null;
        const selected = interactive && el.id === selectedId;
        return (
          <div
            key={el.id}
            onPointerDown={(e) => {
              if (interactive) onSelect?.(el.id);
              begin(e, {
                mode: "move-element",
                id: el.id,
                startX: e.clientX,
                startY: e.clientY,
                base: { a: el.x, b: el.y },
              });
            }}
            onClick={interactive ? (e) => e.stopPropagation() : undefined}
            style={{
              position: "absolute",
              left: el.x * width,
              top: el.y * height,
              width: el.w * width,
              transform: `translate(-50%, -50%) rotate(${el.rot}deg)`,
              opacity: el.opacity ?? 1,
              cursor: interactive ? "move" : "default",
              touchAction: "none",
              outline: selected ? `${3 / displayScale}px dashed ${pal.accent}` : "none",
              outlineOffset: `${4 / displayScale}px`,
            }}
          >
            <img
              src={el.url}
              alt=""
              draggable={false}
              style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }}
            />
            {selected ? (
              <span
                onPointerDown={(e) =>
                  begin(e, {
                    mode: "resize-element",
                    id: el.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    base: { a: el.w, b: 0 },
                  })
                }
                style={{
                  position: "absolute",
                  right: `${-8 / displayScale}px`,
                  bottom: `${-8 / displayScale}px`,
                  width: `${16 / displayScale}px`,
                  height: `${16 / displayScale}px`,
                  borderRadius: 999,
                  background: pal.accent,
                  border: `${2 / displayScale}px solid #fff`,
                  cursor: "nwse-resize",
                }}
              />
            ) : null}
          </div>
        );
      })}

      {/* Línea legal */}
      {legalOn ? (
        <div
          style={{
            position: "absolute",
            left: safe,
            right: safe,
            bottom: franjaH + 14 * unit,
            fontFamily: BRAND.fontBody,
            fontSize: 20 * unit,
            color: pal.legal,
            pointerEvents: "none",
          }}
        >
          {fixed.legalText}
        </div>
      ) : null}

      {/* Franja de logos (fija) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: franjaH,
          display: "flex",
          alignItems: "center",
          gap: 20 * unit,
          paddingLeft: safe,
          paddingRight: safe,
          background: withAlpha("#000000", 0.18),
          pointerEvents: "none",
        }}
      >
        {assets.logoUrl ? (
          <img
            src={assets.logoUrl}
            alt="Logo institucional"
            style={{
              height: franjaH * 0.56,
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          <CunLogo heightPx={franjaH * 0.62} variant="white" />
        )}
        {fixed.partner ? (
          <>
            <span
              style={{ width: 2, height: franjaH * 0.4, background: withAlpha("#ffffff", 0.4) }}
            />
            <span
              style={{
                fontFamily: BRAND.fontBody,
                fontSize: 22 * unit,
                fontWeight: 600,
                letterSpacing: 1,
                color: "#FFFFFF",
              }}
            >
              {fixed.partner}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
});
