import { Component } from '@angular/core';
import { UI } from '../core/ionic';

@Component({
  selector: 'app-inicio',
  imports: [...UI],
  template: `
    <ion-header>
      <ion-toolbar color="primary"><ion-title>RUNCTY · Rutas seguras en Loja</ion-title></ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button expand="block" routerLink="/recomendar">Buscar rutas recomendadas</ion-button>
      <ion-list>
        <ion-item routerLink="/rutas" detail><ion-label>Rutas</ion-label></ion-item>
        <ion-item routerLink="/zonas" detail><ion-label>Zonas</ion-label></ion-item>
        <ion-item routerLink="/reportes" detail><ion-label>Reportes de incidentes</ion-label></ion-item>
        <ion-item routerLink="/corredores" detail><ion-label>Corredores y consentimiento</ion-label></ion-item>
        <ion-item routerLink="/evaluaciones" detail><ion-label>Historial de índices</ion-label></ion-item>
      </ion-list>
      <ion-note>El índice de seguridad es orientativo y usa datos sintéticos. La aplicación no reemplaza al 911.</ion-note>
    </ion-content>
  `,
})
export class InicioPage {}
