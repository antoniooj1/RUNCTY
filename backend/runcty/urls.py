from rest_framework.routers import DefaultRouter

from .views import (
    ConsentimientoViewSet,
    CorredorViewSet,
    EvaluacionRutaViewSet,
    ReporteIncidenteViewSet,
    RutaViewSet,
    ZonaViewSet,
)

router = DefaultRouter()
router.register('corredores', CorredorViewSet)
router.register('consentimientos', ConsentimientoViewSet)
router.register('zonas', ZonaViewSet)
router.register('rutas', RutaViewSet)
router.register('evaluaciones', EvaluacionRutaViewSet)
router.register('reportes', ReporteIncidenteViewSet, basename='reporte')

urlpatterns = router.urls
