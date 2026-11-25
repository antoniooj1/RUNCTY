import { Injectable, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class Avisos {
  private readonly alerta = inject(AlertController);
  private readonly toast = inject(ToastController);

  async confirmar(mensaje = '¿Seguro que deseas eliminar este registro?'): Promise<boolean> {
    const a = await this.alerta.create({
      header: 'Confirmar',
      message: mensaje,
      buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Sí', role: 'confirm' }],
    });
    await a.present();
    return (await a.onDidDismiss()).role === 'confirm';
  }

  async mostrar(mensaje: string, color: 'success' | 'danger' = 'success'): Promise<void> {
    const t = await this.toast.create({ message: mensaje, color, duration: 3000 });
    await t.present();
  }
}
