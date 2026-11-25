from django.core.management.base import BaseCommand

from runcty.models import Corredor, Ruta, Zona


class Command(BaseCommand):
    help = 'Carga los datos sintéticos del prototipo RUNCTY (python manage.py datos_demo)'

    def handle(self, *args, **options):
        for alias in ['Corredor demo A', 'Corredor demo B']:
            Corredor.objects.get_or_create(alias=alias)
        jipiro, _ = Zona.objects.get_or_create(nombre='Jipiro')
        tebaida, _ = Zona.objects.get_or_create(nombre='La Tebaida')
        rutas = [
            (jipiro, 'Circuito del parque', 4.7, 22, 'Pavimento', 'Baja', 85, 80, 70, 1),
            (jipiro, 'Vuelta junto al río', 5.0, 35, 'Mixta', 'Media', 65, 70, 50, 0),
            (jipiro, 'Recorrido del sector norte', 5.3, 44, 'Pavimento', 'Media', 52, 45, 60, 2),
            (jipiro, 'Ruta larga de Jipiro', 8.2, 80, 'Mixta', 'Alta', 45, 40, 35, 1),
            (tebaida, 'Circuito de La Tebaida', 3.9, 30, 'Pavimento', 'Baja', 75, 66, 60, 1),
        ]
        for zona, nombre, km, desn, sup, dif, ilu, afl, apo, inc in rutas:
            Ruta.objects.get_or_create(zona=zona, nombre=nombre, defaults=dict(
                km=km, desnivel=desn, superficie=sup, dificultad=dif,
                iluminacion=ilu, afluencia=afl, apoyo=apo, incidentes_base=inc))
        self.stdout.write(self.style.SUCCESS('Datos de la demo RUNCTY cargados.'))
