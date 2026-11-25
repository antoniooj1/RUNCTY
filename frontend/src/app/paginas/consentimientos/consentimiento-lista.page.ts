import { Component, inject } from '@angular/core';
import { UI } from '../../core/ionic';
import { Consentimiento, Corredor } from '../../core/modelos';
import { Avisos } from '../../core/avisos.service';
import { RunctyApi, mensajeError } from '../../core/runcty-api.service';

/** RU-38: consentimientos registrados (aceptar, consultar y revocar). */
@Component({
  selector: 'app-consentimiento-lista',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/inicio"></ion-back-button></ion-buttons>
        <ion-title>Consentimientos</ion-title>
        <ion-buttons slot="end"><ion-button routerLink="/consentimientos/nuevo">Aceptar</ion-button></ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-select label="Corredor" [(ngModel)]="corredor" (ionChange)="cargar()" interface="popover">
          <ion-select-option [value]="null">Todos</ion-select-option>
          @for (c of corredores; track c.id) { <ion-select-option [value]="c.id">{{ c.alias }}</ion-select-option> }
        </ion-select>
      </ion-item>
      @if (error) { <ion-text color="danger"><p>{{ error }}</p></ion-text> }
      <ion-list>
        @for (c of consentimientos; track c.id) {
          <ion-item>
            <ion-label [routerLink]="['/consentimientos', c.id]">
              <h2>{{ c.corredor_alias }}</h2>
              <p>Versión {{ c.version }} · {{ c.fecha_utc | date: 'medium' }}</p>
            </ion-label>
            <ion-button slot="end" fill="clear" [routerLink]="['/consentimientos', c.id]">Ver</ion-button>
            <ion-button slot="end" fill="clear" color="danger" (click)="revocar(c)">Revocar</ion-button>
          </ion-item>
        } @empty { <ion-item><ion-label>No hay consentimientos registrados.</ion-label></ion-item> }
      </ion-list>
    </ion-content>
  `,
})
export class ConsentimientoListaPage {
  private readonly api = inject(RunctyApi);
  private readonly avisos = inject(Avisos);
  consentimientos: Consentimiento[] = [];
  corredores: Corredor[] = [];
  corredor: number | null = null;
  error = '';

  ionViewWillEnter(): void {
    this.api.corredores.listar().subscribe((c) => (this.corredores = c));
    this.cargar();
  }

  cargar(): void {
    this.api.consentimientos.listar({ corredor: this.corredor }).subscribe({
      next: (d) => { this.consentimientos = d; this.error = ''; },
      error: (e) => (this.error = mensajeError(e)),
    });
  }

  async revocar(c: Consentimiento): Promise<void> {
    if (!(await this.avisos.confirmar('¿Revocar el consentimiento? El corredor ya no podrá reportar incidentes.'))) return;
    this.api.consentimientos.eliminar(c.id).subscribe({
      next: () => { void this.avisos.mostrar('Consentimiento revocado.'); this.cargar(); },
      error: (e) => void this.avisos.mostrar(mensajeError(e), 'danger'),
    });
  }
}
