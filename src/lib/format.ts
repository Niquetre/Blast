export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Asuncion",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
  const label = new Intl.DateTimeFormat("es-PY", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
  return new Intl.DateTimeFormat("es-PY", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
}

export function weekdayFromISO(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).getUTCDay();
  return wd === 0 ? 7 : wd;
}

export const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function formatGs(amount: number): string {
  const n = Math.round(amount);
  const sign = n < 0 ? "-" : "";
  const body = Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}G. ${body}`;
}

export function studentName(last: string, first: string): string {
  return `${last}, ${first}`;
}

export function weekBounds(iso: string): { start: string; end: string } {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  const wd = date.getUTCDay();
  const mondayOffset = wd === 0 ? -6 : 1 - wd;
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() + mondayOffset);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start: isoUTC(start), end: isoUTC(end) };
}

export function monthBounds(iso: string): { start: string; end: string } {
  const [y, m] = iso.split("-").map(Number);
  const start = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  const end = new Date(Date.UTC(y, m ?? 1, 0));
  return { start: isoUTC(start), end: isoUTC(end) };
}

function isoUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return isoUTC(date);
}

export function fold(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export type Role = "admin" | "treasurer" | "student";

export function roleLabel(role: Role): string {
  if (role === "admin") return "Delegado";
  if (role === "treasurer") return "Tesorera";
  return "Alumno";
}

export function can(role: Role) {
  const money = role === "admin" || role === "treasurer";
  return {
    editFunds: money,
    editBreakfast: money,
    editSchedule: role === "admin",
    editTasks: role === "admin",
    editCalendar: role === "admin",
    editAnnouncements: role === "admin",
    editPolls: role === "admin",
    manageUsers: role === "admin",
    inbox: role === "admin",
    sendMessage: role === "student",
    myProgress: role === "student",
    myStats: role === "student",
    exportFinance: money,
    exportAcademic: role === "admin",
    editSettings: role === "admin",
    vote: role === "student" || role === "treasurer",
    seeMessages: role === "admin" || role === "student",
  };
}

export const SUBJECT_COLORS = ["marigold", "coral", "skywash", "saffron", "mocha", "midnight"] as const;

export function subjectTone(color: string): { bg: string; fg: string } {
  switch (color) {
    case "coral":
      return { bg: "bg-coral", fg: "text-card" };
    case "midnight":
      return { bg: "bg-midnight", fg: "text-card" };
    case "mocha":
      return { bg: "bg-mocha", fg: "text-ink" };
    case "skywash":
      return { bg: "bg-skywash", fg: "text-ink" };
    case "saffron":
      return { bg: "bg-saffron", fg: "text-ink" };
    default:
      return { bg: "bg-marigold", fg: "text-ink" };
  }
}

export const CATEGORY_LABEL: Record<string, string> = {
  birthday: "Cumpleaños",
  task: "Entrega",
  project: "Proyecto",
  exam: "Examen",
  course: "Evento del curso",
  other: "Otra fecha",
};
