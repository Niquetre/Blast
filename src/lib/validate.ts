export type FileIn = { name: string; mime: string; base64: string };

const FILE_OK = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function asObj(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") throw new Error("Datos inválidos");
  return input as Record<string, unknown>;
}

export function str(value: unknown, label: string, max = 500): string {
  if (typeof value !== "string") throw new Error(`${label} es obligatorio`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} es obligatorio`);
  if (trimmed.length > max) throw new Error(`${label} es demasiado largo`);
  return trimmed;
}

export function optStr(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function isoDate(value: unknown, label: string): string {
  const v = str(value, label, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error(`${label} no es una fecha válida`);
  return v;
}

export function optDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  return isoDate(value, "Fecha");
}

export function clock(value: unknown, label: string): string {
  const v = str(value, label, 5);
  if (!/^\d{2}:\d{2}$/.test(v)) throw new Error(`${label} no es una hora válida`);
  return v;
}

export function intId(value: unknown, label = "Identificador"): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${label} inválido`);
  return n;
}

export function optId(value: unknown): number | null {
  if (value == null || value === "") return null;
  return intId(value);
}

export function amountOf(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (!Number.isInteger(value) || value <= 0) throw new Error("El monto debe ser un entero positivo");
    return value;
  }
  if (typeof value !== "string") throw new Error("Monto inválido");
  const digits = value.replace(/\./g, "").replace(/\s/g, "").replace(/gs?/gi, "");
  if (!/^\d+$/.test(digits)) throw new Error("El monto debe ser un número positivo, sin centavos");
  const n = Number(digits);
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error("El monto debe ser positivo");
  if (n > 1_000_000_000_000) throw new Error("El monto es demasiado grande");
  return n;
}

export function emailOf(value: unknown): string {
  const email = str(value, "Correo", 180).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Correo inválido");
  return email;
}

export function passwordOf(value: unknown): string {
  if (typeof value !== "string" || value.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }
  if (value.length > 80) throw new Error("La contraseña es demasiado larga");
  return value;
}

export function idList(value: unknown, max: number): number[] {
  if (!Array.isArray(value)) throw new Error("Selección inválida");
  const ids = value.map((item) => intId(item, "Alumno"));
  if (new Set(ids).size !== ids.length) throw new Error("Hay un alumno repetido");
  if (ids.length > max) throw new Error("No se puede asignar más de tres alumnos");
  return ids;
}

export function fileOf(value: unknown): FileIn | null {
  if (value == null || value === "") return null;
  const o = asObj(value);
  const name = str(o.name, "Nombre de archivo", 180);
  const mime = str(o.mime, "Tipo de archivo", 120);
  if (!FILE_OK.includes(mime)) throw new Error("Solo se aceptan PDF, JPG, PNG o WebP");
  if (typeof o.base64 !== "string" || !o.base64.trim()) throw new Error("El archivo está vacío");
  const base64 = o.base64.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) throw new Error("Archivo inválido");
  const bytes = Math.floor((base64.length * 3) / 4);
  if (bytes > 1_200_000) throw new Error("El archivo supera 1,2 MB");
  return { name, mime, base64 };
}

export function roleOf(value: unknown): "admin" | "treasurer" | "student" {
  if (value === "admin" || value === "treasurer" || value === "student") return value;
  throw new Error("Rol inválido");
}
