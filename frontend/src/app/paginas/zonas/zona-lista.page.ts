import { RunctyEstado } from '../../core/runcty-estado.service';
import { Component, inject } from '@angular/core';
import { UI } from '../../core/ionic';
import { Zona } from '../../core/modelos';
import { Avisos } from '../../core/avisos.service';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

@Component({
  selector: 'app-zona-lista',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/inicio"></ion-back-button></ion-buttons>
        <ion-title>Zonas</ion-title>
        <ion-buttons slot="end"><ion-button routerLink="/zonas/nueva">Nueva</ion-button></ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (coleccion.error$ | async; as errorCarga) { <ion-text color="danger"><p>{{ errorCarga }}</p></ion-text> }
      <ion-list>
        @for (z of (zonas$ | async) ?? []; track z.id) {
          <ion-item>
            <ion-label [routerLink]="['/zonas', z.id]"><h2>{{ z.nombre }}</h2><p>{{ z.total_rutas }} ruta(s)</p></ion-label>
            <ion-button slot="end" fill="clear" [routerLink]="['/zonas', z.id, 'editar']">Editar</ion-button>
            <ion-button slot="end" fill="clear" color="danger" (click)="eliminar(z)">Eliminar</ion-button>
          </ion-item>
        } @empty { <ion-item><ion-label>No hay zonas.</ion-label></ion-item> }
      </ion-list>
    </ion-content>
  `,
})
export class ZonaListaPage {
  private readonly api = inject(RunctyApi);
  private readonly estado = inject(RunctyEstado);
  readonly coleccion = this.estado.zonas;
  private readonly avisos = inject(Avisos);
  readonly zonas$ = this.coleccion.datos$;
  error = '';

  ionViewWillEnter(): void { this.cargar(); }

  cargar(): void {
    this.coleccion.filtrar({});
    this.coleccion.recargar();
  }

  async eliminar(z: Zona): Promise<void> {
    if (!(await this.avisos.confirmar())) return;
    this.api.zonas.eliminar(z.id).subscribe({
      next: () => { void this.avisos.mostrar('Zona eliminada.'); this.cargar(); },
      error: (e) => void this.avisos.mostrar(mensajeError(e), 'danger'),
    });
  }
}
