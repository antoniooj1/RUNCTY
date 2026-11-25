import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI } from '../../core/ionic';
import { colorIndice } from '../../core/indice';
import { EvaluacionRuta } from '../../core/modelos';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

/** RU-07 y RU-50: detalle de un índice calculado y el aporte de cada factor. */
@Component({
  selector: 'app-evaluacion-detalle',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/evaluaciones"></ion-back-button></ion-buttons>
        <ion-title>Detalle del índice</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      @if (evaluacion; as e) {
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>Salida {{ e.hora_salida.slice(0, 5) }} · calculado {{ e.fecha_utc | date: 'medium' }}</ion-card-subtitle>
            <ion-card-title>
              {{ e.ruta_nombre }}
              <ion-badge [color]="color(e.indice)">Índice {{ e.indice }}/100</ion-badge>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-progress-bar [value]="e.indice / 100" [color]="color(e.indice)"></ion-progress-bar>
            <ion-list>
              <ion-list-header><ion-label>Aporte de cada factor</ion-label></ion-list-header>
              @for (a of e.aportes; track a.factor) {
                <ion-item lines="none"><ion-label>{{ a.factor }}</ion-label><ion-note slot="end">{{ a.valor | number: '1.0-1' }}</ion-note></ion-item>
              }
            </ion-list>
            <ion-note>Índice orientativo calculado con datos sintéticos.</ion-note>
            <p><ion-button size="small" fill="outline" [routerLink]="['/rutas', e.ruta]">Ver ruta</ion-button></p>
          </ion-card-content>
        </ion-card>
      }
    </ion-content>
  `,
})
export class EvaluacionDetallePage {
  private readonly api = inject(RunctyApi);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  protected readonly color = colorIndice;
  evaluacion?: EvaluacionRuta;
  error = '';

  ionViewWillEnter(): void {
    this.api.evaluaciones.obtener(this.id).subscribe({
      next: (e) => (this.evaluacion = e),
      error: (er) => (this.error = mensajeError(er)),
    });
  }
}
