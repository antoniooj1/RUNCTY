import { Capacitor } from '@capacitor/core';

const PUERTO = 8000;

/** Para un teléfono real, escribe aquí la IPv4 de tu PC y añádela a ALLOWED_HOSTS. */
const IP_TELEFONO_REAL = '';

/** Dirección base de la API según dónde se ejecute la app. */
export function urlApi(): string {
  if (Capacitor.getPlatform() === 'android') {
    return `http://${IP_TELEFONO_REAL || '10.0.2.2'}:${PUERTO}/api`;
  }
  return `http://127.0.0.1:${PUERTO}/api`;
}
