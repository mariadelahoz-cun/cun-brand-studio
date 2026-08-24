import { useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, type AssetCategory, type MediaAsset } from "@/lib/media-library";
import { cn } from "@/lib/utils";

type Props = {
  category: AssetCategory;
  assets: MediaAsset[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpload: (files: File[]) => void;
  onRemove: (id: string) => void;
};

export function MediaLibrary({
  category,
  assets,
  selectedId,
  onSelect,
  onUpload,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const items = assets.filter((a) => a.category === category);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onUpload(Array.from(e.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-muted",
          dragging && "border-primary bg-primary/5",
        )}
      >
        <Upload className="size-5 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{CATEGORY_LABELS[category]}</p>
        <p className="text-xs text-muted-foreground">
          Arrastra archivos aquí o haz clic — PNG, JPG{category === "logo" ? ", SVG" : ""}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onUpload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((asset) => (
            <div key={asset.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(selectedId === asset.id ? null : asset.id)}
                className={cn(
                  "flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border-2 bg-muted p-1 transition-colors",
                  selectedId === asset.id ? "border-primary" : "border-transparent",
                )}
                title={asset.name}
              >
                <img
                  src={asset.dataUrl}
                  alt={asset.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-1 top-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => {
                  if (selectedId === asset.id) onSelect(null);
                  onRemove(asset.id);
                }}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
