# Capturas para entregar

Ya guardadas en evidencias:

- C03_web_recomendacion.png: Jipiro, 5 km, 06:00; rutas e índice con aportes.
- C04_web_validacion.png: error real del backend al guardar una zona vacía.
- C05_web_edicion.png: zona creada y editada desde la web.
- C06_android_recomendacion.png: APK RUNCTY conectada a Django con rutas e índices.

Para completar las capturas de la rúbrica, abre RUNCTY en VS Code y toma estas vistas:

1. MySQL: ejecutar `backend/.venv/bin/python backend/verificar_mysql.py` y mostrar `evidencias/04_mysql_tablas.txt`. También puedes usar Workbench con la base runcty y SHOW TABLES; no mostrar contraseñas.
2. Swagger: http://127.0.0.1:8000/api/docs/; abrir GET /api/zonas/, Try it out y Execute. Capturar HTTP 200.
3. CRUD por entidad: crear un registro temporal (201), leerlo y editarlo (200), eliminarlo (204) y volver a consultarlo (404); un valor inválido debe mostrar 400. La secuencia ya está registrada en 07_api_crud.json. Usar registros temporales, sin borrar las rutas de demostración.
4. Consentimiento: en Corredores, aceptar y revocar. Intentar reportar sin aceptar debe mostrar el error; un reporte aceptado nunca devuelve autor.
5. Web: listas, formularios y detalles de zonas, rutas, corredores y reportes.
6. Android: repetir las mismas acciones desde la APK. El backend debe seguir encendido y se accede por 10.0.2.2:8000.
7. Pruebas y Git: tarea «Pruebas backend» y «Pruebas frontend» de VS Code; git log --oneline.

Las evaluaciones se generan al recomendar, son de solo lectura; los consentimientos se aceptan/revocan y no se editan. No presentar un 405 de estas entidades como fallo de CRUD.
