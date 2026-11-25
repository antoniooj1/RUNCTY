# Defensa individual de RUNCTY

## Explicación en un minuto

RUNCTY recomienda hasta tres rutas de Loja por zona, distancia y hora. Django consulta MySQL, calcula un índice orientativo con factores sintéticos y conserva cada evaluación. Angular e Ionic muestran los mismos datos en web y Android. Capacitor empaqueta la web y Android llega a Django mediante 10.0.2.2:8000.

## Modelos y relaciones

- Zona tiene rutas. Ruta guarda distancia, desnivel, superficie, dificultad y factores del índice.
- Corredor tiene un alias y sus Consentimientos versionados con fecha UTC.
- ReporteIncidente relaciona corredor y zona; exige consentimiento y no publica el autor en el JSON.
- EvaluacionRuta guarda el índice, la hora solicitada, fecha de cálculo y aportes.
- PROTECT evita borrar zonas o corredores con dependencias. Al borrar una ruta, CASCADE elimina sus evaluaciones.

## Recorrido del código

`config/settings.py` carga .env, MySQL, CORS y DRF. `models.py` define entidades; `serializers.py` valida y convierte datos; `views.py` implementa CRUD y recomendación; `urls.py` publica rutas; `admin.py` registra los modelos. `makemigrations` describe cambios y `migrate` los aplica.

`core/modelos.ts` describe los JSON. `RunctyApi` hace HTTP, incluido el recorrido de páginas del backend. `RunctyEstado` mantiene las colecciones y filtros con BehaviorSubject, combina recarga/filtros con combineLatest, cancela consultas anteriores con switchMap, conserva errores con catchError y comparte resultados con shareReplay. AsyncPipe actualiza la interfaz al recibir datos. Las fichas y formularios solicitan detección de cambios al completar HTTP.

`paginas` contiene lista, formulario y detalle para zonas, corredores, rutas y reportes. Los consentimientos están en el detalle del corredor y las evaluaciones en su historial. La app muestra los mensajes 400 del serializador.

## Demostración sugerida (5 minutos)

1. Mostrar /api/docs/ y la base runcty, con sus seis tablas propias.
2. Crear una zona, abrir su detalle, editarla y eliminarla. Intentar guardar el nombre vacío: error 400 visible.
3. Elegir Jipiro, 5 km, 06:00. Mostrar tres rutas, sus índices y el desglose. Comparar con 10:00.
4. Crear un corredor; intentar reportar sin consentimiento; aceptar en el detalle, reportar y verificar que el JSON no devuelve autor; revocar.
5. Repetir una operación en Android y mostrar las pruebas y el commit.

## Fórmula

30 % iluminación + 20 % afluencia + 25 % incidentes + 15 % apoyo + 10 % franja horaria. El componente de incidentes es max(0,100−16·incidentes_base−6·reportes_últimos_30_días). La franja vale 90 entre 07:00 y 17:59; fuera de ahí, 45. Se redondea al entero más cercano. Es orientativo; dos horas de la misma franja pueden dar el mismo valor.

## Qué no afirmar

No afirmar que predice seguridad real, que tiene GPS/mapa o perfil de elevación, que hay autenticación por persona o moderación real, ni que cumple toda la visión futura. Explicar las limitaciones del prototipo y consultar la matriz de trazabilidad. No hay garantía de calificación: la defensa debe demostrar comprensión propia.
