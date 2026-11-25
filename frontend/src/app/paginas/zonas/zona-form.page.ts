import { finalize } from 'rxjs';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '../../core/ionic';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

@Component({
  selector: 'app-zona-form',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/zonas"></ion-back-button></ion-buttons>
        <ion-title>{{ id ? 'Editar' : 'Nueva' }} zona</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item><ion-input label="Nombre" labelPlacement="stacked" [(ngModel)]="nombre"></ion-input></ion-item>
      </ion-list>
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      <ion-button expand="block" (click)="guardar()">Guardar</ion-button>
    </ion-content>
  `,
})
export class ZonaFormPage {
  private readonly api = inject(RunctyApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  nombre = '';
  error = '';

  constructor() {
    if (this.id) this.api.zonas.obtener(this.id).pipe(finalize(() => this.cdr.markForCheck())).subscribe((z) => (this.nombre = z.nombre));
  }

  guardar(): void {
    const peticion = this.id ? this.api.zonas.actualizar(this.id, { nombre: this.nombre }) : this.api.zonas.crear({ nombre: this.nombre });
    peticion.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: (z) => void this.router.navigate(['/zonas', z.id], { replaceUrl: true }),
      error: (e) => (this.error = mensajeError(e)),
    });
  }
}
