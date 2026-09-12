export const KENYA_TIME_ZONE = 'Africa/Nairobi';

/** Formats stored HH:mm lesson times as Kenyan 12-hour clock times. */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;

  const date = new Date(Date.UTC(1970, 0, 1, hours, minutes));
  return date.toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

export function formatKenyaDate(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  return date.toLocaleDateString('en-KE', {
    ...options,
    timeZone: KENYA_TIME_ZONE,
  });
}

export function formatKenyaTime(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  return date.toLocaleTimeString('en-KE', {
    ...options,
    hour12: true,
    timeZone: KENYA_TIME_ZONE,
  });
}
