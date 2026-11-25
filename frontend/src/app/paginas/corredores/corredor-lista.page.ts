import { RunctyEstado } from '../../core/runcty-estado.service';
import { Component, inject } from '@angular/core';
import { UI } from '../../core/ionic';
import { Corredor } from '../../core/modelos';
import { Avisos } from '../../core/avisos.service';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

@Component({
  selector: 'app-corredor-lista',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/inicio"></ion-back-button></ion-buttons>
        <ion-title>Corredores</ion-title>
        <ion-buttons slot="end"><ion-button routerLink="/corredores/nuevo">Nuevo</ion-button></ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (coleccion.error$ | async; as errorCarga) { <ion-text color="danger"><p>{{ errorCarga }}</p></ion-text> }
      <ion-list>
        @for (c of (corredores$ | async) ?? []; track c.id) {
          <ion-item>
            <ion-label [routerLink]="['/corredores', c.id]"><h2>{{ c.alias }}</h2></ion-label>
            <ion-badge slot="end" [color]="c.consentimiento_vigente ? 'success' : 'medium'">
              {{ c.consentimiento_vigente ? 'Consentimiento aceptado' : 'Sin consentimiento' }}
            </ion-badge>
            <ion-button slot="end" fill="clear" [routerLink]="['/corredores', c.id, 'editar']">Editar</ion-button>
            <ion-button slot="end" fill="clear" color="danger" (click)="eliminar(c)">Eliminar</ion-button>
          </ion-item>
        } @empty { <ion-item><ion-label>No hay corredores.</ion-label></ion-item> }
      </ion-list>
    </ion-content>
  `,
})
export class CorredorListaPage {
  private readonly api = inject(RunctyApi);
  private readonly estado = inject(RunctyEstado);
  readonly coleccion = this.estado.corredores;
  private readonly avisos = inject(Avisos);
  readonly corredores$ = this.coleccion.datos$;
  error = '';

  ionViewWillEnter(): void { this.cargar(); }

  cargar(): void {
    this.coleccion.filtrar({});
    this.coleccion.recargar();
  }

  async eliminar(c: Corredor): Promise<void> {
    if (!(await this.avisos.confirmar())) return;
    this.api.corredores.eliminar(c.id).subscribe({
      next: () => { void this.avisos.mostrar('Corredor eliminado.'); this.cargar(); },
      error: (e) => void this.avisos.mostrar(mensajeError(e), 'danger'),
    });
  }
}
