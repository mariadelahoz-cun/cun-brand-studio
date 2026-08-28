import { forwardRef } from "react";
import { BRAND, FORMATS, type CampaignTemplate, type FormatId, type Rect } from "@/lib/brand";
import type { CopyFields } from "@/lib/copy-rules";

export type CanvasAssets = {
  fotoUrl: string | null;
  brainrotUrl: string | null;
  texturaUrls: string[];
  logoUrl: string | null;
};

type Props = {
  format: FormatId;
  template: CampaignTemplate;
  copy: CopyFields;
  programa: string;
  modalidad: string;
  ciudad: string;
  snies: string;
  assets: CanvasAssets;
};

function box(rect: Rect, width: number, height: number) {
  return {
    position: "absolute" as const,
    left: rect.x * width,
    top: rect.y * height,
    width: rect.w * width,
    height: rect.h * height,
  };
}

/**
 * Lienzo de una variante del template a resolución nativa.
 * Zonas fijas y bloqueadas: el usuario solo aporta assets y copy.
 */
export const PieceCanvas = forwardRef<HTMLDivElement, Props>(function PieceCanvas(
  { format, template, copy, programa, modalidad, ciudad, snies, assets },
  ref,
) {
  const f = FORMATS[format];
  const { width, height } = f;
  const layout = template.layout(format);
  const p = template.palette;
  const unit = Math.min(width, height) / 1080;
  const franjaH = height * layout.franjaRatio;
  const center = layout.align === "center";

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        backgroundColor: p.canvas,
        fontFamily: BRAND.fontBody,
      }}
    >
      {/* Zona de fotografía */}
      <div style={{ ...box(layout.photo, width, height), overflow: "hidden", background: "#DDD8CE" }}>
        {assets.fotoUrl ? (
          <img
            src={assets.fotoUrl}
            alt="Fotografía de la campaña"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : null}
      </div>

      {/* Panel de copy */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: (layout.photo.y + layout.photo.h) * height,
          bottom: 0,
          backgroundColor: p.panel,
        }}
      />

      {/* Zonas de textura Analogue (overlays) */}
      {layout.textures.map((rect, i) => {
        const url = assets.texturaUrls[i];
        if (!url) return null;
        return (
          <img
            key={i}
            src={url}
            alt=""
            style={{
              ...box(rect, width, height),
              objectFit: "contain",
              mixBlendMode: i === 1 ? "multiply" : "normal",
              opacity: 0.9,
            }}
          />
        );
      })}

      {/* Zona de elemento Brainrot */}
      {assets.brainrotUrl ? (
        <img
          src={assets.brainrotUrl}
          alt="Elemento Brainrot"
          style={{
            ...box(layout.brainrot, width, height),
            objectFit: "contain",
            filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.25))",
          }}
        />
      ) : null}

      {/* Bloques de texto */}
      <div
        style={{
          ...box(layout.text, width, height),
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 14 * unit,
          textAlign: center ? "center" : "left",
          alignItems: center ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            fontSize: 24 * unit,
            letterSpacing: 1.6,
            fontWeight: 700,
            textTransform: "uppercase",
            color: p.body,
            opacity: 0.9,
          }}
        >
          {[programa, modalidad, ciudad].filter(Boolean).join(" · ")}
        </div>
        <div
          style={{
            fontFamily: BRAND.fontDisplay,
            fontSize: 96 * unit,
            lineHeight: 1.02,
            color: p.title,
          }}
        >
          {copy.titular}
        </div>
        {copy.remate ? (
          <div
            style={{
              fontFamily: BRAND.fontDisplay,
              fontSize: 54 * unit,
              lineHeight: 1.05,
              color: p.remate,
            }}
          >
            {copy.remate}
          </div>
        ) : null}
        {copy.beneficio ? (
          <div style={{ fontSize: 34 * unit, fontWeight: 600, lineHeight: 1.25, color: p.body }}>
            {copy.beneficio}
          </div>
        ) : null}
        {copy.cta ? (
          <div
            style={{
              marginTop: 8 * unit,
              backgroundColor: p.ctaBg,
              color: p.ctaText,
              fontSize: 32 * unit,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: `${18 * unit}px ${34 * unit}px`,
              borderRadius: 999,
            }}
          >
            {copy.cta}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4 * unit,
            fontSize: 22 * unit,
            fontWeight: 500,
            color: p.body,
            opacity: 0.92,
          }}
        >
          {copy.micro1 ? <span>{copy.micro1}</span> : null}
          {copy.micro2 ? <span>{copy.micro2}</span> : null}
          {snies ? <span style={{ fontWeight: 700 }}>SNIES {snies}</span> : null}
        </div>
      </div>

      {/* Franja institucional reservada para el logo (vacía por defecto) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: franjaH,
          backgroundColor: p.franja,
          display: "flex",
          alignItems: "center",
          justifyContent: center ? "center" : "flex-start",
          paddingLeft: width * BRAND.safeMarginRatio,
          paddingRight: width * BRAND.safeMarginRatio,
        }}
      >
        {assets.logoUrl ? (
          <img
            src={assets.logoUrl}
            alt="Logo institucional"
            style={{ height: franjaH * 0.52, width: "auto", objectFit: "contain", display: "block" }}
          />
        ) : null}
      </div>
    </div>
  );
});
