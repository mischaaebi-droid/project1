from pathlib import Path
from PIL import Image

project_folder = Path(r"C:\Users\misch\lede_homework_achiv\project1")

input_folder = project_folder / "img"
output_folder = project_folder / "img_webP"

output_folder.mkdir(exist_ok=True)

for image_path in input_folder.glob("*.jpg"):
    with Image.open(image_path) as image:
        image.save(
            output_folder / f"{image_path.stem}.webp",
            "WEBP",
            quality=75,
            method=6
        )

print("Fertig: Alle Bilder wurden in img_webP gespeichert.")