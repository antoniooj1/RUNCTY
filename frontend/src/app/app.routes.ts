import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', loadComponent: () => import('./paginas/inicio.page').then((m) => m.InicioPage) },
  { path: 'recomendar', loadComponent: () => import('./paginas/recomendar.page').then((m) => m.RecomendarPage) },

  { path: 'zonas', loadComponent: () => import('./paginas/zonas/zona-lista.page').then((m) => m.ZonaListaPage) },
  { path: 'zonas/nueva', loadComponent: () => import('./paginas/zonas/zona-form.page').then((m) => m.ZonaFormPage) },
  { path: 'zonas/:id', loadComponent: () => import('./paginas/zonas/zona-detalle.page').then((m) => m.ZonaDetallePage) },
  { path: 'zonas/:id/editar', loadComponent: () => import('./paginas/zonas/zona-form.page').then((m) => m.ZonaFormPage) },

  { path: 'rutas', loadComponent: () => import('./paginas/rutas/ruta-lista.page').then((m) => m.RutaListaPage) },
  { path: 'rutas/nueva', loadComponent: () => import('./paginas/rutas/ruta-form.page').then((m) => m.RutaFormPage) },
  { path: 'rutas/:id', loadComponent: () => import('./paginas/rutas/ruta-detalle.page').then((m) => m.RutaDetallePage) },
  { path: 'rutas/:id/editar', loadComponent: () => import('./paginas/rutas/ruta-form.page').then((m) => m.RutaFormPage) },

  { path: 'reportes', loadComponent: () => import('./paginas/reportes/reporte-lista.page').then((m) => m.ReporteListaPage) },
  { path: 'reportes/nuevo', loadComponent: () => import('./paginas/reportes/reporte-form.page').then((m) => m.ReporteFormPage) },
  { path: 'reportes/:id', loadComponent: () => import('./paginas/reportes/reporte-detalle.page').then((m) => m.ReporteDetallePage) },
  { path: 'reportes/:id/editar', loadComponent: () => import('./paginas/reportes/reporte-form.page').then((m) => m.ReporteFormPage) },

  { path: 'corredores', loadComponent: () => import('./paginas/corredores/corredor-lista.page').then((m) => m.CorredorListaPage) },
  { path: 'corredores/nuevo', loadComponent: () => import('./paginas/corredores/corredor-form.page').then((m) => m.CorredorFormPage) },
  { path: 'corredores/:id', loadComponent: () => import('./paginas/corredores/corredor-detalle.page').then((m) => m.CorredorDetallePage) },
  { path: 'corredores/:id/editar', loadComponent: () => import('./paginas/corredores/corredor-form.page').then((m) => m.CorredorFormPage) },

  { path: 'evaluaciones', loadComponent: () => import('./paginas/evaluaciones.page').then((m) => m.EvaluacionesPage) },
  { path: '**', redirectTo: 'inicio' },
];
