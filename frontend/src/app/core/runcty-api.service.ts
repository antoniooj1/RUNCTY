import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, reduce } from 'rxjs';

import { urlApi } from './api.config';
import {
  Consentimiento,
  Corredor,
  EvaluacionRuta,
  Pagina,
  ReporteIncidente,
  NuevoReporte,
  Ruta,
  RutaRecomendada,
  Zona,
} from './modelos';

/** Operaciones CRUD de un recurso REST. */
export class Recurso<T, N = Partial<T>> {
  constructor(private readonly http: HttpClient, private readonly url: string) {}

  listar(filtros: Record<string, string | number | undefined | null> = {}): Observable<T[]> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return this.http.get<Pagina<T>>(this.url, { params }).pipe(
      expand((p) => p.next ? this.http.get<Pagina<T>>(p.next) : EMPTY),
      reduce((todos, p) => [...todos, ...p.results], [] as T[]),
    );
  }

  obtener(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}${id}/`);
  }

  crear(datos: N): Observable<T> {
    return this.http.post<T>(this.url, datos);
  }

  actualizar(id: number, datos: Partial<N>): Observable<T> {
    return this.http.patch<T>(`${this.url}${id}/`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}/`);
  }
}

/** Único punto de acceso al backend. Las páginas no usan HttpClient directamente. */
@Injectable({ providedIn: 'root' })
export class RunctyApi {
  private readonly http = inject(HttpClient);
  private readonly base = urlApi();

  readonly corredores = new Recurso<Corredor>(this.http, `${this.base}/corredores/`);
  readonly consentimientos = new Recurso<Consentimiento, { corredor: number }>(this.http, `${this.base}/consentimientos/`);
  readonly zonas = new Recurso<Zona>(this.http, `${this.base}/zonas/`);
  readonly rutas = new Recurso<Ruta>(this.http, `${this.base}/rutas/`);
  readonly evaluaciones = new Recurso<EvaluacionRuta>(this.http, `${this.base}/evaluaciones/`);
  readonly reportes = new Recurso<ReporteIncidente, NuevoReporte>(this.http, `${this.base}/reportes/`);

  /** RU-02 y RU-07: hasta 3 rutas con su índice de seguridad. */
  recomendar(zona: number, km: number, hora: string): Observable<RutaRecomendada[]> {
    const params = new HttpParams().set('zona', zona).set('km', km).set('hora', hora);
    return this.http.get<RutaRecomendada[]>(`${this.base}/rutas/recomendar/`, { params });
  }
}

/** Convierte un error HTTP de Django REST en un mensaje legible. */
export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Sin conexión con el backend. ¿Está en ejecución "python manage.py runserver 0.0.0.0:8000"?';
    }
    if (error.error && typeof error.error === 'object') {
      return Object.values(error.error as Record<string, unknown>).flat().join(' ');
    }
    return `Error ${error.status} del servidor.`;
  }
  return 'Error inesperado.';
}
