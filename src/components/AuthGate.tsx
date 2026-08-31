import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/brand";
import { checkPassword, grantAccess, isAuthed } from "@/lib/auth";
import { CunLogo } from "@/components/campaign/CunLogo";

const ACCENT = BRAND.defaultAccent;

export function AuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "in" | "out">("loading");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setStatus(isAuthed() ? "in" : "out");
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (checkPassword(value)) {
      grantAccess();
      setStatus("in");
      return;
    }
    setError(true);
    setValue("");
  }

  if (status === "in") return <>{children}</>;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#1E1B4B" }}
    >
      {status === "out" && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur"
        >
          <div className="mb-6 flex justify-center">
            <CunLogo heightPx={46} variant="white" />
          </div>
          <h1
            className="text-2xl uppercase tracking-wide text-white"
            style={{ fontFamily: BRAND.fontDisplay }}
          >
            CUN Creativo
          </h1>
          <p className="mt-1 text-sm text-white/60">Acceso del equipo de mercadeo</p>

          <div className="mt-6 space-y-1.5 text-left">
            <Label htmlFor="password" className="text-white/80">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
              placeholder="••••••••••••"
            />
            {error && (
              <p className="text-xs font-medium" style={{ color: ACCENT }}>
                Contraseña incorrecta. Intenta de nuevo.
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="mt-5 w-full uppercase tracking-wide text-white hover:opacity-90"
            style={{ backgroundColor: ACCENT, fontFamily: BRAND.fontDisplay }}
          >
            Entrar
          </Button>
        </form>
      )}
    </div>
  );
}
