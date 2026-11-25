import { finalize } from 'rxjs';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI } from '../../core/ionic';
import { ReporteIncidente } from '../../core/modelos';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

@Component({
  selector: 'app-reporte-detalle',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/reportes"></ion-back-button></ion-buttons>
        <ion-title>Reporte</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      @if (reporte) {
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>{{ reporte.zona_nombre }} · {{ reporte.fecha_utc | date: 'medium' }}</ion-card-subtitle>
            <ion-card-title>{{ reporte.tipo_display }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Ubicación: {{ reporte.ubicacion }}</p>
            <p>Estado: <ion-badge color="warning">{{ reporte.estado_display }}</ion-badge></p>
            <ion-button size="small" [routerLink]="['/reportes', reporte.id, 'editar']">Editar</ion-button>
          </ion-card-content>
        </ion-card>
      }
    </ion-content>
  `,
})
export class ReporteDetallePage {
  private readonly api = inject(RunctyApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  reporte?: ReporteIncidente;
  error = '';

  ionViewWillEnter(): void {
    this.api.reportes.obtener(this.id).pipe(finalize(() => this.cdr.markForCheck())).subscribe({ next: (r) => (this.reporte = r), error: (e) => (this.error = mensajeError(e)) });
  }
}
