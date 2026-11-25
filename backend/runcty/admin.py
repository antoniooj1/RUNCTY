from django.contrib import admin

from .models import Consentimiento, Corredor, EvaluacionRuta, ReporteIncidente, Ruta, Zona


class ConsentimientoInline(admin.TabularInline):
    model = Consentimiento
    extra = 0
    readonly_fields = ('fecha_utc',)


@admin.register(Corredor)
class CorredorAdmin(admin.ModelAdmin):
    list_display = ('alias',)
    search_fields = ('alias',)
    inlines = [ConsentimientoInline]


@admin.register(Consentimiento)
class ConsentimientoAdmin(admin.ModelAdmin):
    list_display = ('corredor', 'version', 'fecha_utc')


class RutaInline(admin.TabularInline):
    model = Ruta
    extra = 0
    fields = ('nombre', 'km', 'desnivel', 'superficie', 'dificultad')


@admin.register(Zona)
class ZonaAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    search_fields = ('nombre',)
    inlines = [RutaInline]


@admin.register(Ruta)
class RutaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'zona', 'km', 'desnivel', 'superficie', 'dificultad')
    list_filter = ('zona', 'dificultad', 'superficie')
    search_fields = ('nombre',)


@admin.register(EvaluacionRuta)
class EvaluacionRutaAdmin(admin.ModelAdmin):
    list_display = ('ruta', 'indice', 'hora_salida', 'fecha_utc')
    list_filter = ('ruta',)


@admin.register(ReporteIncidente)
class ReporteIncidenteAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'zona', 'ubicacion', 'estado', 'fecha_utc', 'autor')
    list_filter = ('tipo', 'zona', 'estado')
