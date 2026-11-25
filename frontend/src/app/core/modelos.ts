/** Interfaces con los mismos campos que devuelve la API Django (DCM-01). */

export interface Corredor {
  id: number;
  alias: string;
  consentimiento_vigente: boolean;
}

export interface Consentimiento {
  id: number;
  corredor: number;
  corredor_alias: string;
  version: string;
  fecha_utc: string;
}

export interface Zona {
  id: number;
  nombre: string;
  total_rutas: number;
}

export type Superficie = 'Pavimento' | 'Mixta' | 'Tierra';
export type Dificultad = 'Baja' | 'Media' | 'Alta';

export interface Ruta {
  id: number;
  zona: number;
  zona_nombre: string;
  nombre: string;
  km: string;
  desnivel: number;
  superficie: Superficie;
  dificultad: Dificultad;
  iluminacion: number;
  afluencia: number;
  apoyo: number;
  incidentes_base: number;
}

export interface Aporte {
  factor: string;
  valor: number;
}

export interface RutaRecomendada extends Ruta {
  indice: number;
  aportes: Aporte[];
  evaluacion: number;
  fecha_calculo: string;
  aviso: string;
}

export interface EvaluacionRuta {
  id: number;
  ruta: number;
  ruta_nombre: string;
  indice: number;
  hora_salida: string;
  fecha_utc: string;
  aportes: Aporte[];
}

export type TipoIncidente = 'ILUMINACION' | 'OBSTACULO' | 'VIA';

export const TIPOS_INCIDENTE: { valor: TipoIncidente; etiqueta: string }[] = [
  { valor: 'ILUMINACION', etiqueta: 'Iluminación deficiente' },
  { valor: 'OBSTACULO', etiqueta: 'Obstáculo en el camino' },
  { valor: 'VIA', etiqueta: 'Vía deteriorada' },
];

/** Proyección pública: el autor nunca llega al frontend. */
export interface ReporteIncidente {
  id: number;
  zona: number;
  zona_nombre: string;
  tipo: TipoIncidente;
  tipo_display: string;
  ubicacion: string;
  fecha_utc: string;
  estado: string;
  estado_display: string;
}

export interface NuevoReporte {
  autor: number;
  zona: number;
  tipo: TipoIncidente;
  ubicacion: string;
}

/** Respuesta paginada de Django REST Framework. */
export interface Pagina<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
