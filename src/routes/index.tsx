import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { toBlob } from "html-to-image";
import JSZip from "jszip";
import { Check, Download, Package, RotateCcw, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

import { CampaignForm } from "@/components/campaign/CampaignForm";
import { CopyPanel } from "@/components/campaign/CopyPanel";
import { TemplateGallery } from "@/components/campaign/TemplateGallery";
import { AssetZones } from "@/components/campaign/AssetZones";
import { PieceCanvas } from "@/components/campaign/PieceCanvas";

import { useCampaign } from "@/lib/use-campaign";
import { useMediaLibrary } from "@/lib/media-library";
import { useSeedLibrary } from "@/lib/seed-library";
import { validateCopy } from "@/lib/copy-rules";
import { FORMATS, FORMAT_ORDER, exportFileName, templateById, type FormatId } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CUN Creativo — Campañas con templates de marca" },
      {
        name: "description",
        content:
          "Plataforma interna de la CUN para armar campañas en tres formatos con templates y bibliotecas de assets pre-aprobados por diseño.",
      },
      { property: "og:title", content: "CUN Creativo — Campañas con templates de marca" },
      { property: "og:type", content: "website" },
      {
        property: "og:description",
        content:
          "Formulario de campaña, validación de copy, bibliotecas curadas y exportación de los tres formatos aprobados.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignWorkspace,
});

function CampaignWorkspace() {
  const { campaign, patch, setStatus, reset, allApproved } = useCampaign();
  const { assets, addFromUrl } = useMediaLibrary();
  useSeedLibrary(addFromUrl);

  const [exporting, setExporting] = useState(false);
  const canvasRefs = useRef<Record<FormatId, HTMLDivElement | null>>({
    cuadrado: null,
    story: null,
    banner: null,
  });

  const template = templateById(campaign.templateId);
  const copyCheck = validateCopy(campaign.copy);

  const url = (id: string | null) => assets.find((a) => a.id === id)?.dataUrl ?? null;
  const canvasAssets = useMemo(
    () => ({
      fotoUrl: url(campaign.fotoId),
      brainrotUrl: url(campaign.brainrotId),
      texturaUrls: campaign.texturaIds
        .map((id) => url(id))
        .filter((u): u is string => Boolean(u)),
      logoUrl: url(campaign.logoId),
    }),
    [assets, campaign.fotoId, campaign.brainrotId, campaign.texturaIds, campaign.logoId],
  );

  const checklist = [
    { label: "SNIES confirmado y fijo", ok: campaign.sniesConfirmed },
    { label: "Template de campaña seleccionado", ok: Boolean(template) },
    { label: "Copy completo (6 campos)", ok: copyCheck.missing.length === 0 },
    { label: `Conteo de copy ≤ 24 palabras (${copyCheck.wordCount})`, ok: copyCheck.wordsOk },
    { label: "Validación léxica aprobada", ok: copyCheck.hits.length === 0 },
    { label: "CTA con ruta aprobada (2–5 palabras)", ok: copyCheck.cta.ok },
    { label: "Fotografía aplicada", ok: Boolean(campaign.fotoId) },
    { label: "Exactamente 1 recurso Brainrot", ok: Boolean(campaign.brainrotId) },
    { label: "Mínimo 3 texturas Analogue", ok: campaign.texturaIds.length >= 3 },
    { label: "Franja institucional reservada (12–18%)", ok: true },
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

  const locked = !campaign.sniesConfirmed;
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
              <p className="text-xs text-muted-foreground">Campañas con templates aprobados</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">Panel de administración</Link>
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
          <Section step="1" title="Datos de la campaña">
            <CampaignForm campaign={campaign} onChange={patch} />
          </Section>

          <Section step="2" title="Template de campaña (define los tres formatos)">
            <TemplateGallery
              selectedId={campaign.templateId}
              onSelect={(id) => patch({ templateId: id })}
              disabled={locked}
            />
          </Section>

          <Section step="3" title="Copy de la pieza">
            <CopyPanel
              copy={campaign.copy}
              onChange={(copy) => patch({ copy })}
              programa={campaign.programa}
              modalidad={campaign.modalidad}
              ciudad={campaign.ciudad}
              snies={campaign.snies}
            />
          </Section>

          <Section step="4" title="Assets por zona">
            <AssetZones
              assets={assets}
              fotoId={campaign.fotoId}
              brainrotId={campaign.brainrotId}
              texturaIds={campaign.texturaIds}
              logoId={campaign.logoId}
              onChange={patch}
            />
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
            <h2 className="mb-3 text-sm font-semibold text-foreground">Vista previa</h2>
            {!template ? (
              <p className="text-xs text-muted-foreground">
                Selecciona un template para ver los tres formatos.
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
                            template={template}
                            copy={campaign.copy}
                            programa={campaign.programa}
                            modalidad={campaign.modalidad}
                            ciudad={campaign.ciudad}
                            snies={campaign.snies}
                            assets={canvasAssets}
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

function Section({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: ReactNode;
}) {
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
