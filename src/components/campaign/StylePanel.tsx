import { useRef } from "react";
import { ImagePlus, RotateCcw, Sparkles, TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BRAND, DARK_BG_PRESETS, isDark, type PieceStyle } from "@/lib/brand";
import type { MediaAsset } from "@/lib/media-library";

type Props = {
  style: PieceStyle;
  recentColors: string[];
  /** Fondos aprobados de la biblioteca */
  fondos: MediaAsset[];
  onChange: (changes: Partial<PieceStyle>) => void;
  /** Fija el color de fondo y lo guarda en recientes (al soltar el picker) */
  onCommitColor: (hex: string) => void;
  /** Sube una o más imágenes de fondo y selecciona la primera */
  onUploadFondo: (files: File[]) => void;
};

function Swatch({
  color,
  active,
  title,
  onClick,
}: {
  color: string;
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "size-7 rounded-md border-2 transition-transform hover:scale-105",
        active ? "border-foreground" : "border-border",
      )}
      style={{ backgroundColor: color }}
    />
  );
}

export function StylePanel({
  style,
  recentColors,
  fondos,
  onChange,
  onCommitColor,
  onUploadFondo,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const usingImage = Boolean(style.bgImageId);
  const bgLooksLight = !usingImage && !isDark(style.bgColor);
  const accentIsDefault = style.accent.toUpperCase() === BRAND.defaultAccent;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Color de fondo (oscuro y saturado)</Label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="color"
            aria-label="Color de fondo"
            value={style.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            onBlur={(e) => onCommitColor(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded-md border border-border bg-transparent p-1"
          />
          <span className="font-mono text-xs text-muted-foreground">
            {style.bgColor.toUpperCase()}
          </span>
          {usingImage && (
            <span className="text-xs text-muted-foreground">
              (en uso: imagen de fondo — elige un color para volver al sólido)
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DARK_BG_PRESETS.map((p) => (
            <Swatch
              key={p.value}
              color={p.value}
              title={p.name}
              active={!usingImage && style.bgColor.toUpperCase() === p.value.toUpperCase()}
              onClick={() => onCommitColor(p.value)}
            />
          ))}
        </div>
        {recentColors.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Recientes</p>
            <div className="flex flex-wrap gap-1.5">
              {recentColors.map((c) => (
                <Swatch
                  key={c}
                  color={c}
                  title={c}
                  active={!usingImage && style.bgColor.toUpperCase() === c.toUpperCase()}
                  onClick={() => onCommitColor(c)}
                />
              ))}
            </div>
          </div>
        )}
        {bgLooksLight && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600">
            <TriangleAlert className="size-3.5 shrink-0" />
            Este fondo se ve claro. La marca usa fondos oscuros; el cuerpo de texto va en blanco.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Imagen de fondo (opcional)</Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) onUploadFondo(files);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="mr-1.5 size-3.5" />
            Subir fondo
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Degradados, texturas o tramas a sangre. Reemplaza al color sólido en esa pieza.
        </p>
        {(fondos.length > 0 || usingImage) && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {fondos.map((a) => (
              <button
                key={a.id}
                type="button"
                title={a.name}
                onClick={() => onChange({ bgImageId: a.id === style.bgImageId ? null : a.id })}
                className={cn(
                  "relative flex aspect-square items-center justify-center overflow-hidden rounded-md border-2 bg-muted",
                  a.id === style.bgImageId
                    ? "border-primary"
                    : "border-transparent hover:border-primary/40",
                )}
              >
                <img
                  src={a.dataUrl}
                  alt={a.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
        {usingImage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ bgImageId: null })}
          >
            <X className="mr-1.5 size-3.5" />
            Quitar imagen de fondo
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Color de acento (CTA, barras de highlight y checks)</Label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="color"
            aria-label="Color de acento"
            value={style.accent}
            onChange={(e) => onChange({ accent: e.target.value })}
            className="h-9 w-14 cursor-pointer rounded-md border border-border bg-transparent p-1"
          />
          <span className="font-mono text-xs text-muted-foreground">
            {style.accent.toUpperCase()}
          </span>
          {!accentIsDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ accent: BRAND.defaultAccent })}
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Rosa neón
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Carga en {BRAND.defaultAccent} por defecto. Cámbialo pieza por pieza si hace falta.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Efecto neón</p>
            <p className="text-xs text-muted-foreground">Glow alrededor del titular y del CTA.</p>
          </div>
        </div>
        <Switch
          checked={style.neon}
          onCheckedChange={(neon) => onChange({ neon })}
          aria-label="Efecto neón"
        />
      </div>
    </div>
  );
}
