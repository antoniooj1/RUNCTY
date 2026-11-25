# Documento de requisitos de RUNCTY — alcance de esta entrega

Fuente: catálogo de requisitos del proyecto AA02, conservado íntegramente en esta carpeta. Este extracto no sustituye ni altera los criterios originales. La entrega implementa el prototipo local de recomendación, gestión y reportes indicado por el estudiante.

## RU-02 — Solicitud de rutas según distancia y hora de salida

El corredor principiante necesita indicar la distancia que puede correr y su hora de salida y recibir hasta 3 rutas cercanas, para no improvisar el recorrido.

**Aceptación original:** Con zona Jipiro, 5 km y salida 06:00, la aplicación muestra hasta 3 rutas de 4,5 a 5,5 km en ≤ 3 s con red 4G.

**Fuente:** requisitos-v2; Documento de Visión; Acta de Constitución (requisitos-v2 §2.7 (RU-02); §2.6 (NU-08, RF-01); Actividad 3 (CU-01); Visión §4.2 «Obtener rutas recomendadas con información de sus tramos»; §6.1 (C-03); Acta «Requisitos de alto nivel y criterios de éxito»).

## RU-03 — Características deportivas de cada ruta

El corredor principiante necesita conocer la distancia, el desnivel y la dificultad de cada ruta antes de elegirla, para saber si está a su alcance.

**Aceptación original:** Cada ficha de ruta muestra distancia (km), desnivel acumulado (m), dificultad y perfil de elevación.

**Fuente:** requisitos-v2 (requisitos-v2 §2.7 (RU-03); §2.2 (RF-03)).

## RU-07 — Índice de seguridad según la hora de salida

La corredora nocturna o de madrugada necesita ver el índice de seguridad de 0 a 100 de cada ruta para su hora de salida, para elegir el recorrido con mejores condiciones.

**Aceptación original:** Al cambiar la hora de 19:00 a 05:30 el índice se recalcula y se muestra con la fecha de actualización de sus datos.

**Fuente:** requisitos-v2; Documento de Visión; Acta de Constitución (requisitos-v2 §2.7 (RU-07); §2.2 (RF-02); Actividad 3 (HU-01); Visión §5.4 «Índice o nivel de seguridad»; §6.1 (C-04); Acta «Alcance preliminar del proyecto»).

## RU-38 — Consentimiento explícito para el uso de la ubicación

La Autoridad de Protección de Datos Personales necesita que el usuario otorgue su consentimiento explícito antes del primer uso de la ubicación, para cumplir la LOPDP.

**Aceptación original:** Sin aceptar, la aplicación no registra ni comparte posiciones; el consentimiento queda guardado con fecha y hora.

**Fuente:** requisitos-v2; Documento de Visión; Acta de Constitución (requisitos-v2 §2.7 (RU-38); §2.6 (NU-25); §2.3 (RNF-03); Visión §2; §4.1 «Privacidad y control de la ubicación»; §5.4 «Datos y privacidad»; Acta «Riesgos iniciales y supuestos»).

## RU-50 — Comprensión de la evaluación de cada ruta

El corredor necesita conocer las condiciones de los tramos de cada ruta recomendada, los factores considerados en su evaluación y las limitaciones de la información disponible, para decidir entre recorridos.

**Aceptación original:** La presentación indica los factores, las limitaciones y el carácter orientativo (Visión §5.5); al tocar el índice se muestra el aporte de cada variable, la fecha de actualización de los datos y el aviso “índice orientativo” (RF-18).

**Fuente:** Documento de Visión; requisitos-v2; Acta de Constitución (Visión §1.2; §4.1 «Información de seguridad de las rutas, orientativa y transparente»; §5.5; requisitos-v2 §2.6 (NU-09, RF-18); Acta «Breve descripción del proyecto» (principio de transparencia); «Alcance preliminar del proyecto»).

## RU-52 — Reporte inmediato de peligros sin exponer la identidad

El corredor necesita reportar un peligro en el momento en que lo observa sin que otros usuarios conozcan su nombre, para avisar sin exponerse.

**Aceptación original:** El reporte indica tipo (de una lista predefinida), ubicación en el mapa y hora (RF-06); el nombre del autor se oculta a los demás usuarios y el vínculo con su cuenta se conserva solo para moderación (RF-20).

**Fuente:** requisitos-v2 (requisitos-v2 «Voces de los interesados»; §2.5 (conflicto 2); §2.6 (NU-11, RF-06, RF-20)).

## Límites verificables

El prototipo usa rutas y factores sintéticos, ubicación textual y selección simulada de corredor. No implementa GPS, mapa georreferenciado, perfil de elevación ni roles de moderación. No se ha realizado una medición en red 4G. No se afirma que estos elementos estén terminados ni que el consentimiento de demo equivalga a una certificación legal. Las evaluaciones son resultados calculados de solo lectura; los consentimientos se aceptan y revocan, sin edición de su historial.
