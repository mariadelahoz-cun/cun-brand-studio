import { useState } from "react";
import { AlertCircle, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MODALIDADES, type CampaignState } from "@/lib/use-campaign";

type Props = {
  campaign: CampaignState;
  onChange: (changes: Partial<CampaignState>) => void;
};

/** Cinco campos exactos. El SNIES nunca se autocompleta ni se sugiere. */
export function CampaignForm({ campaign, onChange }: Props) {
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const complete =
    campaign.programa.trim() &&
    campaign.ciudad.trim() &&
    campaign.modalidad.trim() &&
    campaign.snies.trim() &&
    campaign.objetivo.trim();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="programa">Programa oficial</Label>
          <Input
            id="programa"
            value={campaign.programa}
            maxLength={90}
            onChange={(e) => onChange({ programa: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ciudad">Ciudad o región</Label>
          <Input
            id="ciudad"
            value={campaign.ciudad}
            maxLength={60}
            onChange={(e) => onChange({ ciudad: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modalidad">Modalidad</Label>
          <Select
            value={campaign.modalidad || undefined}
            onValueChange={(v) => onChange({ modalidad: v })}
          >
            <SelectTrigger id="modalidad">
              <SelectValue placeholder="Selecciona modalidad" />
            </SelectTrigger>
            <SelectContent>
              {MODALIDADES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="snies">SNIES oficial</Label>
          <Input
            id="snies"
            value={campaign.snies}
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
            placeholder="Escríbelo tal cual figura en el registro"
            disabled={campaign.sniesConfirmed}
            onChange={(e) => onChange({ snies: e.target.value, sniesConfirmed: false })}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="objetivo">Objetivo o enfoque de campaña</Label>
          <Input
            id="objetivo"
            value={campaign.objetivo}
            maxLength={140}
            onChange={(e) => onChange({ objetivo: e.target.value })}
          />
        </div>
      </div>

      {campaign.sniesConfirmed ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
          <p className="text-sm text-foreground">
            <Check className="mr-1.5 inline size-4 text-primary" />
            SNIES confirmado y fijo para los tres formatos:{" "}
            <span className="font-mono font-semibold">{campaign.snies}</span>
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
      ) : pendingConfirm ? (
        <div className="space-y-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-foreground">¿Este es el SNIES correcto?</p>
          <p className="font-mono text-2xl font-bold tracking-wide text-foreground">
            {campaign.snies}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onChange({ sniesConfirmed: true })}>
              Confirmar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPendingConfirm(false)}>
              Editar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">
            <AlertCircle className="mr-1.5 inline size-4" />
            El resto de la campaña queda bloqueado hasta confirmar el SNIES.
          </p>
          <Button size="sm" disabled={!complete} onClick={() => setPendingConfirm(true)}>
            Guardar SNIES
          </Button>
        </div>
      )}
    </div>
  );
}
