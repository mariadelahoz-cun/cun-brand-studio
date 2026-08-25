import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { Download, Link2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

import { PiecePreview } from "@/components/editor/PiecePreview";
import { MediaLibrary } from "@/components/editor/MediaLibrary";
import { BrandSettings } from "@/components/editor/BrandSettings";
import { useBrandConfig } from "@/lib/use-brand-config";
import { useMediaLibrary } from "@/lib/media-library";
import {
  COLOR_SCHEMES,
  DEFAULT_CONTENT,
  TEMPLATES,
  fileName,
  type PieceContent,
} from "@/lib/brand";
import fondoCampus from "@/assets/fondo-campus.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CUN Creativo — Generador de piezas de marca CUN" },
      {
        name: "description",
        content:
          "Plataforma interna de la CUN para crear posts, historias y banners aplicando automáticamente el manual de marca institucional.",
      },
      { property: "og:title", content: "CUN Creativo — Generador de piezas de marca" },
      { property: "og:type", content: "website" },
      {
        property: "og:description",
        content:
          "Crea piezas de marketing digital de la CUN con colores, tipografías y márgenes de marca aplicados automáticamente.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Editor,
});

const TEMPLATE = TEMPLATES["post-1080"];

function Editor() {
  const { brand, update, reset } = useBrandConfig();
  const { assets, addFiles, addFromUrl, remove } = useMediaLibrary();
  const [content, setContent] = useState<PieceContent>(DEFAULT_CONTENT);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  // Semilla: imagen de apoyo por defecto en la biblioteca (versión 2: encuadre más amplio)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("cun-creativo:seeded:v2")) return;
    window.localStorage.setItem("cun-creativo:seeded:v2", "1");
    addFromUrl(fondoCampus, "fondo-campus.jpg", "apoyo")
      .then((asset) => {
        setContent((prev) => (prev.backgroundId ? prev : { ...prev, backgroundId: asset.id }));
      })
      .catch(() => undefined);
  }, [addFromUrl]);

  useEffect(() => {
    if (content.backgroundId) return;
    const firstBackground = assets.find((asset) => asset.category === "apoyo");
    if (!firstBackground) return;
    setContent((prev) =>
      prev.backgroundId ? prev : { ...prev, backgroundId: firstBackground.id },
    );
  }, [assets, content.backgroundId]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const box = el.getBoundingClientRect();
      const size = Math.min(box.width, box.height || box.width);
      setScale(Math.max(0.2, size / TEMPLATE.width));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const set = <K extends keyof PieceContent>(key: K, value: PieceContent[K]) =>
    setContent((prev) => ({ ...prev, [key]: value }));

  const logoUrl = useMemo(
    () => assets.find((a) => a.id === content.logoId)?.dataUrl ?? null,
    [assets, content.logoId],
  );
  const backgroundUrl = useMemo(
    () => assets.find((a) => a.id === content.backgroundId)?.dataUrl ?? null,
    [assets, content.backgroundId],
  );

  async function render() {
    const node = canvasRef.current;
    if (!node) return null;
    return toBlob(node, {
      width: TEMPLATE.width,
      height: TEMPLATE.height,
      pixelRatio: 1,
      cacheBust: true,
      style: { transform: "none", transformOrigin: "top left" },
    });
  }

  async function handleDownload() {
    setExporting(true);
    try {
      const blob = await render();
      if (!blob) throw new Error("No se pudo generar la imagen");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName(TEMPLATE.id, "png");
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Pieza exportada en 1080 × 1080 px");
    } catch {
      toast.error("No se pudo exportar la pieza");
    } finally {
      setExporting(false);
    }
  }

  async function handleShare() {
    setExporting(true);
    try {
      const blob = await render();
      if (!blob) throw new Error();
      const url = URL.createObjectURL(blob);
      await navigator.clipboard.writeText(url);
      toast.success("Enlace temporal copiado", {
        description: "Válido mientras esta pestaña siga abierta.",
      });
    } catch {
      toast.error("No se pudo copiar el enlace");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster />
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h1 className="text-sm font-semibold leading-tight text-foreground">CUN Creativo</h1>
              <p className="text-xs text-muted-foreground">
                Piezas de marca · {TEMPLATE.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContent({ ...DEFAULT_CONTENT, logoId: content.logoId })}
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Restablecer plantilla
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} disabled={exporting}>
              <Link2 className="mr-1.5 size-3.5" />
              Copiar enlace
            </Button>
            <Button size="sm" onClick={handleDownload} disabled={exporting}>
              <Download className="mr-1.5 size-3.5" />
              Descargar PNG
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Lienzo */}
        <section
          ref={stageRef}
          className="flex min-h-[520px] items-center justify-center rounded-xl border border-border bg-background p-6 shadow-sm"
        >
          <div
            className="overflow-hidden rounded-md ring-1 ring-border"
            style={{ width: TEMPLATE.width * scale, height: TEMPLATE.height * scale }}
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <PiecePreview
                ref={canvasRef}
                brand={brand}
                template={TEMPLATE}
                content={content}
                logoUrl={logoUrl}
                backgroundUrl={backgroundUrl}
              />
            </div>
          </div>
        </section>

        {/* Panel lateral */}
        <aside className="rounded-xl border border-border bg-background p-4 shadow-sm">
          <Tabs defaultValue="contenido">
            <TabsList className="w-full">
              <TabsTrigger value="contenido" className="flex-1">
                Contenido
              </TabsTrigger>
              <TabsTrigger value="medios" className="flex-1">
                Medios
              </TabsTrigger>
              <TabsTrigger value="marca" className="flex-1">
                Marca
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contenido" className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={content.title}
                  onChange={(e) => set("title", e.target.value)}
                  maxLength={60}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subtitulo">Subtítulo</Label>
                <Input
                  id="subtitulo"
                  value={content.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cta">Call to action</Label>
                <Input
                  id="cta"
                  value={content.cta}
                  onChange={(e) => set("cta", e.target.value)}
                  maxLength={40}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Combinación de color permitida</Label>
                <div className="flex gap-2">
                  {COLOR_SCHEMES.map((s) => (
                    <Button
                      key={s.id}
                      type="button"
                      size="sm"
                      variant={content.scheme === s.id ? "default" : "outline"}
                      onClick={() => set("scheme", s.id)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo combinaciones aprobadas por el manual de marca.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Encuadre de la imagen</Label>
                <SliderRow
                  label="Horizontal"
                  value={content.bgPosX}
                  onChange={(v) => set("bgPosX", v)}
                />
                <SliderRow
                  label="Vertical"
                  value={content.bgPosY}
                  onChange={(v) => set("bgPosY", v)}
                />
                <SliderRow
                  label="Zoom"
                  min={100}
                  max={200}
                  value={content.bgZoom}
                  onChange={(v) => set("bgZoom", v)}
                />
              </div>
            </TabsContent>

            <TabsContent value="medios" className="mt-4 space-y-5">
              <MediaLibrary
                category="logo"
                assets={assets}
                selectedId={content.logoId}
                onSelect={(id) => set("logoId", id)}
                onUpload={(files) => {
                  addFiles(files, "logo").then((created) => {
                    if (created[0]) set("logoId", created[0].id);
                  });
                }}
                onRemove={remove}
              />
              <Separator />
              <MediaLibrary
                category="apoyo"
                assets={assets}
                selectedId={content.backgroundId}
                onSelect={(id) => set("backgroundId", id)}
                onUpload={(files) => {
                  addFiles(files, "apoyo").then((created) => {
                    if (created[0]) set("backgroundId", created[0].id);
                  });
                }}
                onRemove={remove}
              />
              <p className="text-xs text-muted-foreground">
                Los assets quedan guardados en este navegador. Al activar login institucional
                pasarán a la biblioteca compartida del equipo.
              </p>
            </TabsContent>

            <TabsContent value="marca" className="mt-4">
              <BrandSettings brand={brand} onChange={update} onReset={reset} />
            </TabsContent>
          </Tabs>
        </aside>
      </main>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v ?? value)}
      />
    </div>
  );
}
