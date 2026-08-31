import { useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  PIECE_TYPES,
  emptyContent,
  getField,
  pieceTypeById,
  type PieceItem,
  type PieceTypeId,
} from "@/lib/piece-types";
import { bannedWordsFor } from "@/lib/copy-rules";
import { ALL_LOCATIONS, CITIES, LOCATION_CUSTOM, NACIONAL, REGIONS } from "@/lib/regions";
import { LEGAL_PRESETS, type CampaignState, type FixedData } from "@/lib/use-campaign";

type Props = {
  campaign: CampaignState;
  onMeta: (changes: Partial<CampaignState>) => void;
  onPieceType: (id: PieceTypeId) => void;
  onField: (key: string, value: string) => void;
  onAddItem: () => void;
  onUpdateItem: (id: string, changes: Partial<Pick<PieceItem, "text" | "mark">>) => void;
  onToggleItemMark: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onFixed: (changes: Partial<FixedData>) => void;
};

const LEGAL_CUSTOM = "__custom__";

export function CampaignForm({
  campaign,
  onMeta,
  onPieceType,
  onField,
  onAddItem,
  onUpdateItem,
  onToggleItemMark,
  onRemoveItem,
  onFixed,
}: Props) {
  const type = pieceTypeById(campaign.pieceType);
  const content = campaign.pieceType
    ? (campaign.contentByType[campaign.pieceType] ?? emptyContent())
    : emptyContent();

  const legalPreset = LEGAL_PRESETS.includes(campaign.fixed.legalText)
    ? campaign.fixed.legalText
    : LEGAL_CUSTOM;

  const ciudadIsCustom =
    campaign.ciudad.trim().length > 0 && !ALL_LOCATIONS.includes(campaign.ciudad);
  const [pickedOtra, setPickedOtra] = useState(false);
  const showCustomLoc = pickedOtra || ciudadIsCustom;
  const ciudadSelect = showCustomLoc ? LOCATION_CUSTOM : campaign.ciudad;

  return (
    <div className="space-y-6">
      {/* Identificación */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="programa">Nombre de campaña</Label>
          <Input
            id="programa"
            value={campaign.programa}
            maxLength={90}
            placeholder="Solo para el nombre de archivo"
            onChange={(e) => onMeta({ programa: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ciudad">Ciudad o región</Label>
          <Select
            value={ciudadSelect}
            onValueChange={(v) => {
              if (v === LOCATION_CUSTOM) {
                setPickedOtra(true);
              } else {
                setPickedOtra(false);
                onMeta({ ciudad: v });
              }
            }}
          >
            <SelectTrigger id="ciudad">
              <SelectValue placeholder="Elige la cobertura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NACIONAL}>{NACIONAL}</SelectItem>
              <SelectGroup>
                <SelectLabel>Regiones</SelectLabel>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Ciudades</SelectLabel>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectItem value={LOCATION_CUSTOM}>Otra…</SelectItem>
            </SelectContent>
          </Select>
          {showCustomLoc && (
            <Input
              value={campaign.ciudad}
              maxLength={60}
              placeholder="Escribe la ciudad o región"
              onChange={(e) => onMeta({ ciudad: e.target.value })}
            />
          )}
        </div>
      </div>

      {/* Paso: tipo de pieza */}
      <div className="space-y-2">
        <Label>Tipo de pieza</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {PIECE_TYPES.map((t) => {
            const Icon = t.icon;
            const selected = campaign.pieceType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onPieceType(t.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border-2 bg-background p-3 text-left transition-colors",
                  selected ? "border-primary" : "border-border hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{t.label}</span>
                  <span className="block text-xs text-muted-foreground">{t.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campos del tipo elegido */}
      {type ? (
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Campos de: {type.label}
          </p>

          <div className="grid gap-3">
            {type.fields.map((field) => {
              const hits = bannedWordsFor(type, content, field.id);
              const value = getField(content, field.id);
              return (
                <div key={field.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required ? <span className="text-destructive"> *</span> : null}
                    </Label>
                    {hits.length > 0 && (
                      <span className="text-xs font-medium text-destructive">
                        Palabra bloqueada: {hits.join(", ")}
                      </span>
                    )}
                  </div>
                  {field.multiline ? (
                    <Textarea
                      id={field.id}
                      value={value}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder ?? ""}
                      onChange={(e) => onField(field.id, e.target.value)}
                      className={cn(
                        hits.length > 0 && "border-destructive ring-1 ring-destructive/40",
                      )}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      value={value}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder ?? ""}
                      autoComplete="off"
                      spellCheck={field.id !== "snies"}
                      onChange={(e) => onField(field.id, e.target.value)}
                      className={cn(
                        hits.length > 0 && "border-destructive ring-1 ring-destructive/40",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Editor de lista para Informativa */}
          {type.hasItems && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Lista de ítems</Label>
                <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
                  <Plus className="mr-1.5 size-3.5" />
                  Agregar ítem
                </Button>
              </div>
              {content.items.length === 0 ? (
                <p className="rounded-md border border-dashed border-border bg-background p-3 text-xs text-muted-foreground">
                  Aún no hay ítems. Úsalos como lista de verificación (✓) o de advertencia (✗), por
                  ejemplo para piezas de seguridad o fraude.
                </p>
              ) : (
                <div className="space-y-2">
                  {content.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        title={item.mark === "check" ? "Marcado como ✓" : "Marcado como ✗"}
                        onClick={() => onToggleItemMark(item.id)}
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-md border",
                          item.mark === "check"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-destructive bg-destructive/10 text-destructive",
                        )}
                      >
                        {item.mark === "check" ? (
                          <Check className="size-4" />
                        ) : (
                          <X className="size-4" />
                        )}
                      </button>
                      <Input
                        value={item.text}
                        maxLength={120}
                        placeholder="Texto del ítem"
                        onChange={(e) => onUpdateItem(item.id, { text: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          Elige un tipo de pieza para ver solo los campos que necesitas.
        </p>
      )}

      {/* Datos fijos / precargados */}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Datos fijos (precargados y editables)
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="partner">Partner en la franja de logos</Label>
            <Input
              id="partner"
              value={campaign.fixed.partner}
              maxLength={40}
              placeholder="Telecampus u otro"
              onChange={(e) => onFixed({ partner: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp de contacto</Label>
            <Input
              id="whatsapp"
              value={campaign.fixed.whatsapp}
              maxLength={30}
              placeholder="+57 300 000 0000"
              onChange={(e) => onFixed({ whatsapp: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox
              checked={campaign.fixed.legalEnabled}
              onCheckedChange={(v) => onFixed({ legalEnabled: v === true })}
            />
            Incluir línea legal
          </label>
          {campaign.fixed.legalEnabled && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Select
                value={legalPreset}
                onValueChange={(v) => onFixed({ legalText: v === LEGAL_CUSTOM ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEGAL_PRESETS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                  <SelectItem value={LEGAL_CUSTOM}>Texto libre…</SelectItem>
                </SelectContent>
              </Select>
              {legalPreset === LEGAL_CUSTOM && (
                <Input
                  value={campaign.fixed.legalText}
                  maxLength={90}
                  placeholder="Escribe la línea legal"
                  onChange={(e) => onFixed({ legalText: e.target.value })}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
