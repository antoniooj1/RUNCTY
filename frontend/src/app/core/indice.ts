/** Fórmula del prototipo. El servidor conserva la autoridad sobre el índice. */
export const PESOS = { iluminacion: 0.30, afluencia: 0.20, incidentes: 0.25, apoyo: 0.15, hora: 0.10 };

export function calcularIndice(iluminacion: number, afluencia: number, apoyo: number, incidentes: number, reportes: number, hora: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) throw new RangeError('Hora inválida');
  if ([iluminacion, afluencia, apoyo].some((v) => !Number.isFinite(v) || v < 0 || v > 100) || incidentes < 0 || reportes < 0) throw new RangeError('Factores inválidos');
  const h = Number(hora.slice(0, 2));
  const tramo = h >= 7 && h < 18 ? 90 : 45;
  const score = iluminacion * PESOS.iluminacion + afluencia * PESOS.afluencia + Math.max(0, 100 - 16 * incidentes - 6 * reportes) * PESOS.incidentes + apoyo * PESOS.apoyo + tramo * PESOS.hora;
  return Math.min(100, Math.max(0, Math.floor(score + 0.5)));
}

export function colorIndice(indice: number): 'success' | 'warning' | 'danger' {
  return indice >= 70 ? 'success' : indice >= 50 ? 'warning' : 'danger';
}
