import { RunctyEstado } from '../../core/runcty-estado.service';
import { Component, inject } from '@angular/core';
import { UI } from '../../core/ionic';
import { ReporteIncidente, TIPOS_INCIDENTE } from '../../core/modelos';
import { Avisos } from '../../core/avisos.service';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

/** RU-52: reportes públicos (sin autor). */
@Component({
  selector: 'app-reporte-lista',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/inicio"></ion-back-button></ion-buttons>
        <ion-title>Reportes de incidentes</ion-title>
        <ion-buttons slot="end"><ion-button routerLink="/reportes/nuevo">Reportar</ion-button></ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-select label="Tipo" [(ngModel)]="tipo" (ionChange)="cargar()" interface="popover">
          <ion-select-option [value]="null">Todos</ion-select-option>
          @for (t of tipos; track t.valor) { <ion-select-option [value]="t.valor">{{ t.etiqueta }}</ion-select-option> }
        </ion-select>
      </ion-item>
      @if (coleccion.error$ | async; as errorCarga) { <ion-text color="danger"><p>{{ errorCarga }}</p></ion-text> }
      <ion-list>
        @for (r of (reportes$ | async) ?? []; track r.id) {
          <ion-item>
            <ion-label [routerLink]="['/reportes', r.id]">
              <h2>{{ r.tipo_display }}</h2>
              <p>{{ r.zona_nombre }} · {{ r.ubicacion }}</p>
              <p>{{ r.fecha_utc | date: 'short' }}</p>
            </ion-label>
            <ion-badge slot="end" color="warning">{{ r.estado_display }}</ion-badge>
            <ion-button slot="end" fill="clear" color="danger" (click)="eliminar(r)">Eliminar</ion-button>
          </ion-item>
        } @empty { <ion-item><ion-label>No hay reportes.</ion-label></ion-item> }
      </ion-list>
    </ion-content>
  `,
})
export class ReporteListaPage {
  private readonly api = inject(RunctyApi);
  private readonly estado = inject(RunctyEstado);
  readonly coleccion = this.estado.reportes;
  private readonly avisos = inject(Avisos);
  readonly tipos = TIPOS_INCIDENTE;
  readonly reportes$ = this.coleccion.datos$;
  tipo: string | null = null;
  error = '';

  ionViewWillEnter(): void { this.cargar(); }

  cargar(): void {
    this.coleccion.filtrar({ tipo: this.tipo });
    this.coleccion.recargar();
  }

  async eliminar(r: ReporteIncidente): Promise<void> {
    if (!(await this.avisos.confirmar())) return;
    this.api.reportes.eliminar(r.id).subscribe({
      next: () => { void this.avisos.mostrar('Reporte eliminado.'); this.cargar(); },
      error: (e) => void this.avisos.mostrar(mensajeError(e), 'danger'),
    });
  }
}
