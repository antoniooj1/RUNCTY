from decimal import Decimal
from django.conf import settings
from rest_framework import serializers

from .models import Consentimiento, Corredor, EvaluacionRuta, ReporteIncidente, Ruta, Zona


class CorredorSerializer(serializers.ModelSerializer):
    consentimiento_vigente = serializers.SerializerMethodField()

    class Meta:
        model = Corredor
        fields = ['id', 'alias', 'consentimiento_vigente']

    def get_consentimiento_vigente(self, obj) -> bool:
        return obj.tiene_consentimiento(settings.VERSION_CONSENTIMIENTO)

    def validate_alias(self, valor):
        valor = valor.strip()
        if len(valor) < 3:
            raise serializers.ValidationError('El alias debe tener al menos 3 caracteres.')
        return valor


class ConsentimientoSerializer(serializers.ModelSerializer):
    corredor_alias = serializers.CharField(source='corredor.alias', read_only=True)

    class Meta:
        model = Consentimiento
        fields = ['id', 'corredor', 'corredor_alias', 'version', 'fecha_utc']
        read_only_fields = ['version', 'fecha_utc']

    def validate_corredor(self, corredor):
        if corredor.tiene_consentimiento(settings.VERSION_CONSENTIMIENTO):
            raise serializers.ValidationError('El corredor ya aceptó la versión vigente del consentimiento.')
        return corredor

    def create(self, datos):
        datos['version'] = settings.VERSION_CONSENTIMIENTO
        return super().create(datos)


class ZonaSerializer(serializers.ModelSerializer):
    total_rutas = serializers.IntegerField(source='rutas.count', read_only=True)

    class Meta:
        model = Zona
        fields = ['id', 'nombre', 'total_rutas']

    def validate_nombre(self, valor):
        valor = valor.strip()
        if not valor:
            raise serializers.ValidationError('El nombre de la zona es obligatorio.')
        return valor


class RutaSerializer(serializers.ModelSerializer):
    km = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal('0.1'), max_value=Decimal('100'))
    zona_nombre = serializers.CharField(source='zona.nombre', read_only=True)

    class Meta:
        model = Ruta
        fields = ['id', 'zona', 'zona_nombre', 'nombre', 'km', 'desnivel', 'superficie', 'dificultad',
                  'iluminacion', 'afluencia', 'apoyo', 'incidentes_base']


class RutaRecomendadaSerializer(RutaSerializer):
    indice = serializers.IntegerField(read_only=True)
    aportes = serializers.JSONField(read_only=True)
    evaluacion = serializers.IntegerField(read_only=True)
    fecha_calculo = serializers.DateTimeField(read_only=True)
    aviso = serializers.CharField(read_only=True)

    class Meta(RutaSerializer.Meta):
        fields = RutaSerializer.Meta.fields + ['indice', 'aportes', 'evaluacion', 'fecha_calculo', 'aviso']


class EvaluacionRutaSerializer(serializers.ModelSerializer):
    ruta_nombre = serializers.CharField(source='ruta.nombre', read_only=True)

    class Meta:
        model = EvaluacionRuta
        fields = ['id', 'ruta', 'ruta_nombre', 'indice', 'hora_salida', 'fecha_utc', 'aportes']
        read_only_fields = fields


class FiltroRecomendacionSerializer(serializers.Serializer):
    """RU-02: zona, distancia y hora de salida (validaciones del prototipo)."""

    zona = serializers.PrimaryKeyRelatedField(
        queryset=Zona.objects.all(),
        error_messages={'does_not_exist': 'Selecciona una zona de Loja.',
                        'required': 'Selecciona una zona de Loja.',
                        'incorrect_type': 'Selecciona una zona de Loja.'})
    km = serializers.FloatField(
        min_value=0.1, max_value=100,
        error_messages={'invalid': 'Ingresa una distancia numérica mayor que cero.',
                        'min_value': 'Ingresa una distancia numérica mayor que cero.',
                        'required': 'Ingresa una distancia numérica mayor que cero.'})
    hora = serializers.TimeField(
        input_formats=['%H:%M'],
        error_messages={'invalid': 'Indica una hora válida en formato HH:MM.',
                        'required': 'Indica una hora válida en formato HH:MM.'})


class ReporteIncidenteSerializer(serializers.ModelSerializer):
    """RU-52: el autor se recibe al crear pero nunca se devuelve (proyección pública)."""

    autor = serializers.PrimaryKeyRelatedField(queryset=Corredor.objects.all(), write_only=True)
    zona_nombre = serializers.CharField(source='zona.nombre', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = ReporteIncidente
        fields = ['id', 'autor', 'zona', 'zona_nombre', 'tipo', 'tipo_display', 'ubicacion',
                  'fecha_utc', 'estado', 'estado_display']
        read_only_fields = ['fecha_utc', 'estado']

    def validate_ubicacion(self, valor):
        valor = valor.strip()
        if len(valor) < 5:
            raise serializers.ValidationError('Describe la ubicación con al menos 5 caracteres.')
        return valor

    def validate(self, datos):
        autor = datos.get('autor') or (self.instance and self.instance.autor)
        # RU-38: sin consentimiento no se registra ninguna ubicación
        if autor and not autor.tiene_consentimiento(settings.VERSION_CONSENTIMIENTO):
            raise serializers.ValidationError(
                {'autor': 'El corredor debe aceptar el consentimiento de ubicación antes de reportar.'})
        return datos
