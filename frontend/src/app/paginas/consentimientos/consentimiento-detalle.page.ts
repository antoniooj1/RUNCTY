import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '../../core/ionic';
import { Consentimiento } from '../../core/modelos';
import { Avisos } from '../../core/avisos.service';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

@Component({
  selector: 'app-consentimiento-detalle',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/consentimientos"></ion-back-button></ion-buttons>
        <ion-title>Consentimiento</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      @if (consentimiento; as c) {
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>Versión {{ c.version }}</ion-card-subtitle>
            <ion-card-title>{{ c.corredor_alias }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Aceptado el {{ c.fecha_utc | date: 'medium' }}</p>
            <p><ion-badge color="success">Vigente</ion-badge></p>
            <ion-button size="small" fill="outline" [routerLink]="['/corredores', c.corredor]">Ver corredor</ion-button>
            <ion-button size="small" color="danger" (click)="revocar(c)">Revocar</ion-button>
          </ion-card-content>
        </ion-card>
      }
    </ion-content>
  `,
})
export class ConsentimientoDetallePage {
  private readonly api = inject(RunctyApi);
  private readonly avisos = inject(Avisos);
  private readonly router = inject(Router);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  consentimiento?: Consentimiento;
  error = '';

  ionViewWillEnter(): void {
    this.api.consentimientos.obtener(this.id).subscribe({
      next: (c) => (this.consentimiento = c),
      error: (e) => (this.error = mensajeError(e)),
    });
  }

  async revocar(c: Consentimiento): Promise<void> {
    if (!(await this.avisos.confirmar('¿Revocar el consentimiento?'))) return;
    this.api.consentimientos.eliminar(c.id).subscribe({
      next: () => { void this.avisos.mostrar('Consentimiento revocado.'); void this.router.navigate(['/consentimientos'], { replaceUrl: true }); },
      error: (e) => void this.avisos.mostrar(mensajeError(e), 'danger'),
    });
  }
}
