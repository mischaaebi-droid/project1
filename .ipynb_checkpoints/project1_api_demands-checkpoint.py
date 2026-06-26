import requests
import pprint
import pandas

url = "https://ws-old.parlament.ch/affairs/20263010"

headers = {
    "Accept": "application/json"
}

r = requests.get(url, headers=headers)

data = r.json()

print(data["shortId"])
print(data["affairType"]["name"])
print(data["title"])
pprint.pprint(data)