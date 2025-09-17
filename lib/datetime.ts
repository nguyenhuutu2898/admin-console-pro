const pad = (value: number) => value.toString().padStart(2, "0");

export function formatDatePart(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toLocalISOString(date: Date) {
  const datePart = formatDatePart(date);
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const tzOffsetMinutes = -date.getTimezoneOffset();
  const sign = tzOffsetMinutes >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(tzOffsetMinutes) / 60));
  const offsetMinutes = pad(Math.abs(tzOffsetMinutes) % 60);

  return `${datePart}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
}

export function createDateFromParts(date: string, hour: string, minute: string) {
  if (!date) {
    return null;
  }

  const [yearStr, monthStr, dayStr] = date.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  const hours = Number(hour);
  const minutes = Number(minute);

  return new Date(year, month, day, Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
}

export function parseLocalDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2})?(?:([+-]\d{2}:\d{2})|Z)$/);
  if (isoMatch) {
    return { date: isoMatch[1], hour: isoMatch[2], minute: isoMatch[3] } as const;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { date: trimmed, hour: "00", minute: "00" } as const;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      date: formatDatePart(parsed),
      hour: pad(parsed.getHours()),
      minute: pad(parsed.getMinutes()),
    } as const;
  }

  return null;
}

export function formatPartsToLocalISOString(date: string, hour: string, minute: string) {
  const constructed = createDateFromParts(date, hour, minute);
  if (!constructed) {
    return null;
  }

  return toLocalISOString(constructed);
}
