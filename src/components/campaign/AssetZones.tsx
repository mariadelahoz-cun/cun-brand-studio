import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, approvedOf, type AssetCategory, type MediaAsset } from "@/lib/media-library";

type Props = {
  assets: MediaAsset[];
  fotoId: string | null;
  brainrotId: string | null;
  texturaIds: string[];
  logoId: string | null;
  onChange: (changes: {
    fotoId?: string | null;
    brainrotId?: string | null;
    texturaIds?: string[];
    logoId?: string | null;
  }) => void;
};

function Grid({
  assets,
  category,
  isSelected,
  onPick,
  showTags,
}: {
  assets: MediaAsset[];
  category: AssetCategory;
  isSelected: (id: string) => boolean;
  onPick: (id: string) => void;
  showTags?: boolean;
}) {
  const items = approvedOf(assets, category);
  if (!items.length) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        Sin assets aprobados en {CATEGORY_LABELS[category]}. Diseño debe subirlos y aprobarlos en el{" "}
        <Link to="/admin" className="font-medium text-primary underline">
          panel de administración
        </Link>
        .
      </p>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onPick(a.id)}
          title={showTags ? `${a.name} · ${a.tag}` : a.name}
          className={cn(
            "flex aspect-square items-center justify-center overflow-hidden rounded-md border-2 bg-muted p-1",
            isSelected(a.id) ? "border-primary" : "border-transparent hover:border-primary/40",
          )}
        >
          <img
            src={a.dataUrl}
            alt={a.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain"
          />
        </button>
      ))}
    </div>
  );
}

export function AssetZones({ assets, fotoId, brainrotId, texturaIds, logoId, onChange }: Props) {
  const texturasOk = texturaIds.length >= 3;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Zona de fotografía</Label>
        <Grid
          assets={assets}
          category="foto"
          isSelected={(id) => id === fotoId}
          onPick={(id) => onChange({ fotoId: id === fotoId ? null : id })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Zona de elemento Brainrot</Label>
          <Badge variant={brainrotId ? "secondary" : "destructive"}>
            {brainrotId ? "1 recurso" : "Falta 1 recurso"}
          </Badge>
        </div>
        <Grid
          assets={assets}
          category="brainrot"
          isSelected={(id) => id === brainrotId}
          onPick={(id) => onChange({ brainrotId: id === brainrotId ? null : id })}
          showTags
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Zonas de textura Analogue (mínimo 3)</Label>
          <Badge variant={texturasOk ? "secondary" : "destructive"}>
            {texturaIds.length}/3 aplicadas
          </Badge>
        </div>
        <Grid
          assets={assets}
          category="analogue"
          isSelected={(id) => texturaIds.includes(id)}
          onPick={(id) =>
            onChange({
              texturaIds: texturaIds.includes(id)
                ? texturaIds.filter((t) => t !== id)
                : [...texturaIds, id],
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Franja institucional · logo aprobado (opcional)</Label>
        <Grid
          assets={assets}
          category="logo"
          isSelected={(id) => id === logoId}
          onPick={(id) => onChange({ logoId: id === logoId ? null : id })}
        />
        <p className="text-xs text-muted-foreground">
          La franja se reserva siempre. Si no eliges logo, queda vacía — nunca con placeholder.
        </p>
      </div>
    </div>
  );
}
