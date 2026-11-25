# RUNCTY — matriz de trazabilidad

Alcance: demo local Django/MySQL, Angular/Ionic y Android. Fuente íntegra y criterios originales en `requisitos/`. Las limitaciones se declaran expresamente.

| Requisito | Entidad o modelo | Endpoint de la API | Página de la app | Evidencia (captura) | Estado |
|---|---|---|---|---|---|
| RU-02 Recomendar hasta tres rutas por zona, distancia y hora | Zona, Ruta, EvaluacionRuta | GET /api/rutas/recomendar/?zona=&km=&hora= | recomendar.page.ts | C03_web_recomendacion.png; C06_android_recomendacion.png; 07_api_crud.json | Función verificada en demo; latencia 4G no medida |
| RU-03 Características deportivas | Ruta | GET/POST /api/rutas/; GET/PUT/PATCH/DELETE /api/rutas/{id}/ | rutas/ruta-lista.page.ts, ruta-form.page.ts, ruta-detalle.page.ts | 07_api_crud.json; C03_web_recomendacion.png | Distancia, desnivel, superficie y dificultad funcionales; perfil de elevación pendiente |
| RU-07 Índice 0–100 por horario | Ruta.calcular_indice, EvaluacionRuta | GET /api/rutas/recomendar/; GET /api/evaluaciones/{id}/ | recomendar.page.ts, evaluaciones.page.ts | C03_web_recomendacion.png; 05_tests.txt; 09_ng_test.txt | Verificado con factores sintéticos y fecha de cálculo; sin fuente externa de actualización |
| RU-50 Transparencia del índice | EvaluacionRuta.aportes | GET /api/rutas/recomendar/ | recomendar.page.ts, «Ver cómo se calculó» | C03_web_recomendacion.png | Aportes, pesos y aviso orientativo funcionales; información por tramo no implementada |
| RU-52 Reportar peligros sin publicar el autor | ReporteIncidente | GET/POST /api/reportes/; GET/PUT/PATCH/DELETE /api/reportes/{id}/ | reportes/reporte-lista.page.ts, reporte-form.page.ts, reporte-detalle.page.ts | 07_api_crud.json | CRUD y autor write_only verificados; ubicación textual, sin mapa ni roles reales |
| RU-38 Consentimiento antes del reporte | Consentimiento, Corredor | POST/GET /api/consentimientos/; GET/DELETE /api/consentimientos/{id}/ | corredores/corredor-detalle.page.ts | 07_api_crud.json (400 sin consentimiento y tras revocarlo) | Flujo explícito de demo funcional; sesión simulada, sin GPS |
| Gestión de zonas | Zona | GET/POST /api/zonas/; GET/PUT/PATCH/DELETE /api/zonas/{id}/ | zonas/zona-lista.page.ts, zona-form.page.ts, zona-detalle.page.ts | C04_web_validacion.png; C05_web_edicion.png; 07_api_crud.json | CRUD y protección de relaciones verificados |
| Gestión de corredores | Corredor | GET/POST /api/corredores/; GET/PUT/PATCH/DELETE /api/corredores/{id}/ | corredores/corredor-lista.page.ts, corredor-form.page.ts, corredor-detalle.page.ts | 07_api_crud.json; 05_tests.txt | CRUD y consentimiento verificados; identidad simulada |

## Operaciones derivadas y restricciones

EvaluacionRuta se crea al recomendar, se consulta por lista/detalle y se elimina en cascada cuando se elimina su ruta. POST/PATCH manuales no forman parte del dominio y devuelven 405. Consentimiento permite aceptar y revocar; PATCH devuelve 405 para no reescribir lo que se aceptó. Estas restricciones se prueban en 07_api_crud.json.

Las peticiones de CRUD cubren GET, POST, PUT, PATCH y DELETE de las cuatro entidades gestionables; los registros temporales de prueba se eliminan al terminar. No se atribuyen capturas a operaciones que solo se comprobaron por HTTP.
