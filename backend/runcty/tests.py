from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Corredor, EvaluacionRuta, Ruta, Zona


class RunctyApiTests(APITestCase):
    def setUp(self):
        self.zona = Zona.objects.create(nombre='Jipiro')
        datos = dict(desnivel=20, superficie='Pavimento', dificultad='Baja',
                     iluminacion=80, afluencia=70, apoyo=60, incidentes_base=0)
        Ruta.objects.create(zona=self.zona, nombre='A', km=4.7, **datos)
        Ruta.objects.create(zona=self.zona, nombre='B', km=5.0, **datos)
        Ruta.objects.create(zona=self.zona, nombre='C', km=5.3, **datos)
        Ruta.objects.create(zona=self.zona, nombre='D', km=5.5, **datos)
        Ruta.objects.create(zona=self.zona, nombre='Larga', km=8.2, **datos)
        self.corredor = Corredor.objects.create(alias='Tester')

    def test_crud_zona(self):
        r = self.client.post(reverse('zona-list'), {'nombre': 'La Tebaida'}, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        url = reverse('zona-detail', args=[r.data['id']])
        self.assertEqual(self.client.patch(url, {'nombre': 'Tebaida'}, format='json').status_code, 200)
        self.assertEqual(self.client.delete(url).status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_404_NOT_FOUND)

    def test_recomendar_maximo_tres_rutas(self):
        r = self.client.get(reverse('ruta-recomendar'), {'zona': self.zona.id, 'km': 5, 'hora': '06:00'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(r.data), 3)
        for ruta in r.data:
            self.assertTrue(4.5 <= float(ruta['km']) <= 5.5)
            self.assertTrue(0 <= ruta['indice'] <= 100)
        self.assertEqual(EvaluacionRuta.objects.count(), len(r.data))

    def test_indice_cambia_con_la_hora(self):
        url = reverse('ruta-recomendar')
        dia = self.client.get(url, {'zona': self.zona.id, 'km': 5, 'hora': '10:00'}).data[0]['indice']
        noche = self.client.get(url, {'zona': self.zona.id, 'km': 5, 'hora': '05:30'}).data[0]['indice']
        self.assertGreater(dia, noche)

    def test_recomendar_filtros_invalidos(self):
        r = self.client.get(reverse('ruta-recomendar'), {'zona': 999, 'km': -1, 'hora': '25:99'})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('zona', r.data)
        self.assertIn('km', r.data)
        self.assertIn('hora', r.data)

    def test_reporte_requiere_consentimiento_y_oculta_autor(self):
        datos = {'autor': self.corredor.id, 'zona': self.zona.id, 'tipo': 'OBSTACULO',
                 'ubicacion': 'Entrada norte del parque'}
        r = self.client.post(reverse('reporte-list'), datos, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

        c = self.client.post(reverse('consentimiento-list'), {'corredor': self.corredor.id}, format='json')
        self.assertEqual(c.status_code, status.HTTP_201_CREATED)

        r = self.client.post(reverse('reporte-list'), datos, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['estado'], 'PENDIENTE')
        self.assertNotIn('autor', r.data)
        lista = self.client.get(reverse('reporte-list')).data['results']
        self.assertNotIn('autor', lista[0])
