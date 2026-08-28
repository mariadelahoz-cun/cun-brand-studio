import { Check } from "lucide-react";
import { CAMPAIGN_TEMPLATES, FORMATS, type CampaignTemplate, type FormatId } from "@/lib/brand";
import { cn } from "@/lib/utils";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

/** Esquema de zonas de un template en un formato dado (solo referencia visual) */
function Schematic({ template, format }: { template: CampaignTemplate; format: FormatId }) {
  const l = template.layout(format);
  const f = FORMATS[format];
  const p = template.palette;
  const ratio = (f.height / f.width) * 100;

  return (
    <div className="flex-1">
      <div
        className="relative w-full overflow-hidden rounded"
        style={{ paddingTop: `${ratio}%`, backgroundColor: p.canvas }}
      >
        <span
          className="absolute bg-foreground/25"
          style={{
            left: `${l.photo.x * 100}%`,
            top: `${l.photo.y * 100}%`,
            width: `${l.photo.w * 100}%`,
            height: `${l.photo.h * 100}%`,
          }}
        />
        <span
          className="absolute rounded-full border-2 border-dashed border-foreground/40"
          style={{
            left: `${l.brainrot.x * 100}%`,
            top: `${l.brainrot.y * 100}%`,
            width: `${l.brainrot.w * 100}%`,
            height: `${l.brainrot.h * 100}%`,
          }}
        />
        <span
          className="absolute"
          style={{
            left: `${l.text.x * 100}%`,
            top: `${l.text.y * 100}%`,
            width: `${l.text.w * 100}%`,
            height: `${l.text.h * 100}%`,
            backgroundColor: p.title,
            opacity: 0.25,
          }}
        />
        <span
          className="absolute bottom-0 left-0 right-0"
          style={{ height: `${l.franjaRatio * 100}%`, backgroundColor: p.franja }}
        />
      </div>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">{f.label}</p>
    </div>
  );
}

export function TemplateGallery({ selectedId, onSelect, disabled }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {CAMPAIGN_TEMPLATES.map((t) => {
        const selected = selectedId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(t.id)}
            className={cn(
              "rounded-xl border-2 bg-background p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              selected ? "border-primary" : "border-border hover:border-primary/40",
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{t.name}</span>
              {selected && <Check className="size-4 text-primary" />}
            </div>
            <div className="flex gap-2">
              <Schematic template={t} format="cuadrado" />
              <Schematic template={t} format="story" />
              <Schematic template={t} format="banner" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
