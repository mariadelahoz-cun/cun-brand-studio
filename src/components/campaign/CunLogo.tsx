import logoCun from "@/assets/logo-cun.png";

type Props = {
  /** Alto en píxeles del lienzo nativo */
  heightPx: number;
  /** El PNG oficial es a color; en las piezas oscuras se recolorea a blanco */
  variant?: "white" | "color";
};

/**
 * Logo institucional CUN para la franja. Usa el PNG oficial que sube diseño y,
 * sobre fondos oscuros, lo recolorea a blanco puro por CSS.
 */
export function CunLogo({ heightPx, variant = "white" }: Props) {
  return (
    <img
      src={logoCun}
      alt="Corporación Unificada Nacional de Educación Superior"
      style={{
        height: heightPx,
        width: "auto",
        objectFit: "contain",
        display: "block",
        filter: variant === "white" ? "brightness(0) invert(1)" : "none",
      }}
    />
  );
}
