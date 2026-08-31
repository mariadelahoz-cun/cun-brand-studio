/**
 * Puerta de acceso simple para el equipo de mercadeo.
 *
 * OJO: es una verificación del lado del cliente (la contraseña vive en el
 * bundle). Sirve para evitar accesos casuales, no como seguridad real. Para
 * control institucional de verdad, poner el despliegue detrás de Cloudflare
 * Access u otro proxy de identidad.
 */

const PASSWORD = "campañaenciendete";
const KEY = "cun-creativo:auth:v1";

/** minúsculas, sin acentos ni espacios sobrantes */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function checkPassword(input: string): boolean {
  return normalize(input) === normalize(PASSWORD);
}

export function isAuthed(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function grantAccess(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    /* sin persistencia: se volverá a pedir al recargar */
  }
}

export function logout(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.location.reload();
}
