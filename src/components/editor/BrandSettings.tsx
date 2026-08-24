import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { BrandConfig } from "@/lib/brand";

type Props = {
  brand: BrandConfig;
  onChange: (next: BrandConfig) => void;
  onReset: () => void;
};

const COLOR_FIELDS: { key: keyof BrandConfig["colors"]; label: string; note?: string }[] = [
  { key: "green", label: "Verde CUN (Pantone 376 C)", note: "Por confirmar con el manual" },
  { key: "greenLight", label: "Verde claro (Pantone 365 C)", note: "Por confirmar" },
  { key: "ink", label: "Negro institucional", note: "Pendiente de definir" },
  { key: "gray", label: "Gris neutro", note: "Pendiente de definir" },
  { key: "white", label: "Blanco" },
];

export function BrandSettings({ brand, onChange, onReset }: Props) {
  const set = <K extends keyof BrandConfig>(key: K, value: BrandConfig[K]) =>
    onChange({ ...brand, [key]: value });

  return (
    <div className="space-y-5">
      <p className="rounded-md border border-border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
        Estos valores son variables de marca, no están fijados en el código. Los verdes provienen
        de una conversión aproximada de Pantone y deben verificarse contra el PDF oficial del
        manual de marca CUN.
      </p>

      <div className="space-y-3">
        {COLOR_FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="text-xs">{f.label}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brand.colors[f.key]}
                onChange={(e) => set("colors", { ...brand.colors, [f.key]: e.target.value })}
                className="size-9 cursor-pointer rounded border border-border bg-transparent"
                aria-label={f.label}
              />
              <Input
                value={brand.colors[f.key]}
                onChange={(e) => set("colors", { ...brand.colors, [f.key]: e.target.value })}
                className="font-mono text-xs"
              />
            </div>
            {f.note && <p className="text-[11px] text-muted-foreground">{f.note}</p>}
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Tipografía de títulos (manuscrita)</Label>
          <Input
            value={brand.fonts.display}
            onChange={(e) => set("fonts", { ...brand.fonts, display: e.target.value })}
            className="text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Tipografía de cuerpo</Label>
          <Input
            value={brand.fonts.body}
            onChange={(e) => set("fonts", { ...brand.fonts, body: e.target.value })}
            className="text-xs"
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Margen de seguridad (%)"
          value={Math.round(brand.grid.safeMarginRatio * 100)}
          onChange={(v) => set("grid", { safeMarginRatio: v / 100 })}
        />
        <NumberField
          label="Área protección logo (×)"
          step={0.1}
          value={brand.logo.clearSpaceRatio}
          onChange={(v) => set("logo", { ...brand.logo, clearSpaceRatio: v })}
        />
        <NumberField
          label="Ancho logo (px)"
          value={brand.logo.defaultWidthPx}
          onChange={(v) => set("logo", { ...brand.logo, defaultWidthPx: v })}
        />
        <NumberField
          label="Ancho mínimo logo (px)"
          value={brand.logo.minWidthPx}
          onChange={(v) => set("logo", { ...brand.logo, minWidthPx: v })}
        />
        <NumberField
          label="Título (px)"
          value={brand.type.titleSize}
          onChange={(v) => set("type", { ...brand.type, titleSize: v })}
        />
        <NumberField
          label="Subtítulo (px)"
          value={brand.type.subtitleSize}
          onChange={(v) => set("type", { ...brand.type, subtitleSize: v })}
        />
        <NumberField
          label="Cuerpo (px)"
          value={brand.type.bodySize}
          onChange={(v) => set("type", { ...brand.type, bodySize: v })}
        />
        <NumberField
          label="CTA (px)"
          value={brand.type.ctaSize}
          onChange={(v) => set("type", { ...brand.type, ctaSize: v })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Alineación por defecto</Label>
        <div className="flex gap-2">
          {(["left", "center"] as const).map((a) => (
            <Button
              key={a}
              type="button"
              size="sm"
              variant={brand.type.align === a ? "default" : "outline"}
              onClick={() => set("type", { ...brand.type, align: a })}
            >
              {a === "left" ? "Izquierda" : "Centrada"}
            </Button>
          ))}
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onReset}>
        Restaurar valores de marca
      </Button>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="text-xs"
      />
    </div>
  );
}
