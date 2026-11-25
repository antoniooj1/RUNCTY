"""Modelo de RUNCTY (DCM-01): Corredor, Consentimiento, Zona, Ruta, EvaluacionRuta, ReporteIncidente."""
from datetime import timedelta
from math import floor

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

PORCENTAJE = [MinValueValidator(0), MaxValueValidator(100)]


class Corredor(models.Model):
    alias = models.CharField(max_length=60, unique=True)

    class Meta:
        ordering = ['alias']
        verbose_name_plural = 'corredores'

    def __str__(self):
        return self.alias

    def tiene_consentimiento(self, version):
        return self.consentimientos.filter(version=version).exists()


class Consentimiento(models.Model):
    """RU-38: consentimiento explícito antes de usar la ubicación (LOPDP)."""

    corredor = models.ForeignKey(Corredor, on_delete=models.CASCADE, related_name='consentimientos')
    version = models.CharField(max_length=20)
    fecha_utc = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_utc']
        constraints = [
            models.UniqueConstraint(fields=['corredor', 'version'], name='consentimiento_unico_por_version')
        ]

    def __str__(self):
        return f'{self.corredor} - v{self.version}'


class Zona(models.Model):
    nombre = models.CharField(max_length=80, unique=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Ruta(models.Model):
    """RU-03: distancia, desnivel, superficie y dificultad de cada ruta."""

    class Superficie(models.TextChoices):
        PAVIMENTO = 'Pavimento', 'Pavimento'
        MIXTA = 'Mixta', 'Mixta'
        TIERRA = 'Tierra', 'Tierra'

    class Dificultad(models.TextChoices):
        BAJA = 'Baja', 'Baja'
        MEDIA = 'Media', 'Media'
        ALTA = 'Alta', 'Alta'

    zona = models.ForeignKey(Zona, on_delete=models.PROTECT, related_name='rutas')
    nombre = models.CharField(max_length=120)
    km = models.DecimalField(max_digits=5, decimal_places=2,
                             validators=[MinValueValidator(0.1), MaxValueValidator(100)])
    desnivel = models.PositiveIntegerField(help_text='Desnivel acumulado en metros')
    superficie = models.CharField(max_length=12, choices=Superficie.choices)
    dificultad = models.CharField(max_length=8, choices=Dificultad.choices)
    # Factores del índice (0-100, datos sintéticos de la demo)
    iluminacion = models.PositiveSmallIntegerField(validators=PORCENTAJE)
    afluencia = models.PositiveSmallIntegerField(validators=PORCENTAJE)
    apoyo = models.PositiveSmallIntegerField(validators=PORCENTAJE)
    incidentes_base = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['zona', 'km']
        constraints = [
            models.UniqueConstraint(fields=['zona', 'nombre'], name='ruta_unica_por_zona')
        ]

    def __str__(self):
        return f'{self.nombre} ({self.km} km)'

    def calcular_indice(self, recientes, hora):
        """RU-07: índice 0-100 según la hora de salida. Ponderaciones explícitas (RU-50)."""
        tramo = 90 if 7 <= hora.hour < 18 else 45
        impacto_incidentes = max(0, 100 - 16 * self.incidentes_base - 6 * recientes)
        aportes = [
            {'factor': 'Iluminación', 'valor': round(self.iluminacion * 0.30, 2)},
            {'factor': 'Afluencia', 'valor': round(self.afluencia * 0.20, 2)},
            {'factor': 'Incidentes', 'valor': round(impacto_incidentes * 0.25, 2)},
            {'factor': 'Puntos de apoyo', 'valor': round(self.apoyo * 0.15, 2)},
            {'factor': 'Hora de salida', 'valor': round(tramo * 0.10, 2)},
        ]
        indice = floor(sum(a['valor'] for a in aportes) + 0.5)
        return min(100, max(0, indice)), aportes


class EvaluacionRuta(models.Model):
    """Resultado guardado de cada cálculo del índice."""

    ruta = models.ForeignKey(Ruta, on_delete=models.CASCADE, related_name='evaluaciones')
    indice = models.PositiveSmallIntegerField(validators=PORCENTAJE)
    hora_salida = models.TimeField()
    fecha_utc = models.DateTimeField(auto_now_add=True)
    aportes = models.JSONField(default=list)

    class Meta:
        ordering = ['-fecha_utc']
        verbose_name = 'evaluación de ruta'
        verbose_name_plural = 'evaluaciones de rutas'

    def __str__(self):
        return f'{self.ruta} - {self.indice}'


class ReporteIncidente(models.Model):
    """RU-52: reporte de peligro. El autor se guarda pero no se publica."""

    class Tipo(models.TextChoices):
        ILUMINACION = 'ILUMINACION', 'Iluminación deficiente'
        OBSTACULO = 'OBSTACULO', 'Obstáculo en el camino'
        VIA = 'VIA', 'Vía deteriorada'

    class Estado(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Sin confirmar'

    autor = models.ForeignKey(Corredor, on_delete=models.PROTECT, related_name='reportes')
    zona = models.ForeignKey(Zona, on_delete=models.PROTECT, related_name='reportes')
    tipo = models.CharField(max_length=12, choices=Tipo.choices)
    ubicacion = models.CharField(max_length=150)
    fecha_utc = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.PENDIENTE)

    class Meta:
        ordering = ['-fecha_utc', '-id']
        verbose_name = 'reporte de incidente'
        verbose_name_plural = 'reportes de incidentes'

    def __str__(self):
        return f'{self.get_tipo_display()} - {self.zona}'

    @classmethod
    def recientes_en_zona(cls, zona, dias=30):
        return cls.objects.filter(zona=zona, fecha_utc__gte=timezone.now() - timedelta(days=dias)).count()
