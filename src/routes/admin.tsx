import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Check, Trash2, Upload, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import {
  BRAINROT_TAGS,
  CATEGORY_LABELS,
  CATEGORY_RULES,
  useMediaLibrary,
  type AssetCategory,
} from "@/lib/media-library";
import { useSeedLibrary } from "@/lib/seed-library";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administración de bibliotecas — CUN Creativo" },
      {
        name: "description",
        content:
          "Panel de diseño para subir, etiquetar y aprobar fotografías, recursos Brainrot, texturas Analogue y logos antes de habilitarlos para mercadeo.",
      },
      { property: "og:title", content: "Administración de bibliotecas — CUN Creativo" },
      {
        property: "og:description",
        content:
          "Diseño aprueba los assets pre-aprobados que mercadeo puede usar en las campañas de CUN Creativo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const CATEGORIES: AssetCategory[] = ["foto", "brainrot", "analogue", "logo"];

function AdminPage() {
  const { assets, addFiles, addFromUrl, setApproval, setTag, remove } = useMediaLibrary();
  useSeedLibrary(addFromUrl);

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster />
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Administración de bibliotecas
            </h1>
            <p className="text-xs text-muted-foreground">
              Diseño sube, etiqueta y aprueba los assets disponibles para mercadeo
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Volver a campañas
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-6">
        <Tabs defaultValue="foto">
          <TabsList className="w-full">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="flex-1">
                {CATEGORY_LABELS[c]}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <CategoryPanel
                category={category}
                assets={assets}
                addFiles={addFiles}
                setApproval={setApproval}
                setTag={setTag}
                remove={remove}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}

type PanelProps = {
  category: AssetCategory;
  assets: ReturnType<typeof useMediaLibrary>["assets"];
  addFiles: ReturnType<typeof useMediaLibrary>["addFiles"];
  setApproval: ReturnType<typeof useMediaLibrary>["setApproval"];
  setTag: ReturnType<typeof useMediaLibrary>["setTag"];
  remove: ReturnType<typeof useMediaLibrary>["remove"];
};

function CategoryPanel({
  category,
  assets,
  addFiles,
  setApproval,
  setTag,
  remove,
}: PanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadTag, setUploadTag] = useState(BRAINROT_TAGS[0]);
  const items = assets.filter((a) => a.category === category);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-background p-4 shadow-sm">
      <p className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        {CATEGORY_RULES[category]}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full space-y-1.5 sm:w-64">
          <Label>Etiqueta del asset</Label>
          <Select value={uploadTag} onValueChange={setUploadTag}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRAINROT_TAGS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files), category, uploadTag);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center transition-colors hover:border-primary/50",
          dragging && "border-primary bg-primary/5",
        )}
      >
        <Upload className="size-5 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Subir a {CATEGORY_LABELS[category]}
        </p>
        <p className="text-xs text-muted-foreground">
          Los assets entran como pendientes hasta que diseño los apruebe
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []), category, uploadTag);
            e.target.value = "";
          }}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay assets en esta biblioteca.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((asset) => (
            <div key={asset.id} className="space-y-2 rounded-lg border border-border p-2">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded bg-muted p-1">
                <img
                  src={asset.dataUrl}
                  alt={asset.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="truncate text-xs font-medium text-foreground" title={asset.name}>
                {asset.name}
              </p>
              <div className="flex items-center justify-between gap-2">
                <Badge variant={asset.approved ? "default" : "secondary"}>
                  {asset.approved ? "Aprobado" : "Pendiente"}
                </Badge>
                <span className="truncate text-[10px] text-muted-foreground">{asset.tag}</span>
              </div>
              <Select value={asset.tag} onValueChange={(v) => setTag(asset.id, v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRAINROT_TAGS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={asset.approved ? "outline" : "default"}
                  className="flex-1"
                  onClick={() => setApproval(asset.id, !asset.approved)}
                >
                  {asset.approved ? (
                    <>
                      <X className="mr-1 size-3" />
                      Revocar
                    </>
                  ) : (
                    <>
                      <Check className="mr-1 size-3" />
                      Aprobar
                    </>
                  )}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(asset.id)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
