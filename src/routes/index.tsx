import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { toBlob } from "html-to-image";
import JSZip from "jszip";
import { Check, Download, LogOut, Package, Palette, RotateCcw, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

import { CampaignForm } from "@/components/campaign/CampaignForm";
import { StylePanel } from "@/components/campaign/StylePanel";
import { AssetPicker } from "@/components/campaign/AssetPicker";
import { PieceCanvas } from "@/components/campaign/PieceCanvas";
import { PieceEditor } from "@/components/campaign/PieceEditor";

import { useCampaign } from "@/lib/use-campaign";
import { approvedOf, useMediaLibrary } from "@/lib/media-library";
import { useSeedLibrary } from "@/lib/seed-library";
import { pieceTypeById } from "@/lib/piece-types";
import { MAX_WORDS, validatePiece } from "@/lib/copy-rules";
import type { ResolvedElement } from "@/lib/placement";
import { FORMATS, FORMAT_ORDER, exportFileName, isDark, type FormatId } from "@/lib/brand";
import { bgPresetUrl } from "@/lib/bg-presets";
import { logout } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CUN Creativo — Piezas de campañas" },
      {
        name: "description",
        content:
          "Plataforma interna de la CUN: elige el tipo de pieza, llena solo sus campos, define el fondo y el acento neón, y exporta los tres formatos.",
      },
      { property: "og:title", content: "CUN Creativo — Piezas de campañas" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignWorkspace,
});

function CampaignWorkspace() {
  const {
    campaign,
    content,
    patch,
    setPieceType,
    setField,
    addItem,
    updateItem,
    toggleItemMark,
    removeItem,
    setStyle,
    commitColor,
    setFixed,
    setPhotoFrame,
    addElement,
    updateElement,
    removeElement,
    bringElementFront,
    setStatus,
    reset,
    allApproved,
  } = useCampaign();
  const { assets, loaded: mediaLoaded, addFiles, addFromUrl } = useMediaLibrary();
  useSeedLibrary(assets, addFromUrl, mediaLoaded);

  const [exporting, setExporting] = useState(false);
  const canvasRefs = useRef<Record<FormatId, HTMLDivElement | null>>({
    cuadrado: null,
    story: null,
    banner: null,
  });

  const type = pieceTypeById(campaign.pieceType);
  const validation = type ? validatePiece(type, content) : null;

  const url = (id: string | null) => assets.find((a) => a.id === id)?.dataUrl ?? null;
  const fondos = useMemo(() => approvedOf(assets, "fondo"), [assets]);
  const elementLibrary = useMemo(() => approvedOf(assets, "elemento"), [assets]);
  const canvasAssets = useMemo(
    () => ({
      bgUrl: bgPresetUrl(campaign.style.bgImageId) ?? url(campaign.style.bgImageId),
      fotoUrl: url(campaign.fotoId),
      logoUrl: url(campaign.logoId),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assets, campaign.style.bgImageId, campaign.fotoId, campaign.logoId],
  );
  const resolvedElements = useMemo<ResolvedElement[]>(
    () => campaign.elements.map((el) => ({ ...el, url: url(el.assetId) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assets, campaign.elements],
  );

  async function handleUploadFondo(files: File[]) {
    try {
      const created = await addFiles(files, "fondo", "Campaña", true);
      const first = created[0];
      if (first) {
        setStyle({ bgImageId: first.id });
        toast.success("Fondo agregado y aplicado a la pieza");
      } else {
        toast.error("Solo se aceptan imágenes");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el fondo");
    }
  }

  async function handleUploadElemento(files: File[]) {
    try {
      const created = await addFiles(files, "elemento", "Campaña", true);
      const first = created[0];
      if (first) {
        addElement(first.id);
        toast.success("Elemento agregado a la pieza");
      } else {
        toast.error("Solo se aceptan imágenes");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el elemento");
    }
  }

  const checklist = [
    { label: "Tipo de pieza elegido", ok: Boolean(type) },
    {
      label: `Campos requeridos completos${
        validation && validation.missing.length ? `: falta ${validation.missing.join(", ")}` : ""
      }`,
      ok: Boolean(validation && validation.missing.length === 0),
    },
    {
      label: `Conteo de copy ≤ ${MAX_WORDS} palabras (${validation?.wordCount ?? 0})`,
      ok: Boolean(validation?.wordsOk),
    },
    {
      label: "Validación léxica aprobada",
      ok: Boolean(validation && validation.hits.length === 0),
    },
    {
      label: validation?.cta
        ? `CTA con ruta aprobada — ${validation.cta.message}`
        : "CTA (no aplica)",
      ok: validation?.cta ? validation.cta.ok : true,
    },
    {
      label: campaign.style.bgImageId ? "Fondo (imagen)" : "Fondo oscuro y saturado",
      ok: Boolean(campaign.style.bgImageId) || isDark(campaign.style.bgColor),
    },
    { label: "Franja de logos reservada", ok: true },
  ];
  const qcOk = checklist.every((c) => c.ok);

  function nextApprovable(): FormatId | null {
    for (const f of FORMAT_ORDER) if (campaign.status[f] !== "aprobado") return f;
    return null;
  }

  async function renderFormat(format: FormatId) {
    const node = canvasRefs.current[format];
    if (!node) return null;
    const f = FORMATS[format];
    return toBlob(node, {
      width: f.width,
      height: f.height,
      pixelRatio: 1,
      cacheBust: true,
      style: { transform: "none", transformOrigin: "top left" },
    });
  }

  async function handleZip() {
    setExporting(true);
    try {
      const zip = new JSZip();
      for (const format of FORMAT_ORDER) {
        const blob = await renderFormat(format);
        if (!blob) throw new Error("render");
        zip.file(exportFileName(campaign.programa, campaign.ciudad, format), blob);
      }
      const out = await zip.generateAsync({ type: "blob" });
      const href = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${campaign.programa || "CAMPANA"}_CUN.zip`.toUpperCase();
      a.click();
      URL.revokeObjectURL(href);
      toast.success("Paquete de campaña exportado con los tres formatos");
    } catch {
      toast.error("No se pudo generar el paquete ZIP");
    } finally {
      setExporting(false);
    }
  }

  const pending = nextApprovable();

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
              <p className="text-xs text-muted-foreground">Piezas de campañas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">Panel de administración</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-1.5 size-3.5" />
              Salir
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="mr-1.5 size-3.5" />
              Nueva campaña
            </Button>
            <Button size="sm" onClick={handleZip} disabled={!allApproved || exporting}>
              <Package className="mr-1.5 size-3.5" />
              Descargar ZIP
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Section step="1" title="Tipo de pieza y contenido">
            <CampaignForm
              campaign={campaign}
              onMeta={patch}
              onPieceType={setPieceType}
              onField={setField}
              onAddItem={addItem}
              onUpdateItem={updateItem}
              onToggleItemMark={toggleItemMark}
              onRemoveItem={removeItem}
              onFixed={setFixed}
            />
          </Section>

          <Section step="2" title="Sistema visual (fondo, acento y neón)">
            <StylePanel
              style={campaign.style}
              recentColors={campaign.recentColors}
              fondos={fondos}
              onChange={setStyle}
              onCommitColor={commitColor}
              onUploadFondo={handleUploadFondo}
            />
          </Section>

          <Section step="3" title="Fotografía y franja de logos">
            <AssetPicker
              assets={assets}
              fotoId={campaign.fotoId}
              logoId={campaign.logoId}
              onChange={patch}
            />
          </Section>

          <Section step="4" title="Editor: mover la foto y agregar elementos">
            {!type ? (
              <p className="text-sm text-muted-foreground">
                Elige un tipo de pieza para abrir el editor.
              </p>
            ) : (
              <PieceEditor
                campaign={campaign}
                type={type}
                content={content}
                canvasAssets={canvasAssets}
                elements={resolvedElements}
                elementLibrary={elementLibrary}
                onAddElement={addElement}
                onUpdateElement={updateElement}
                onRemoveElement={removeElement}
                onBringFront={bringElementFront}
                onPhotoChange={setPhotoFrame}
                onUploadElement={handleUploadElemento}
              />
            )}
          </Section>

          <Section step="5" title="Aprobación secuencial de formatos">
            <div className="space-y-3">
              {FORMAT_ORDER.map((format, i) => {
                const f = FORMATS[format];
                const status = campaign.status[format];
                const isNext = pending === format;
                const previousOk = FORMAT_ORDER.slice(0, i).every(
                  (p) => campaign.status[p] === "aprobado",
                );
                return (
                  <div
                    key={format}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {f.label} · {f.width}×{f.height}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exportFileName(campaign.programa, campaign.ciudad, format)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status === "aprobado" ? "secondary" : "outline"}>
                        {status === "aprobado" ? "Aprobado" : "Pendiente"}
                      </Badge>
                      {status === "aprobado" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(format, "pendiente")}
                        >
                          Reabrir
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={!qcOk || !previousOk || !isNext}
                          onClick={() => setStatus(format, "aprobado")}
                        >
                          Aprobar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">
                El ZIP se habilita cuando los tres formatos están aprobados.
              </p>
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Control de calidad</h2>
            <ul className="space-y-1.5">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-start gap-2 text-xs">
                  {c.ok ? (
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  ) : (
                    <X className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  )}
                  <span className={c.ok ? "text-muted-foreground" : "text-foreground"}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Palette className="size-4" />
              Vista previa
            </h2>
            {!type ? (
              <p className="text-xs text-muted-foreground">
                Elige un tipo de pieza para ver los tres formatos.
              </p>
            ) : (
              <div className="space-y-4">
                {FORMAT_ORDER.map((format) => {
                  const f = FORMATS[format];
                  const scale = 340 / f.width;
                  return (
                    <div key={format} className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {f.label} · {f.width}×{f.height}
                      </p>
                      <div
                        className="overflow-hidden rounded-md ring-1 ring-border"
                        style={{ width: f.width * scale, height: f.height * scale }}
                      >
                        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                          <PieceCanvas
                            ref={(el) => {
                              canvasRefs.current[format] = el;
                            }}
                            format={format}
                            type={type}
                            content={content}
                            style={campaign.style}
                            fixed={campaign.fixed}
                            meta={{ programa: campaign.programa, ciudad: campaign.ciudad }}
                            assets={canvasAssets}
                            photoFrame={campaign.photoFrame}
                            elements={resolvedElements}
                          />
                        </div>
                      </div>
                      <Separator />
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={exporting}
                  onClick={handleZip}
                >
                  <Download className="mr-1.5 size-3.5" />
                  Exportar paquete
                </Button>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function Section({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {step}
        </span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}
