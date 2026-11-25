import { RunctyEstado } from '../../core/runcty-estado.service';
import { Component, inject } from '@angular/core';
import { UI } from '../../core/ionic';
import { Ruta, Zona } from '../../core/modelos';
import { Avisos } from '../../core/avisos.service';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

@Component({
  selector: 'app-ruta-lista',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/inicio"></ion-back-button></ion-buttons>
        <ion-title>Rutas</ion-title>
        <ion-buttons slot="end"><ion-button routerLink="/rutas/nueva">Nueva</ion-button></ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar placeholder="Buscar ruta" [debounce]="300" (ionInput)="buscar($any($event).detail.value)"></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-select label="Zona" [(ngModel)]="zona" (ionChange)="cargar()" interface="popover">
          <ion-select-option [value]="null">Todas</ion-select-option>
          @for (z of (zonas$ | async) ?? []; track z.id) { <ion-select-option [value]="z.id">{{ z.nombre }}</ion-select-option> }
        </ion-select>
      </ion-item>
      @if (coleccion.error$ | async; as errorCarga) { <ion-text color="danger"><p>{{ errorCarga }}</p></ion-text> }
      <ion-list>
        @for (r of (rutas$ | async) ?? []; track r.id) {
          <ion-item>
            <ion-label [routerLink]="['/rutas', r.id]">
              <h2>{{ r.nombre }}</h2>
              <p>{{ r.zona_nombre }} · {{ r.km }} km · {{ r.desnivel }} m · {{ r.superficie }} · {{ r.dificultad }}</p>
            </ion-label>
            <ion-button slot="end" fill="clear" [routerLink]="['/rutas', r.id, 'editar']">Editar</ion-button>
            <ion-button slot="end" fill="clear" color="danger" (click)="eliminar(r)">Eliminar</ion-button>
          </ion-item>
        } @empty { <ion-item><ion-label>No hay rutas.</ion-label></ion-item> }
      </ion-list>
    </ion-content>
  `,
})
export class RutaListaPage {
  private readonly api = inject(RunctyApi);
  private readonly estado = inject(RunctyEstado);
  readonly coleccion = this.estado.rutas;
  private readonly avisos = inject(Avisos);
  readonly rutas$ = this.coleccion.datos$;
  readonly zonas$ = this.estado.zonas.datos$;
  zona: number | null = null;
  texto = '';
  error = '';

  ionViewWillEnter(): void {
    this.estado.zonas.recargar();
    this.cargar();
  }

  buscar(texto: string | null | undefined): void {
    this.texto = texto ?? '';
    this.cargar();
  }

  cargar(): void {
    this.coleccion.filtrar({ zona: this.zona, search: this.texto });
    this.coleccion.recargar();
  }

  async eliminar(r: Ruta): Promise<void> {
    if (!(await this.avisos.confirmar())) return;
    this.api.rutas.eliminar(r.id).subscribe({
      next: () => { void this.avisos.mostrar('Ruta eliminada.'); this.cargar(); },
      error: (e) => void this.avisos.mostrar(mensajeError(e), 'danger'),
    });
  }
}
