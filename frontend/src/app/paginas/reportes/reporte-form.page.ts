import { finalize } from 'rxjs';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '../../core/ionic';
import { Corredor, NuevoReporte, TIPOS_INCIDENTE, Zona } from '../../core/modelos';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

/** RU-52: reportar un peligro. Requiere consentimiento (RU-38); el autor no se publica. */
@Component({
  selector: 'app-reporte-form',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/reportes"></ion-back-button></ion-buttons>
        <ion-title>{{ id ? 'Editar' : 'Nuevo' }} reporte</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-select label="Corredor (sesión simulada)" labelPlacement="stacked" [(ngModel)]="r.autor" interface="popover">
            @for (c of corredores; track c.id) {
              <ion-select-option [value]="c.id">{{ c.alias }}{{ c.consentimiento_vigente ? '' : ' (sin consentimiento)' }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select label="Zona" labelPlacement="stacked" [(ngModel)]="r.zona" interface="popover">
            @for (z of zonas; track z.id) { <ion-select-option [value]="z.id">{{ z.nombre }}</ion-select-option> }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select label="Tipo de peligro" labelPlacement="stacked" [(ngModel)]="r.tipo" interface="popover">
            @for (t of tipos; track t.valor) { <ion-select-option [value]="t.valor">{{ t.etiqueta }}</ion-select-option> }
          </ion-select>
        </ion-item>
        <ion-item><ion-input label="Ubicación" labelPlacement="stacked" placeholder="Ej.: entrada norte del parque" [(ngModel)]="r.ubicacion"></ion-input></ion-item>
      </ion-list>
      <ion-note>Tu alias no se mostrará a otros usuarios. El reporte queda "Sin confirmar".</ion-note>
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      <ion-button expand="block" (click)="guardar()">Enviar reporte</ion-button>
    </ion-content>
  `,
})
export class ReporteFormPage {
  private readonly api = inject(RunctyApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  readonly tipos = TIPOS_INCIDENTE;
  corredores: Corredor[] = [];
  zonas: Zona[] = [];
  r: Partial<NuevoReporte> = { tipo: 'OBSTACULO', ubicacion: '' };
  error = '';

  constructor() {
    this.api.corredores.listar().pipe(finalize(() => this.cdr.markForCheck())).subscribe((c) => (this.corredores = c));
    this.api.zonas.listar().pipe(finalize(() => this.cdr.markForCheck())).subscribe((z) => (this.zonas = z));
    if (this.id) {
      this.api.reportes.obtener(this.id).pipe(finalize(() => this.cdr.markForCheck())).subscribe((d) => (this.r = { ...this.r, zona: d.zona, tipo: d.tipo, ubicacion: d.ubicacion }));
    }
  }

  guardar(): void {
    const datos = this.r as NuevoReporte;
    const peticion = this.id ? this.api.reportes.actualizar(this.id, datos) : this.api.reportes.crear(datos);
    peticion.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: (rep) => void this.router.navigate(['/reportes', rep.id], { replaceUrl: true }),
      error: (e) => (this.error = mensajeError(e)),
    });
  }
}
