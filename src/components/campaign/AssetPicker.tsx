import { Link } from "@tanstack/react-router";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  approvedOf,
  type AssetCategory,
  type MediaAsset,
} from "@/lib/media-library";

type Props = {
  assets: MediaAsset[];
  fotoId: string | null;
  logoId: string | null;
  onChange: (changes: { fotoId?: string | null; logoId?: string | null }) => void;
};

function Grid({
  assets,
  category,
  selectedId,
  onPick,
}: {
  assets: MediaAsset[];
  category: AssetCategory;
  selectedId: string | null;
  onPick: (id: string | null) => void;
}) {
  const items = approvedOf(assets, category);
  if (!items.length) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        Sin assets aprobados en {CATEGORY_LABELS[category]}. Diseño los sube y aprueba en el{" "}
        <Link to="/admin" className="font-medium text-primary underline">
          panel de administración
        </Link>
        .
      </p>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {items.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onPick(a.id === selectedId ? null : a.id)}
          title={a.name}
          className={cn(
            "flex aspect-square items-center justify-center overflow-hidden rounded-md border-2 bg-muted p-1",
            a.id === selectedId ? "border-primary" : "border-transparent hover:border-primary/40",
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

export function AssetPicker({ assets, fotoId, logoId, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Fotografía (opcional, se coloca a sangre detrás del texto)</Label>
        <Grid
          assets={assets}
          category="foto"
          selectedId={fotoId}
          onPick={(id) => onChange({ fotoId: id })}
        />
      </div>

      <div className="space-y-2">
        <Label>Franja de logos · logo alterno (opcional)</Label>
        <p className="text-xs text-muted-foreground">
          Por defecto la franja usa el logo CUN en blanco. Elige aquí una versión alterna o un
          lockup con el partner.
        </p>
        <Grid
          assets={assets}
          category="logo"
          selectedId={logoId}
          onPick={(id) => onChange({ logoId: id })}
        />
      </div>
    </div>
  );
}
