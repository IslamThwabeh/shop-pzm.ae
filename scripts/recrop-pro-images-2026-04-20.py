from PIL import Image
import numpy as np
import os

FILES = [
    "iphone-17-pro-max-cosmicorange.webp",
    "iphone-17-pro-max-deepblue.webp",
    "iphone-17-pro-max-silver.webp",
    "iphone-17-pro-cosmicorange.webp",
    "iphone-17-pro-deepblue.webp",
    "iphone-17-pro-silver.webp",
]

SRC_DIR = r"D:\Personal\PZM Website\Fix-Images\processed"
OUT_SIZE = 1024
FILL_PCT = 0.85

for fname in FILES:
    path = os.path.join(SRC_DIR, fname)
    img = Image.open(path).convert("RGB")
    # Threshold: mark pixels as "content" if any channel is < 245
    arr = np.array(img)
    mask = (arr < 245).any(axis=2)  # True = non-white pixel
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    if not rows.any():
        print(f"SKIP {fname}: no content found")
        continue
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    bbox = (int(cmin), int(rmin), int(cmax) + 1, int(rmax) + 1)

    cropped = img.crop(bbox)
    cw, ch = cropped.size
    scale = (OUT_SIZE * FILL_PCT) / max(cw, ch)
    new_w, new_h = int(cw * scale), int(ch * scale)
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGB", (OUT_SIZE, OUT_SIZE), (255, 255, 255))
    canvas.paste(resized, ((OUT_SIZE - new_w) // 2, (OUT_SIZE - new_h) // 2))
    canvas.save(path, "WEBP", quality=90)
    print(f"Done {fname}: bbox={bbox}, phone={new_w}x{new_h}")

print("All done.")
