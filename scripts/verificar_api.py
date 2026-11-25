"""Prueba HTTP real: usa registros temporales y los elimina al finalizar."""
import json
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from datetime import datetime

BASE = 'http://127.0.0.1:8000/api'
log = []

def req(method, path, data=None, expected=200):
    r = Request(BASE + path, data=None if data is None else json.dumps(data).encode(), method=method, headers={'Content-Type': 'application/json'})
    try:
        with urlopen(r, timeout=15) as response:
            code = response.status
            body = response.read().decode()
    except HTTPError as e:
        code, body = e.code, e.read().decode()
    value = json.loads(body) if body else None
    log.append({'metodo': method, 'url': BASE + path, 'enviado': data, 'codigo': code, 'respuesta': value})
    assert code == expected, (method, path, code, expected, value)
    return value

def main():
    stamp = datetime.now().strftime('%H%M%S')
    z = req('POST', '/zonas/', {'nombre': 'Verificación ' + stamp}, 201)
    c = req('POST', '/corredores/', {'alias': 'Verificación ' + stamp}, 201)
    rutas = dict(zona=z['id'], nombre='Ruta de prueba', km='5.00', desnivel=25, superficie='Mixta', dificultad='Baja', iluminacion=80, afluencia=70, apoyo=60, incidentes_base=0)
    r = req('POST', '/rutas/', rutas, 201)
    for kind, obj, changes in [('zonas', z, {'nombre': 'Zona editada '+stamp}), ('corredores', c, {'alias': 'Corredor editado '+stamp}), ('rutas', r, {'nombre': 'Ruta editada'})]:
        req('GET', f'/{kind}/')
        req('GET', f'/{kind}/{obj["id"]}/')
        updated = req('PATCH', f'/{kind}/{obj["id"]}/', changes)
        payload = {'zonas': {'nombre': updated.get('nombre')}, 'corredores': {'alias': updated.get('alias')}, 'rutas': {**rutas, 'nombre': 'Ruta PUT'}}[kind]
        req('PUT', f'/{kind}/{obj["id"]}/', payload)
    req('POST','/zonas/',{'nombre':''},400)
    req('POST','/corredores/',{'alias':'a'},400)
    req('POST','/rutas/',{**rutas,'km':'-1'},400)
    rep = {'autor': c['id'], 'zona': z['id'], 'tipo': 'OBSTACULO', 'ubicacion': 'Entrada de prueba, sin ubicación personal'}
    req('POST','/reportes/',rep,400)
    consent = req('POST','/consentimientos/',{'corredor':c['id']},201)
    req('GET','/consentimientos/');req('GET',f'/consentimientos/{consent["id"]}/')
    req('POST','/consentimientos/',{'corredor':c['id']},400)
    report = req('POST','/reportes/',rep,201)
    assert 'autor' not in report
    req('GET',f'/reportes/{report["id"]}/');req('GET','/reportes/')
    req('PATCH',f'/reportes/{report["id"]}/',{'tipo':'VIA'})
    req('PUT',f'/reportes/{report["id"]}/',{**rep,'tipo':'ILUMINACION'})
    req('PATCH',f'/reportes/{report["id"]}/',{'ubicacion':'x'},400)
    result = req('GET',f'/rutas/recomendar/?zona={z["id"]}&km=5&hora=10:00')
    assert len(result)==1 and result[0]['indice']==80
    ev = result[0]['evaluacion'];req('GET',f'/evaluaciones/{ev}/');req('GET','/evaluaciones/')
    req('POST','/evaluaciones/',{},405)
    req('PATCH',f'/consentimientos/{consent["id"]}/',{'version':'otra'},405)
    req('DELETE',f'/zonas/{z["id"]}/',expected=400)
    req('DELETE',f'/corredores/{c["id"]}/',expected=400)
    req('DELETE',f'/consentimientos/{consent["id"]}/',expected=204)
    req('GET',f'/consentimientos/{consent["id"]}/',expected=404)
    req('POST','/reportes/',rep,400)
    req('DELETE',f'/reportes/{report["id"]}/',expected=204)
    req('GET',f'/reportes/{report["id"]}/',expected=404)
    req('DELETE',f'/rutas/{r["id"]}/',expected=204)
    req('GET',f'/rutas/{r["id"]}/',expected=404)
    req('GET',f'/evaluaciones/{ev}/',expected=404)
    for kind,obj in [('corredores',c),('zonas',z)]:
        req('DELETE',f'/{kind}/{obj["id"]}/',expected=204)
        req('GET',f'/{kind}/{obj["id"]}/',expected=404)
    print(f'{len(log)} peticiones HTTP verificadas; códigos 200, 201, 204, 400, 404 y 405 correctos. Registros temporales eliminados.')

if __name__ == '__main__':
    try:main()
    finally:
        out=Path(__file__).resolve().parents[1]/'evidencias';out.mkdir(exist_ok=True)
        (out/'07_api_crud.json').write_text(json.dumps(log,ensure_ascii=False,indent=2))
