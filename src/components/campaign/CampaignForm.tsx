import { useState } from "react";
import { AlertCircle, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CampaignState } from "@/lib/use-campaign";
import {
  PIECE_TYPES,
  copyValuesFor,
  pieceTypeById,
  type FieldId,
  type ListItem,
  type PieceContent,
  type PieceTypeId,
} from "@/lib/piece-types";
import { MAX_WORDS, bannedWordsInText, validateTexts } from "@/lib/copy-rules";

type Props = {
  campaign: CampaignState;
  onChange: (changes: Partial<CampaignState>) => void;
  onContentChange: (changes: PieceContent) => void;
};

/**
 * Paso 1: tipo de pieza. Solo se muestran los campos de la opción elegida.
 * Los datos que se repiten (franja de logos, WhatsApp, línea legal) vienen precargados.
 */
export function CampaignForm({ campaign, onChange, onContentChange }: Props) {
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const type = pieceTypeById(campaign.pieceType);
  const snies = campaign.content.snies ?? "";
  const v = validateTexts(
    copyValuesFor(type, campaign.content, campaign.listItems),
    campaign.content.cta ?? "",
  );

  function setList(items: ListItem[]) {
    onChange({ listItems: items });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de pieza</Label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PIECE_TYPES.map((t) => {
            const active = campaign.pieceType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectType(t.id)}
                className={cn(
                  "rounded-lg border-2 p-3 text-left transition-colors",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
                  {t.name}
                  {active && <Check className="size-4 shrink-0 text-primary" />}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{t.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!type ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Elige un tipo de pieza para ver únicamente los campos que necesitas.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {type.fields.map((f) => {
              const value = campaign.content[f.id] ?? "";
              const hits = f.isCopy ? bannedWordsInText(value) : [];
              const isSnies = f.id === "snies";
              return (
                <div
                  key={f.id}
                  className={cn("space-y-1.5", !f.short && "sm:col-span-2")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={f.id}>{f.label}</Label>
                    {hits.length > 0 && (
                      <span className="text-xs font-medium text-destructive">
                        Palabra bloqueada: {hits.join(", ")}
                      </span>
                    )}
                  </div>
                  <Input
                    id={f.id}
                    value={value}
                    maxLength={f.maxLength}
                    placeholder={f.placeholder}
                    autoComplete="off"
                    spellCheck={!isSnies}
                    disabled={isSnies && campaign.sniesConfirmed}
                    onChange={(e) => {
                      onContentChange({ [f.id]: e.target.value } as PieceContent);
                      if (isSnies) onChange({ sniesConfirmed: false });
                    }}
                    className={cn(hits.length > 0 && "border-destructive ring-1 ring-destructive/40")}
                  />
                </div>
              );
            })}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ciudad">Ciudad o región (para la nomenclatura del archivo)</Label>
              <Input
                id="ciudad"
                value={campaign.ciudad}
                maxLength={60}
                onChange={(e) => onChange({ ciudad: e.target.value })}
              />
            </div>
          </div>

          {type.hasList && (
            <div className="space-y-2">
              <Label>Lista de ítems</Label>
              <div className="space-y-2">
                {campaign.listItems.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title={item.mark === "check" ? "Marcado como ✓" : "Marcado como ✗"}
                      onClick={() =>
                        setList(
                          campaign.listItems.map((it, j) =>
                            j === i
                              ? { ...it, mark: it.mark === "check" ? "cross" : "check" }
                              : it,
                          ),
                        )
                      }
                    >
                      {item.mark === "check" ? (
                        <Check className="size-4 text-primary" />
                      ) : (
                        <X className="size-4 text-destructive" />
                      )}
                    </Button>
                    <Input
                      value={item.text}
                      maxLength={90}
                      placeholder={`Ítem ${i + 1}`}
                      onChange={(e) =>
                        setList(
                          campaign.listItems.map((it, j) =>
                            j === i ? { ...it, text: e.target.value } : it,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Quitar ítem"
                      onClick={() => setList(campaign.listItems.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setList([
                    ...campaign.listItems,
                    { id: `l${Date.now()}`, text: "", mark: "check" },
                  ])
                }
              >
                <Plus className="mr-1.5 size-3.5" />
                Agregar ítem
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={v.approved ? "default" : "destructive"}>
              Validación léxica: {v.banned.length === 0 ? "APROBADA" : "RECHAZADA"}
            </Badge>
            <Badge variant={v.wordsOk ? "secondary" : "destructive"}>
              Conteo de copy: {v.wordCount}/{MAX_WORDS} palabras
            </Badge>
            {type.fields.some((f) => f.id === "cta") && (
              <Badge variant={v.cta.ok ? "secondary" : "destructive"}>
                CTA: {v.cta.ok ? "válido" : v.cta.message}
              </Badge>
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">
              Fijos por defecto (editables si hace falta)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="partner">Franja de logos</Label>
                <Input
                  id="partner"
                  value={campaign.partner}
                  maxLength={60}
                  onChange={(e) => onChange({ partner: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp de contacto</Label>
                <Input
                  id="whatsapp"
                  value={campaign.whatsapp}
                  maxLength={30}
                  onChange={(e) => onChange({ whatsapp: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="legal"
                checked={campaign.legalEnabled}
                onCheckedChange={(c) => onChange({ legalEnabled: c === true })}
              />
              <Label htmlFor="legal" className="text-sm font-normal">
                Incluir línea legal
              </Label>
              {campaign.legalEnabled && (
                <Input
                  value={campaign.legalText}
                  maxLength={70}
                  className="h-8 max-w-xs"
                  onChange={(e) => onChange({ legalText: e.target.value })}
                />
              )}
            </div>
          </div>

          {type.requiresSnies && <SniesGate />}
        </>
      )}
    </div>
  );

  function selectType(id: PieceTypeId) {
    if (id === campaign.pieceType) return;
    const next = pieceTypeById(id);
    const allowed = new Set<FieldId>(next?.fields.map((f) => f.id) ?? []);
    const content: PieceContent = {};
    (Object.keys(campaign.content) as FieldId[]).forEach((k) => {
      if (allowed.has(k)) content[k] = campaign.content[k];
    });
    onChange({ pieceType: id, content, sniesConfirmed: false });
    setPendingConfirm(false);
  }

  function SniesGate() {
    if (campaign.sniesConfirmed) {
      return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
          <p className="text-sm text-foreground">
            <Check className="mr-1.5 inline size-4 text-primary" />
            SNIES confirmado y fijo para los tres formatos:{" "}
            <span className="font-mono font-semibold">{snies}</span>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onChange({ sniesConfirmed: false });
              setPendingConfirm(false);
            }}
          >
            <Pencil className="mr-1.5 size-3.5" />
            Editar
          </Button>
        </div>
      );
    }
    if (pendingConfirm) {
      return (
        <div className="space-y-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-foreground">¿Este es el SNIES correcto?</p>
          <p className="font-mono text-2xl font-bold tracking-wide text-foreground">{snies}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onChange({ sniesConfirmed: true })}>
              Confirmar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPendingConfirm(false)}>
              Editar
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">
          <AlertCircle className="mr-1.5 inline size-4" />
          El resto de la campaña queda bloqueado hasta confirmar el SNIES.
        </p>
        <Button size="sm" disabled={!snies.trim()} onClick={() => setPendingConfirm(true)}>
          Guardar SNIES
        </Button>
      </div>
    );
  }
}
