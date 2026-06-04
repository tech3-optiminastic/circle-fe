/** Small shared helpers used across services. */

export const todayISO = (): string => new Date().toISOString().split('T')[0];

export const nowISO = (): string => new Date().toISOString();

export const randomId = (prefix: string, span = 900, base = 100): string =>
  `${prefix}-${Math.floor(base + Math.random() * span)}`;
