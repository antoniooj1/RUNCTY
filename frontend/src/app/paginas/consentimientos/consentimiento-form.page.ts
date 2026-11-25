import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '../../core/ionic';
import { Corredor } from '../../core/modelos';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

/** RU-38: aceptar el consentimiento explícito de uso de la ubicación (LOPDP). */
@Component({
  selector: 'app-consentimiento-form',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/consentimientos"></ion-back-button></ion-buttons>
        <ion-title>Aceptar consentimiento</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header><ion-card-title>Uso de la ubicación</ion-card-title></ion-card-header>
        <ion-card-content>
          RUNCTY usa la ubicación que indicas en los reportes solo para mostrar peligros en las rutas.
          Tu alias no se publica. Puedes revocar este consentimiento cuando quieras.
          La aplicación no reemplaza la llamada al 911.
        </ion-card-content>
      </ion-card>
      <ion-list>
        <ion-item>
          <ion-select label="Corredor" labelPlacement="stacked" [(ngModel)]="corredor" interface="popover" placeholder="Selecciona el corredor">
            @for (c of corredores; track c.id) {
              <ion-select-option [value]="c.id">{{ c.alias }}{{ c.consentimiento_vigente ? ' (ya aceptó)' : '' }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
      </ion-list>
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      <ion-button expand="block" color="success" (click)="aceptar()">Acepto el consentimiento</ion-button>
    </ion-content>
  `,
})
export class ConsentimientoFormPage {
  private readonly api = inject(RunctyApi);
  private readonly router = inject(Router);
  corredores: Corredor[] = [];
  corredor: number | null = Number(inject(ActivatedRoute).snapshot.queryParamMap.get('corredor')) || null;
  error = '';

  constructor() {
    this.api.corredores.listar().subscribe((c) => (this.corredores = c));
  }

  aceptar(): void {
    this.error = '';
    // Se envía tal cual: si falta el corredor o ya aceptó, el backend responde 400 y aquí se muestra.
    this.api.consentimientos.crear({ corredor: this.corredor ?? 0 }).subscribe({
      next: (c) => void this.router.navigate(['/consentimientos', c.id], { replaceUrl: true }),
      error: (e) => (this.error = mensajeError(e)),
    });
  }
}
