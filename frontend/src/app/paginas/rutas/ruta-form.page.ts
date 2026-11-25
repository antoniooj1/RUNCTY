import { finalize } from 'rxjs';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '../../core/ionic';
import { Ruta, Zona } from '../../core/modelos';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

@Component({
  selector: 'app-ruta-form',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/rutas"></ion-back-button></ion-buttons>
        <ion-title>{{ id ? 'Editar' : 'Nueva' }} ruta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-select label="Zona" labelPlacement="stacked" [(ngModel)]="r.zona" interface="popover">
            @for (z of zonas; track z.id) { <ion-select-option [value]="z.id">{{ z.nombre }}</ion-select-option> }
          </ion-select>
        </ion-item>
        <ion-item><ion-input label="Nombre" labelPlacement="stacked" [(ngModel)]="r.nombre"></ion-input></ion-item>
        <ion-item><ion-input label="Distancia (km)" labelPlacement="stacked" type="number" [(ngModel)]="r.km"></ion-input></ion-item>
        <ion-item><ion-input label="Desnivel acumulado (m)" labelPlacement="stacked" type="number" [(ngModel)]="r.desnivel"></ion-input></ion-item>
        <ion-item>
          <ion-select label="Superficie" labelPlacement="stacked" [(ngModel)]="r.superficie" interface="popover">
            <ion-select-option value="Pavimento">Pavimento</ion-select-option>
            <ion-select-option value="Mixta">Mixta</ion-select-option>
            <ion-select-option value="Tierra">Tierra</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select label="Dificultad" labelPlacement="stacked" [(ngModel)]="r.dificultad" interface="popover">
            <ion-select-option value="Baja">Baja</ion-select-option>
            <ion-select-option value="Media">Media</ion-select-option>
            <ion-select-option value="Alta">Alta</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-list-header><ion-label>Factores del índice (0 a 100)</ion-label></ion-list-header>
        <ion-item><ion-input label="Iluminación" labelPlacement="stacked" type="number" [(ngModel)]="r.iluminacion"></ion-input></ion-item>
        <ion-item><ion-input label="Afluencia" labelPlacement="stacked" type="number" [(ngModel)]="r.afluencia"></ion-input></ion-item>
        <ion-item><ion-input label="Puntos de apoyo" labelPlacement="stacked" type="number" [(ngModel)]="r.apoyo"></ion-input></ion-item>
        <ion-item><ion-input label="Incidentes base" labelPlacement="stacked" type="number" [(ngModel)]="r.incidentes_base"></ion-input></ion-item>
      </ion-list>
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      <ion-button expand="block" (click)="guardar()">Guardar</ion-button>
    </ion-content>
  `,
})
export class RutaFormPage {
  private readonly api = inject(RunctyApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  zonas: Zona[] = [];
  r: Partial<Ruta> = { superficie: 'Pavimento', dificultad: 'Baja', incidentes_base: 0 };
  error = '';

  constructor() {
    this.api.zonas.listar().pipe(finalize(() => this.cdr.markForCheck())).subscribe((z) => (this.zonas = z));
    if (this.id) this.api.rutas.obtener(this.id).pipe(finalize(() => this.cdr.markForCheck())).subscribe((r) => (this.r = r));
  }

  guardar(): void {
    const { id, zona_nombre, ...datos } = this.r;
    const peticion = this.id ? this.api.rutas.actualizar(this.id, datos) : this.api.rutas.crear(datos);
    peticion.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: (r) => void this.router.navigate(['/rutas', r.id], { replaceUrl: true }),
      error: (e) => (this.error = mensajeError(e)),
    });
  }
}
