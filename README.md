# RUNCTY — Django, Angular/Ionic y Android

Proyecto UTPL de Antonio Ojeda y Diego Espinosa. Demo local de rutas para corredores en Loja. Documento de requisitos original, alcance y trazabilidad: `docs/requisitos/` y `docs/TRAZABILIDAD.md`.

## Levantar todo en macOS

Abrir RUNCTY.code-workspace en VS Code. En Terminal > Run Task están Backend, Frontend, Android y las pruebas. O desde dos terminales en la raíz:

```sh
./scripts/iniciar-backend.sh
```

```sh
./scripts/iniciar-frontend.sh
```

Web: http://localhost:8100. API: http://127.0.0.1:8000/api/. Swagger: http://127.0.0.1:8000/api/docs/. Admin: http://127.0.0.1:8000/admin/.

MySQL 8.4 sigue en 127.0.0.1:3307; la base exclusiva es runcty y el usuario runcty_app. RUNCTY tiene su propio backend/.venv con Python 3.12. No se usa la base seguimiento_retos. Las variables se leen de backend/.env, y las credenciales del administrador local están en .local/django-admin.env. No entregar esos archivos.

## Validar

```sh
backend/.venv/bin/python backend/manage.py check --database default
backend/.venv/bin/python backend/manage.py migrate
backend/.venv/bin/python backend/manage.py test runcty -v 2
backend/.venv/bin/python scripts/verificar_api.py
cd frontend
npm test -- --watch=false
npm run build
```

El script HTTP crea registros de prueba, comprueba 48 peticiones y elimina sus registros temporales.

## Android

```sh
./scripts/iniciar-android.sh
cd frontend
npx cap open android
```

Elegir Gradle JDK 21 de Temurin y pulsar Run. El wrapper original de Capacitor permanece en Gradle 8.14.3, con AGP 8.13.0. La APK se genera en frontend/android/app/build/outputs/apk/debug/app-debug.apk. La app se llama RUNCTY (edu.utpl.runcty) y llega al backend por http://10.0.2.2:8000/api.

## Reproducir las dependencias

```sh
python3.12 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
cd frontend
npm ci
```

Crear backend/.env a partir de .env.example con credenciales propias. No volver a crear cap init ni cap add android si los archivos ya existen.

## Estructura y defensa

backend/config tiene settings, urls, wsgi y asgi, como SeguimientoRetos. backend/runcty contiene seis modelos, sus serializadores, viewsets, rutas, administrador y pruebas. frontend/src/app/core contiene modelos, RunctyApi (HTTP), RunctyEstado (RxJS), índice y avisos. paginas contiene lista, formulario y detalle para las cuatro entidades gestionables, recomendación e historial. Ver docs/DEFENSA.md.

## Alcance real

Factores sintéticos, ubicaciones textuales y sesión de corredor simulada. No hay GPS, mapa georreferenciado, perfil de elevación ni roles reales. Consultar las limitaciones de cada requisito en la matriz; esta entrega no afirma completar toda la visión futura del proyecto.
