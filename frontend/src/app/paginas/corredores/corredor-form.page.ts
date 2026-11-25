import { finalize } from 'rxjs';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '../../core/ionic';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

@Component({
  selector: 'app-corredor-form',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/corredores"></ion-back-button></ion-buttons>
        <ion-title>{{ id ? 'Editar' : 'Nuevo' }} corredor</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item><ion-input label="Alias" labelPlacement="stacked" [(ngModel)]="alias"></ion-input></ion-item>
      </ion-list>
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      <ion-button expand="block" (click)="guardar()">Guardar</ion-button>
    </ion-content>
  `,
})
export class CorredorFormPage {
  private readonly api = inject(RunctyApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  alias = '';
  error = '';

  constructor() {
    if (this.id) this.api.corredores.obtener(this.id).pipe(finalize(() => this.cdr.markForCheck())).subscribe((c) => (this.alias = c.alias));
  }

  guardar(): void {
    const peticion = this.id ? this.api.corredores.actualizar(this.id, { alias: this.alias }) : this.api.corredores.crear({ alias: this.alias });
    peticion.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: (c) => void this.router.navigate(['/corredores', c.id], { replaceUrl: true }),
      error: (e) => (this.error = mensajeError(e)),
    });
  }
}
