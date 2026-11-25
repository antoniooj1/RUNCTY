import { finalize } from 'rxjs';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI } from '../../core/ionic';
import { EvaluacionRuta, Ruta } from '../../core/modelos';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

/** RU-03: características deportivas de la ruta y sus últimos índices calculados. */
@Component({
  selector: 'app-ruta-detalle',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/rutas"></ion-back-button></ion-buttons>
        <ion-title>Ruta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      @if (ruta) {
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>{{ ruta.zona_nombre }}</ion-card-subtitle>
            <ion-card-title>{{ ruta.nombre }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Distancia: {{ ruta.km }} km · Desnivel: {{ ruta.desnivel }} m</p>
            <p>Superficie: {{ ruta.superficie }} · Dificultad: {{ ruta.dificultad }}</p>
            <p>Iluminación {{ ruta.iluminacion }} · Afluencia {{ ruta.afluencia }} · Apoyo {{ ruta.apoyo }} · Incidentes base {{ ruta.incidentes_base }}</p>
            <ion-button size="small" [routerLink]="['/rutas', ruta.id, 'editar']">Editar</ion-button>
          </ion-card-content>
        </ion-card>
        <ion-list-header><ion-label>Últimos índices calculados</ion-label></ion-list-header>
        <ion-list>
          @for (e of evaluaciones; track e.id) {
            <ion-item><ion-label>Salida {{ e.hora_salida.slice(0, 5) }} · {{ e.fecha_utc | date: 'short' }}</ion-label><ion-badge slot="end">{{ e.indice }}</ion-badge></ion-item>
          } @empty { <ion-item><ion-label>Sin cálculos todavía.</ion-label></ion-item> }
        </ion-list>
      }
    </ion-content>
  `,
})
export class RutaDetallePage {
  private readonly api = inject(RunctyApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  ruta?: Ruta;
  evaluaciones: EvaluacionRuta[] = [];
  error = '';

  ionViewWillEnter(): void {
    this.api.rutas.obtener(this.id).pipe(finalize(() => this.cdr.markForCheck())).subscribe({ next: (r) => (this.ruta = r), error: (e) => (this.error = mensajeError(e)) });
    this.api.evaluaciones.listar({ ruta: this.id }).pipe(finalize(() => this.cdr.markForCheck())).subscribe((e) => (this.evaluaciones = e));
  }
}
