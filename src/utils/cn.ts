type ClassValue = string | number | false | null | undefined;

/** Minimal className joiner. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
