import { calcularIndice, colorIndice, PESOS } from './indice';

describe('índice RUNCTY', () => {
  it('pondera y redondea igual que Python', () => {
    expect(calcularIndice(80, 70, 60, 0, 0, '10:00')).toBe(81);
    expect(calcularIndice(80, 70, 60, 0, 0, '05:30')).toBe(77);
  });
  it('respeta las fronteras del horario diurno', () => {
    expect(calcularIndice(80, 70, 60, 0, 0, '06:59')).toBe(77);
    expect(calcularIndice(80, 70, 60, 0, 0, '07:00')).toBe(81);
    expect(calcularIndice(80, 70, 60, 0, 0, '17:59')).toBe(81);
    expect(calcularIndice(80, 70, 60, 0, 0, '18:00')).toBe(77);
  });
  it('los pesos suman uno', () => expect(Object.values(PESOS).reduce((a, b) => a + b)).toBeCloseTo(1));
  it('los reportes recientes reducen el índice', () => expect(calcularIndice(80, 70, 60, 0, 4, '10:00')).toBeLessThan(calcularIndice(80, 70, 60, 0, 0, '10:00')));
  it('limita a cero el aporte de incidentes', () => expect(calcularIndice(0, 0, 0, 999, 999, '00:00')).toBe(5));
  it('rechaza horas inválidas', () => expect(() => calcularIndice(80, 70, 60, 0, 0, '25:00')).toThrow(RangeError));
  it('rechaza factores fuera de rango', () => expect(() => calcularIndice(101, 70, 60, 0, 0, '10:00')).toThrow(RangeError));
  it('colorea correctamente los límites', () => { expect(colorIndice(49)).toBe('danger'); expect(colorIndice(50)).toBe('warning'); expect(colorIndice(69)).toBe('warning'); expect(colorIndice(70)).toBe('success'); });
});
