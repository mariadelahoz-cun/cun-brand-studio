import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  COPY_FIELD_LABELS,
  CTA_ROUTE_LABELS,
  MAX_WORDS,
  bannedWordsInField,
  validateCopy,
  type CopyFields,
} from "@/lib/copy-rules";

type Props = {
  copy: CopyFields;
  onChange: (copy: CopyFields) => void;
  programa: string;
  modalidad: string;
  ciudad: string;
  snies: string;
};

const ORDER: (keyof CopyFields)[] = ["titular", "remate", "beneficio", "cta", "micro1", "micro2"];

export function CopyPanel({ copy, onChange, programa, modalidad, ciudad, snies }: Props) {
  const v = validateCopy(copy);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={v.approved ? "default" : "destructive"}>
          Validación léxica: {v.approved ? "APROBADA" : "RECHAZADA"}
        </Badge>
        <Badge variant={v.wordsOk ? "secondary" : "destructive"}>
          Conteo de copy: {v.wordCount}/{MAX_WORDS} palabras
        </Badge>
        <Badge variant={v.cta.ok ? "secondary" : "destructive"}>
          CTA: {v.cta.ok ? "válido" : v.cta.message}
        </Badge>
      </div>

      <div className="grid gap-3">
        {ORDER.map((field) => {
          const hits = bannedWordsInField(copy, field);
          return (
            <div key={field} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field}>{COPY_FIELD_LABELS[field]}</Label>
                {hits.length > 0 && (
                  <span className="text-xs font-medium text-destructive">
                    Palabra bloqueada: {hits.join(", ")}
                  </span>
                )}
              </div>
              <Input
                id={field}
                value={copy[field]}
                maxLength={field === "titular" ? 60 : 90}
                onChange={(e) => onChange({ ...copy, [field]: e.target.value })}
                className={cn(hits.length > 0 && "border-destructive ring-1 ring-destructive/40")}
              />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Rutas de CTA permitidas: {CTA_ROUTE_LABELS.join(" · ")}. Programa, modalidad, ciudad y SNIES
        no cuentan en el conteo de palabras.
      </p>

      <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
        <p className="mb-2 font-semibold text-foreground">Lista blanca de contenido de la pieza</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>a) Copy aprobado con CTA y microtextos</li>
          <li>b) Programa oficial: {programa || "—"}</li>
          <li>c) Modalidad: {modalidad || "—"} · {ciudad || "—"}</li>
          <li>d) SNIES confirmado: {snies || "—"}</li>
        </ul>
      </div>
    </div>
  );
}
