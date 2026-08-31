import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BG_PRESETS, DEFAULT_ACCENT, type PieceStyle } from "@/lib/brand";
import { cn } from "@/lib/utils";

type Props = {
  style: PieceStyle;
  recentBgs: string[];
  onChange: (changes: Partial<PieceStyle>) => void;
};

/**
 * Color de fondo libre (con favoritos/recientes), acento pieza por pieza
 * (rosa neón por defecto) y efecto neón opcional del titular.
 */
export function StylePanel({ style, recentBgs, onChange }: Props) {
  const swatches = Array.from(new Set([...recentBgs, ...BG_PRESETS])).slice(0, 12);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="bg-color">Color de fondo (libre, tono oscuro saturado)</Label>
        <div className="flex items-center gap-2">
          <input
            id="bg-color"
            type="color"
            value={style.bg}
            onChange={(e) => onChange({ bg: e.target.value })}
            className="size-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
          />
          <Input
            value={style.bg}
            onChange={(e) => onChange({ bg: e.target.value })}
            className="w-32 font-mono uppercase"
            maxLength={7}
          />
          <div className="flex flex-wrap gap-1.5">
            {swatches.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={`Usar fondo ${c}`}
                onClick={() => onChange({ bg: c })}
                className={cn(
                  "size-7 rounded-md ring-1 ring-border transition-transform hover:scale-105",
                  style.bg.toLowerCase() === c.toLowerCase() && "ring-2 ring-primary",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        {recentBgs.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Los primeros colores son tus fondos recientes en esta plataforma.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accent-color">Color de acento (CTA, barras de highlight, checks)</Label>
        <div className="flex items-center gap-2">
          <input
            id="accent-color"
            type="color"
            value={style.accent}
            onChange={(e) => onChange({ accent: e.target.value })}
            className="size-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
          />
          <Input
            value={style.accent}
            onChange={(e) => onChange({ accent: e.target.value })}
            className="w-32 font-mono uppercase"
            maxLength={7}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ accent: DEFAULT_ACCENT })}
          >
            Volver al rosa neón
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
        <div>
          <Label htmlFor="neon">Efecto neón en el titular</Label>
          <p className="text-xs text-muted-foreground">
            Glow alrededor del texto del titular. Opcional pieza por pieza.
          </p>
        </div>
        <Switch
          id="neon"
          checked={style.neon}
          onCheckedChange={(neon) => onChange({ neon })}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Fijos por marca: franja de logos en la misma posición, texto de cuerpo en blanco, titulares
        en sans condensada mayúscula e ícono de WhatsApp en verde.
      </p>
    </div>
  );
}
