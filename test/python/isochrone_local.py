import requests
import json
import geojson
import csv
try:
    import urllib3.contrib.pyopenssl
    urllib3.contrib.pyopenssl.inject_into_urllib3()
except ImportError:
    pass

url = "http://localhost:8080/routing/api/v1/isochrone"


class Point(object):

    def __init__(self, lon, lat):
        self.lon = lon
        self.lat = lat

    def __repr__(self):
        return "(%f,%f)" % (self.lon, self.lat)

points = []

with open('app/data/enqueteurs.tsv') as fin:
    reader = csv.DictReader(fin, delimiter='\t')
    for record in reader:
        points.append({ "gid": record['gid'], "geom": Point(float(record['lon']), float(record['lat'])) })

def isochrone(pt, distance):
    response = requests.get(url, {
            "lon": pt.lon,
            "lat": pt.lat,
            "cost": distance,
            "concave": "true" })
    if response.status_code == 200:
        data = json.loads(response.text)
        return data
    else:
        return response

for i, pt in enumerate(points):
    geom = isochrone(pt["geom"], 20)
    with open('iso_20m_%s.geojson' % pt["gid"], 'w') as f:
        f.write(json.dumps(geom))