import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'edu.utpl.runcty',
  appName: 'RUNCTY',
  webDir: 'dist/frontend/browser',
  server: {
    // Solo desarrollo: permite llamar al backend http://10.0.2.2:8000 desde el emulador.
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
