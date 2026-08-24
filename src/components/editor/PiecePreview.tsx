import { forwardRef } from "react";
import {
  schemeColors,
  type BrandConfig,
  type PieceContent,
  type Template,
} from "@/lib/brand";

type Props = {
  brand: BrandConfig;
  template: Template;
  content: PieceContent;
  logoUrl: string | null;
  backgroundUrl: string | null;
};

/**
 * Lienzo de la pieza a resolución nativa (1080x1080).
 * Todas las reglas de marca (márgenes de seguridad, área de protección del
 * logo, jerarquía tipográfica y paleta) se aplican aquí automáticamente.
 */
export const PiecePreview = forwardRef<HTMLDivElement, Props>(function PiecePreview(
  { brand, template, content, logoUrl, backgroundUrl },
  ref,
) {
  const c = schemeColors(brand, content.scheme);
  const margin = template.width * brand.grid.safeMarginRatio;
  const logoWidth = Math.max(brand.logo.minWidthPx, brand.logo.defaultWidthPx);
  const clearSpace = (logoWidth / 3) * brand.logo.clearSpaceRatio;
  const panelHeight = template.height * 0.42;

  return (
    <div
      ref={ref}
      style={{
        width: template.width,
        height: template.height,
        position: "relative",
        overflow: "hidden",
        backgroundColor: brand.colors.white,
        fontFamily: brand.fonts.body,
      }}
    >
      {/* Capa: imagen de fondo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: brand.colors.gray,
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
          backgroundSize: `${content.bgZoom}% auto`,
          backgroundPosition: `${content.bgPosX}% ${content.bgPosY}%`,
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Capa: panel de contenido con color institucional */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: panelHeight,
          backgroundColor: c.panel,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 18,
          padding: `${margin}px ${margin}px`,
          textAlign: brand.type.align,
          alignItems: brand.type.align === "center" ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: 90,
            height: 10,
            borderRadius: 999,
            backgroundColor: c.accent,
          }}
        />
        <div
          style={{
            fontFamily: brand.fonts.display,
            fontSize: brand.type.titleSize,
            lineHeight: brand.type.titleLineHeight,
            color: c.title,
            fontWeight: 700,
          }}
        >
          {content.title}
        </div>
        {content.subtitle ? (
          <div
            style={{
              fontSize: brand.type.subtitleSize,
              lineHeight: 1.25,
              color: c.text,
              fontWeight: 500,
            }}
          >
            {content.subtitle}
          </div>
        ) : null}
        {content.cta ? (
          <div
            style={{
              marginTop: 10,
              backgroundColor: c.ctaBg,
              color: c.ctaText,
              fontSize: brand.type.ctaSize,
              fontWeight: 700,
              letterSpacing: 0.5,
              padding: "20px 36px",
              borderRadius: 999,
            }}
          >
            {content.cta}
          </div>
        ) : null}
      </div>

      {/* Capa: logo con área de protección garantizada */}
      <div
        style={{
          position: "absolute",
          top: margin,
          left: margin,
          padding: clearSpace,
          display: "flex",
          alignItems: "center",
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo institucional"
            style={{ width: logoWidth, height: "auto", objectFit: "contain", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: logoWidth,
              height: logoWidth / 3,
              borderRadius: 16,
              backgroundColor: brand.colors.white,
              color: brand.colors.green,
              fontFamily: brand.fonts.display,
              fontSize: logoWidth / 4,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            CUN
          </div>
        )}
      </div>
    </div>
  );
});
