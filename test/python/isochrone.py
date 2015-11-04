import requests
import json
import geojson
import csv
try:
    import urllib3.contrib.pyopenssl
    urllib3.contrib.pyopenssl.inject_into_urllib3()
except ImportError:
    pass

gmaps_url = "https://maps.googleapis.com/maps/api/directions/json"
gmaps_apikey = "AIzaSyAbrnDazcPq2H_YEFXWfoMRnEBna8ThQbQ"

# origin==4.834413,45.767304 destination==4.890021,44.930435 method==DISTANCE graphName==Voiture
GPP_KEY = "50bejnu55v5ievgkbvzxas6s"
GPP_URL = "http://wxs.ign.fr/%s/isochrone/isochrone.json" % GPP_KEY
GPP_USER_AGENT = "Firefox"
GPP_REFERER = "http://geo.agriculture"


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
        points.append(Point(float(record['lon']), float(record['lat'])))

def gpp_isochrone(pt, distance):
    response = requests.get(GPP_URL, {
            "location": "%f,%f" % (pt.lon, pt.lat),
            "distance": distance,
            "method": "DISTANCE",
            "graphName": "Voiture",
            "holes": "true",
            "smoothing": "false" },
            headers = {
                "User-Agent": GPP_USER_AGENT,
                "Referer": GPP_REFERER
            })
    if response.status_code == 200:
        data = json.loads(response.text)
        return data
    else:
        return response

# for i, pt in enumerate(points):
#     print gpp_isochrone(pt, 30000)