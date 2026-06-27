from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import pandas as pd
import time
import requests
from pathlib import Path


url=f"https://www.parlament.ch/de/organe/staenderat/mitglieder-staenderat-a-z"

    

with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url)
        page.wait_for_load_state("networkidle")
        time.sleep(4)
    
        html = page.content()

        browser.close()
    

doc = BeautifulSoup(html, "html.parser")
count=0
for card in doc.select("div.p-list"):
    name_tag = card.select_one("h3")
    img_tag = card.select_one("img")
    print(name_tag.get_text(strip=True))
    print(img_tag)
    url_img=f"https://www.parlament.ch{img_tag['src']}"
    count=count+1
    
    print("------------------------")
    img = requests.get(url_img)
    img.raise_for_status()
 

    name = name_tag.get_text(strip=True)


    
    person_id = img_tag["src"].split("/")[-1].replace(".jpg", "")

    name_clean = name.lower()

    # Leerzeichen durch Unterstriche
    name_clean = name_clean.replace(" ", "_")

    filename = f"{person_id}_{name_clean}.jpg"

    print(filename)
    
    
    
    

    dir_save = Path(r"C:\Users\misch\lede_homework_achiv\project1\img")
    #filename = f"{person_id}__{normalize_name(name)}.jpg"
    filepath=dir_save / filename
    filepath.write_bytes(img.content)
print("count= " + count)