export const DEFAULT_TIMEZONE = "Asia/Shanghai";

export function formatCurrentDate(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: DEFAULT_TIMEZONE,
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export function formatDateTime(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: DEFAULT_TIMEZONE,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
}

export function localDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function isToday(value?: string | null) {
  return Boolean(value && localDateKey(new Date(value)) === localDateKey());
}

export function addToDate(value: string | null, amount: number, unit: "day" | "week" | "month") {
  const date = value ? new Date(value) : new Date();
  if (unit === "day") date.setDate(date.getDate() + amount);
  if (unit === "week") date.setDate(date.getDate() + amount * 7);
  if (unit === "month") date.setMonth(date.getMonth() + amount);
  return date.toISOString();
}
