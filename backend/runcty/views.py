from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Consentimiento, Corredor, EvaluacionRuta, ReporteIncidente, Ruta, Zona
from .serializers import (
    ConsentimientoSerializer,
    CorredorSerializer,
    EvaluacionRutaSerializer,
    FiltroRecomendacionSerializer,
    ReporteIncidenteSerializer,
    RutaSerializer,
    RutaRecomendadaSerializer,
    ZonaSerializer,
)


class CorredorViewSet(viewsets.ModelViewSet):
    queryset = Corredor.objects.all()
    serializer_class = CorredorSerializer
    search_fields = ['alias']

    def destroy(self, request, *args, **kwargs):
        corredor = self.get_object()
        if corredor.reportes.exists():
            return Response({'detail': 'No se puede eliminar: el corredor tiene reportes registrados.'},
                            status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)


class ConsentimientoViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
                            mixins.DestroyModelMixin, viewsets.GenericViewSet):
    """Aceptar (POST), consultar y revocar (DELETE) el consentimiento. No se edita."""

    queryset = Consentimiento.objects.select_related('corredor')
    serializer_class = ConsentimientoSerializer
    filterset_fields = ['corredor', 'version']


class ZonaViewSet(viewsets.ModelViewSet):
    queryset = Zona.objects.all()
    serializer_class = ZonaSerializer
    search_fields = ['nombre']

    def destroy(self, request, *args, **kwargs):
        zona = self.get_object()
        if zona.rutas.exists() or zona.reportes.exists():
            return Response({'detail': 'No se puede eliminar: la zona tiene rutas o reportes.'},
                            status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)


class RutaViewSet(viewsets.ModelViewSet):
    queryset = Ruta.objects.select_related('zona')
    serializer_class = RutaSerializer
    filterset_fields = ['zona', 'dificultad', 'superficie']
    search_fields = ['nombre']
    ordering_fields = ['km', 'nombre', 'desnivel']

    @extend_schema(
        parameters=[
            OpenApiParameter('zona', int, required=True),
            OpenApiParameter('km', float, required=True),
            OpenApiParameter('hora', str, required=True, description='HH:MM'),
        ],
        responses=RutaRecomendadaSerializer(many=True),
    )
    @action(detail=False, methods=['get'])
    def recomendar(self, request):
        """RU-02 y RU-07: hasta 3 rutas de la zona a ±0,5 km, ordenadas por índice de seguridad."""
        filtro = FiltroRecomendacionSerializer(data=request.query_params)
        filtro.is_valid(raise_exception=True)
        zona, km, hora = (filtro.validated_data[k] for k in ('zona', 'km', 'hora'))

        recientes = ReporteIncidente.recientes_en_zona(zona)
        candidatas = Ruta.objects.filter(zona=zona, km__gte=km - 0.5, km__lte=km + 0.5)
        evaluadas = []
        for ruta in candidatas:
            indice, aportes = ruta.calcular_indice(recientes, hora)
            evaluadas.append((ruta, indice, aportes))
        evaluadas.sort(key=lambda t: (-t[1], abs(float(t[0].km) - km), t[0].id))

        resultado = []
        for ruta, indice, aportes in evaluadas[:3]:
            evaluacion = EvaluacionRuta.objects.create(ruta=ruta, indice=indice, hora_salida=hora, aportes=aportes)
            datos = RutaSerializer(ruta).data
            datos.update({'indice': indice, 'aportes': aportes, 'evaluacion': evaluacion.id,
                          'fecha_calculo': evaluacion.fecha_utc,
                          'aviso': 'Índice orientativo calculado con datos sintéticos.'})
            resultado.append(datos)
        return Response(resultado, status=status.HTTP_200_OK)


class EvaluacionRutaViewSet(viewsets.ReadOnlyModelViewSet):
    """Historial de índices calculados (se crean al recomendar)."""

    queryset = EvaluacionRuta.objects.select_related('ruta')
    serializer_class = EvaluacionRutaSerializer
    filterset_fields = ['ruta']


class ReporteIncidenteViewSet(viewsets.ModelViewSet):
    """RU-52: reportes de peligro. La respuesta nunca incluye al autor."""

    queryset = ReporteIncidente.objects.select_related('zona')
    serializer_class = ReporteIncidenteSerializer
    filterset_fields = ['zona', 'tipo', 'estado']
    search_fields = ['ubicacion']
