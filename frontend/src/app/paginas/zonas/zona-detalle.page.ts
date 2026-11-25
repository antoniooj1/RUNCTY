import { finalize } from 'rxjs';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI } from '../../core/ionic';
import { Ruta, Zona } from '../../core/modelos';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

@Component({
  selector: 'app-zona-detalle',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/zonas"></ion-back-button></ion-buttons>
        <ion-title>Zona</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      @if (zona) {
        <ion-card>
          <ion-card-header><ion-card-title>{{ zona.nombre }}</ion-card-title></ion-card-header>
          <ion-card-content><ion-button size="small" [routerLink]="['/zonas', zona.id, 'editar']">Editar</ion-button></ion-card-content>
        </ion-card>
        <ion-list-header><ion-label>Rutas de la zona</ion-label></ion-list-header>
        <ion-list>
          @for (r of rutas; track r.id) {
            <ion-item [routerLink]="['/rutas', r.id]" detail><ion-label>{{ r.nombre }}</ion-label><ion-note slot="end">{{ r.km }} km</ion-note></ion-item>
          } @empty { <ion-item><ion-label>Sin rutas.</ion-label></ion-item> }
        </ion-list>
      }
    </ion-content>
  `,
})
export class ZonaDetallePage {
  private readonly api = inject(RunctyApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  zona?: Zona;
  rutas: Ruta[] = [];
  error = '';

  ionViewWillEnter(): void {
    this.api.zonas.obtener(this.id).pipe(finalize(() => this.cdr.markForCheck())).subscribe({ next: (z) => (this.zona = z), error: (e) => (this.error = mensajeError(e)) });
    this.api.rutas.listar({ zona: this.id }).pipe(finalize(() => this.cdr.markForCheck())).subscribe((r) => (this.rutas = r));
  }
}
