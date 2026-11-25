import { RunctyEstado } from '../core/runcty-estado.service';
import { colorIndice } from '../core/indice';
import { Component, inject } from '@angular/core';
import { UI } from '../core/ionic';
import { RutaRecomendada, Zona } from '../core/modelos';
import { RunctyApi, mensajeError } from '../core/runcty-api.service';

/** RU-02, RU-03, RU-07 y RU-50: zona + distancia + hora => hasta 3 rutas con índice y desglose. */
@Component({
  selector: 'app-recomendar',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/inicio"></ion-back-button></ion-buttons>
        <ion-title>Rutas recomendadas</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-select label="Zona" labelPlacement="stacked" [(ngModel)]="zona" interface="popover" placeholder="Selecciona una zona">
            @for (z of (estado.zonas.datos$ | async) ?? []; track z.id) { <ion-select-option [value]="z.id">{{ z.nombre }}</ion-select-option> }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input label="Distancia (km)" labelPlacement="stacked" type="number" [(ngModel)]="km"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Hora de salida" labelPlacement="stacked" type="time" [(ngModel)]="hora"></ion-input>
        </ion-item>
      </ion-list>
      <ion-button expand="block" (click)="buscar()">Buscar rutas</ion-button>

      @if (estado.recomendacion$ | async; as vista) {
      @if (vista.error) { <ion-text color="danger"><p>{{ vista.error }}</p></ion-text> }
      @if (vista.buscado && !vista.error && vista.rutas.length === 0) {
        <p>No hay rutas de esa distancia en la zona elegida. Prueba con otra distancia.</p>
      }

      @for (r of vista.rutas; track r.id) {
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>{{ r.zona_nombre }} · {{ r.km }} km · desnivel {{ r.desnivel }} m</ion-card-subtitle>
            <ion-card-title>
              {{ r.nombre }}
              <ion-badge [color]="color(r.indice)">Índice {{ r.indice }}/100</ion-badge>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Superficie: {{ r.superficie }} · Dificultad: {{ r.dificultad }}</p>
            <ion-progress-bar [value]="r.indice / 100" [color]="color(r.indice)"></ion-progress-bar>
            <ion-button fill="clear" size="small" (click)="abierta = abierta === r.id ? null : r.id">
              {{ abierta === r.id ? 'Ocultar' : 'Ver' }} cómo se calculó
            </ion-button>
            @if (abierta === r.id) {
              <ion-list>
                @for (a of r.aportes; track a.factor) {
                  <ion-item lines="none"><ion-label>{{ a.factor }}</ion-label><ion-note slot="end">{{ a.valor | number: '1.0-1' }}</ion-note></ion-item>
                }
              </ion-list>
              <ion-note>{{ r.aviso }} Calculado: {{ r.fecha_calculo | date: 'short' }}</ion-note>
            }
          </ion-card-content>
        </ion-card>
      }
      }
    </ion-content>
  `,
})
export class RecomendarPage {
 readonly estado = inject(RunctyEstado);
 zona: number | null = null;
 km: number | string = 5;
 hora = '06:00';
 abierta: number | null = null;
 readonly color = colorIndice;
 ionViewWillEnter(): void { this.estado.zonas.recargar(); }
 buscar(): void { this.estado.recomendar(this.zona ?? 0, Number(this.km), (this.hora ?? '').slice(0, 5)); }
}
