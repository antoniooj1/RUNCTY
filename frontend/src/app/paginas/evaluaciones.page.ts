import { RunctyEstado } from '../core/runcty-estado.service';
import { Component, inject } from '@angular/core';
import { UI } from '../core/ionic';
import { EvaluacionRuta } from '../core/modelos';
import { RunctyApi, mensajeError } from '../core/runcty-api.service';

@Component({
  selector: 'app-evaluaciones',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/inicio"></ion-back-button></ion-buttons>
        <ion-title>Historial de índices</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (estado.evaluaciones.error$ | async; as error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      <ion-list>
        @for (e of (estado.evaluaciones.datos$ | async) ?? []; track e.id) {
          <ion-item [routerLink]="['/evaluaciones', e.id]" detail>
            <ion-label>
              <h2>{{ e.ruta_nombre }}</h2>
              <p>Salida {{ e.hora_salida.slice(0, 5) }} · calculado {{ e.fecha_utc | date: 'short' }}</p>
            </ion-label>
            <ion-badge slot="end">{{ e.indice }}</ion-badge>
          </ion-item>
        } @empty {
          <ion-item><ion-label>Aún no se han calculado índices.</ion-label></ion-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class EvaluacionesPage {
 readonly estado = inject(RunctyEstado);
 ionViewWillEnter(): void { this.estado.evaluaciones.recargar(); }
}
