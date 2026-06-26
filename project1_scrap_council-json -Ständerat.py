from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import pandas as pd
import time
import requests
from pathlib import Path
import json


url=f"https://www.parlament.ch/de/organe/nationalrat/mitglieder-nationalrat-a-z"

    

with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url)
        page.wait_for_load_state("networkidle")
        time.sleep(2)
    
        html = page.content()

        browser.close()
    

doc = BeautifulSoup(html, "html.parser")
rows = []

print(doc.select("div.p-list")[1])
count=0
for card in doc.select("div.p-list"):
    name_tag = card.select_one("h3")
    img_tag = card.select_one("img")
    print(name_tag.get_text(strip=True))
    name=name_tag.get_text(strip=True)
    person_code = int( img_tag["src"].split("/")[-1].replace(".jpg", "")
)
    print(person_code)
    kanton = card.select_one(".canton").get_text(strip=True)
    print(kanton)
    fraktion = card.select("h4.fraktion span")[-1].get_text(strip=True)
    if fraktion=="(V)":
        fraktion="SVP"
    elif fraktion=="(RL)":
        fraktion="FDP"
    elif fraktion=="(S)":
        fraktion="SP"
    elif fraktion=="(G)":
        fraktion="Grüne"
    elif fraktion=="(M-E)":
        fraktion="Mitte"
    elif fraktion=="(GL)":
        fraktion="Grünliberale"  
    print(fraktion)      
    print("---------------------------------")
    
    name_clean = name.lower()

    name_clean = name_clean.replace(" ", "_")

    filename = f"{person_code}_{name_clean}.jpg"
    
    row={
    "person_code": person_code,
    "name": name,
    "party": fraktion,
    "place": kanton,
    "image": f"img/{filename}"
    }
    
    rows.append(row)

with open(
    Path(r"C:\Users\misch\lede_homework_achiv\project1\nationalraete.json"),
    "w",
    encoding="utf-8"
) as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)

print(rows[0])
print(len(rows))
