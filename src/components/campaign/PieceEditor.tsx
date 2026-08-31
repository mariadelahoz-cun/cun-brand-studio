import { useMemo, useRef, useState } from "react";
import { ImagePlus, Layers, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FORMATS, FORMAT_ORDER, type FormatId } from "@/lib/brand";
import {
  DEFAULT_PHOTO_FRAME,
  type PhotoFrame,
  type PlacedElement,
  type ResolvedElement,
} from "@/lib/placement";
import type { PieceTypeDef, PieceContent } from "@/lib/piece-types";
import type { CampaignState } from "@/lib/use-campaign";
import type { MediaAsset } from "@/lib/media-library";
import { PieceCanvas, type CanvasAssets } from "./PieceCanvas";

const MAX_W = 400;
const MAX_H = 520;

type Props = {
  campaign: CampaignState;
  type: PieceTypeDef;
  content: PieceContent;
  canvasAssets: CanvasAssets;
  elements: ResolvedElement[];
  elementLibrary: MediaAsset[];
  onAddElement: (assetId: string) => void;
  onUpdateElement: (id: string, patch: Partial<PlacedElement>) => void;
  onRemoveElement: (id: string) => void;
  onBringFront: (id: string) => void;
  onPhotoChange: (patch: Partial<PhotoFrame>) => void;
  onUploadElement: (files: File[]) => void;
};

export function PieceEditor({
  campaign,
  type,
  content,
  canvasAssets,
  elements,
  elementLibrary,
  onAddElement,
  onUpdateElement,
  onRemoveElement,
  onBringFront,
  onPhotoChange,
  onUploadElement,
}: Props) {
  const [fmt, setFmt] = useState<FormatId>("cuadrado");
  const [selId, setSelId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const f = FORMATS[fmt];
  const scale = Math.min(MAX_W / f.width, MAX_H / f.height);
  const selected = elements.find((e) => e.id === selId) ?? null;
  const hasPhoto = Boolean(canvasAssets.fotoUrl);
  const meta = useMemo(
    () => ({ programa: campaign.programa, ciudad: campaign.ciudad }),
    [campaign.programa, campaign.ciudad],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FORMAT_ORDER.map((id) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={fmt === id ? "default" : "outline"}
            onClick={() => setFmt(id)}
          >
            {FORMATS[id].label}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground">
          Arrastra la foto o un elemento para moverlo. Las posiciones se comparten entre los tres
          formatos.
        </span>
      </div>

      <div className="flex flex-wrap gap-6">
        <div
          className="shrink-0 overflow-hidden rounded-lg ring-1 ring-border"
          style={{ width: f.width * scale, height: f.height * scale }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <PieceCanvas
              format={fmt}
              type={type}
              content={content}
              style={campaign.style}
              fixed={campaign.fixed}
              meta={meta}
              assets={canvasAssets}
              photoFrame={campaign.photoFrame}
              elements={elements}
              interactive
              displayScale={scale}
              selectedId={selId}
              onSelect={setSelId}
              onElementChange={onUpdateElement}
              onPhotoChange={onPhotoChange}
            />
          </div>
        </div>

        <div className="min-w-[240px] flex-1 space-y-4">
          {/* Biblioteca de elementos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Layers className="size-3.5" />
                Elementos gráficos
              </Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) onUploadElement(files);
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
                Subir PNG
              </Button>
            </div>
            {elementLibrary.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                Sube un PNG con transparencia (lockup ¿Piensas divergente?, sticker, sello…) para
                agregarlo a la pieza.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {elementLibrary.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    title={`Agregar ${a.name}`}
                    onClick={() => onAddElement(a.id)}
                    className="flex aspect-square items-center justify-center overflow-hidden rounded-md border-2 border-transparent bg-muted p-1 hover:border-primary/40"
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
            )}
          </div>

          {/* Capas */}
          {elements.length > 0 && (
            <div className="space-y-1.5">
              <Label>En la pieza ({elements.length})</Label>
              <div className="space-y-1">
                {[...elements].reverse().map((el) => (
                  <div
                    key={el.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                      el.id === selId ? "border-primary bg-primary/5" : "border-border",
                    )}
                  >
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-2 text-left"
                      onClick={() => setSelId(el.id)}
                    >
                      {el.url ? (
                        <img src={el.url} alt="" className="size-6 shrink-0 object-contain" />
                      ) : null}
                      <span className="truncate text-muted-foreground">
                        {elementLibrary.find((a) => a.id === el.assetId)?.name ?? "Elemento"}
                      </span>
                    </button>
                    <button
                      type="button"
                      title="Quitar"
                      onClick={() => {
                        onRemoveElement(el.id);
                        if (selId === el.id) setSelId(null);
                      }}
                    >
                      <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controles del elemento seleccionado */}
          {selected && (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Elemento seleccionado
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onBringFront(selected.id)}
                >
                  Traer al frente
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tamaño</Label>
                <Slider
                  min={5}
                  max={140}
                  step={1}
                  value={[Math.round(selected.w * 100)]}
                  onValueChange={([v]) => onUpdateElement(selected.id, { w: (v ?? 44) / 100 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Rotación ({selected.rot}°)</Label>
                <Slider
                  min={-45}
                  max={45}
                  step={1}
                  value={[selected.rot]}
                  onValueChange={([v]) => onUpdateElement(selected.id, { rot: v ?? 0 })}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  onRemoveElement(selected.id);
                  setSelId(null);
                }}
              >
                <Trash2 className="mr-1.5 size-3.5" />
                Eliminar elemento
              </Button>
            </div>
          )}

          {/* Encuadre de la foto */}
          {hasPhoto && (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Encuadre de la foto
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onPhotoChange(DEFAULT_PHOTO_FRAME)}
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
                  Centrar
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Zoom ({campaign.photoFrame.scale.toFixed(2)}×)</Label>
                <Slider
                  min={1}
                  max={3}
                  step={0.05}
                  value={[campaign.photoFrame.scale]}
                  onValueChange={([v]) => onPhotoChange({ scale: v ?? 1 })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Arrastra la foto en el editor para reencuadrarla.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
