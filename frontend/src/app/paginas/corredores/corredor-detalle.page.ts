import { finalize } from 'rxjs';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI } from '../../core/ionic';
import { Consentimiento, Corredor } from '../../core/modelos';
import { Avisos } from '../../core/avisos.service';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

/** RU-38: aceptar o revocar el consentimiento de uso de la ubicación. */
@Component({
  selector: 'app-corredor-detalle',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/corredores"></ion-back-button></ion-buttons>
        <ion-title>Corredor</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      @if (corredor) {
        <ion-card>
          <ion-card-header><ion-card-title>{{ corredor.alias }}</ion-card-title></ion-card-header>
          <ion-card-content>
            <p>Antes de reportar, RUNCTY necesita tu consentimiento para usar la ubicación (LOPDP).
               La aplicación no reemplaza la llamada al 911.</p>
            @if (corredor.consentimiento_vigente) {
              <ion-badge color="success">Consentimiento aceptado</ion-badge>
            } @else {
              <ion-button size="small" color="success" (click)="aceptar()">Aceptar consentimiento</ion-button>
            }
            <ion-button size="small" [routerLink]="['/corredores', corredor.id, 'editar']">Editar</ion-button>
          </ion-card-content>
        </ion-card>
        <ion-list-header><ion-label>Consentimientos registrados</ion-label></ion-list-header>
        <ion-list>
          @for (c of consentimientos; track c.id) {
            <ion-item>
              <ion-label>Versión {{ c.version }} · {{ c.fecha_utc | date: 'medium' }}</ion-label>
              <ion-button slot="end" fill="clear" color="danger" (click)="revocar(c)">Revocar</ion-button>
            </ion-item>
          } @empty { <ion-item><ion-label>Sin consentimientos.</ion-label></ion-item> }
        </ion-list>
      }
    </ion-content>
  `,
})
export class CorredorDetallePage {
  private readonly api = inject(RunctyApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly avisos = inject(Avisos);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  corredor?: Corredor;
  consentimientos: Consentimiento[] = [];
  error = '';

  ionViewWillEnter(): void { this.cargar(); }

  cargar(): void {
    this.api.corredores.obtener(this.id).pipe(finalize(() => this.cdr.markForCheck())).subscribe({ next: (c) => (this.corredor = c), error: (e) => (this.error = mensajeError(e)) });
    this.api.consentimientos.listar({ corredor: this.id }).pipe(finalize(() => this.cdr.markForCheck())).subscribe((c) => (this.consentimientos = c));
  }

  aceptar(): void {
    this.api.consentimientos.crear({ corredor: this.id }).pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: () => { void this.avisos.mostrar('Consentimiento registrado.'); this.cargar(); },
      error: (e) => void this.avisos.mostrar(mensajeError(e), 'danger'),
    });
  }

  async revocar(c: Consentimiento): Promise<void> {
    if (!(await this.avisos.confirmar('¿Revocar el consentimiento? No podrás reportar incidentes.'))) return;
    this.api.consentimientos.eliminar(c.id).pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: () => this.cargar(),
      error: (e) => void this.avisos.mostrar(mensajeError(e), 'danger'),
    });
  }
}
