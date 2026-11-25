import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { Recurso, RunctyApi, mensajeError } from './runcty-api.service';
import { RutaRecomendada } from './modelos';

/** Cada colección mantiene sus filtros, datos y errores; HTTP permanece en RunctyApi. */
export class ColeccionReactiva<T> {
  private readonly recargar$ = new BehaviorSubject<void>(undefined);
  private readonly filtros$ = new BehaviorSubject<Record<string, string | number | null>>({});
  readonly error$ = new BehaviorSubject<string | null>(null);
  readonly datos$;

  constructor(recurso: Recurso<T, any>) {
    this.datos$ = combineLatest([
      this.recargar$,
      this.filtros$.pipe(debounceTime(250), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))),
    ]).pipe(
      switchMap(([, filtros]) => recurso.listar(filtros).pipe(
        tap(() => this.error$.next(null)),
        catchError((e) => { this.error$.next(mensajeError(e)); return of([] as T[]); }),
      )),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
  recargar(): void { this.recargar$.next(); }
  filtrar(filtros: Record<string, string | number | null>): void { this.filtros$.next(filtros); }
}

@Injectable({ providedIn: 'root' })
export class RunctyEstado {
  private readonly api = inject(RunctyApi);
  readonly zonas = new ColeccionReactiva(this.api.zonas);
  readonly corredores = new ColeccionReactiva(this.api.corredores);
  readonly rutas = new ColeccionReactiva(this.api.rutas);
  readonly reportes = new ColeccionReactiva(this.api.reportes);
  readonly evaluaciones = new ColeccionReactiva(this.api.evaluaciones);
  private readonly filtrosRecomendacion$ = new BehaviorSubject<{ zona: number; km: number; hora: string } | null>(null);
  readonly recomendacion$ = this.filtrosRecomendacion$.pipe(
    debounceTime(300),
    switchMap((filtros) => filtros ? this.api.recomendar(filtros.zona, filtros.km, filtros.hora).pipe(
      map((rutas) => ({ rutas, error: '', buscado: true })),
      catchError((e) => of({ rutas: [] as RutaRecomendada[], error: mensajeError(e), buscado: true })),
    ) : of({ rutas: [] as RutaRecomendada[], error: '', buscado: false })),
    tap((r) => { if (r.buscado && !r.error) this.evaluaciones.recargar(); }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  recomendar(zona: number, km: number, hora: string): void { this.filtrosRecomendacion$.next({ zona, km, hora }); }
}
