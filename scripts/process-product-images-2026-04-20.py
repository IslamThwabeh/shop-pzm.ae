"""
Process Fix-Images for pzm.ae:
- Remove background with rembg (AI)
- Composite on pure white background
- Resize/pad to uniform 1024x1024 square
- Save as high-quality webp

Usage:
  python scripts/process-product-images-2026-04-20.py

Output directory: D:\\Personal\\PZM Website\\Fix-Images\\processed\\
"""

from __future__ import annotations

import io
import sys
from pathlib import Path

from PIL import Image

try:
    import rembg
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False
    print("[ERROR] rembg not installed. Run: pip install rembg onnxruntime", file=sys.stderr)
    sys.exit(1)

SOURCE_DIR = Path(r"D:\Personal\PZM Website\Fix-Images")
OUTPUT_DIR = SOURCE_DIR / "processed"

# 1024x1024 square — consistent framing across all product cards
TARGET_SIZE = (1024, 1024)
WEBP_QUALITY = 92

# Images to process (source filename → output filename)
IMAGES: list[tuple[str, str]] = [
    # iPhone 17 Pro Max
    ("iphone-17-pro-max-finish-select-202509-6-3inch-cosmicorange-1024x576.webp",
     "iphone-17-pro-max-cosmicorange.webp"),
    ("iphone-17-pro-max-finish-select-202509-6-3inch-deepblue-1024x576.webp",
     "iphone-17-pro-max-deepblue.webp"),
    ("iphone-17-pro-max-finish-select-202509-6-3inch-silver-1024x576.webp",
     "iphone-17-pro-max-silver.webp"),
    # iPhone 17 Pro
    ("iphone-17-pro-finish-select-202509-6-3inch-cosmicorange-1024x576.webp",
     "iphone-17-pro-cosmicorange.webp"),
    ("iphone-17-pro-finish-select-202509-6-3inch-deepblue-1024x576.webp",
     "iphone-17-pro-deepblue.webp"),
    ("iphone-17-pro-finish-select-202509-6-3inch-silver-1024x576.webp",
     "iphone-17-pro-silver.webp"),
    # iPhone 17 standard
    ("iPhone-17-green.avif",
     "iphone-17-green.webp"),
    # iPhone 17 Air
    ("iphone-17-air-blue.webp",
     "iphone-17-air-blue.webp"),
]


def remove_background(img: Image.Image) -> Image.Image:
    """Use rembg to remove background, returning RGBA image."""
    buf_in = io.BytesIO()
    # rembg works best with PNG input
    img.save(buf_in, format="PNG")
    buf_in.seek(0)
    buf_out = io.BytesIO(rembg.remove(buf_in.read()))
    return Image.open(buf_out).convert("RGBA")


def composite_on_white(fg: Image.Image, target: tuple[int, int]) -> Image.Image:
    """Paste RGBA foreground onto white background, fitting within target with padding."""
    # White canvas
    canvas = Image.new("RGBA", target, (255, 255, 255, 255))

    # Get bounding box of non-transparent pixels
    bbox = fg.getbbox()  # (left, top, right, bottom) of opaque region
    if bbox:
        cropped = fg.crop(bbox)
    else:
        cropped = fg

    # Scale to fit within (target - padding) while preserving aspect ratio
    padding = int(min(target) * 0.08)  # 8% padding on each side
    max_w = target[0] - 2 * padding
    max_h = target[1] - 2 * padding
    cropped.thumbnail((max_w, max_h), Image.LANCZOS)

    # Center on canvas
    x = (target[0] - cropped.width) // 2
    y = (target[1] - cropped.height) // 2
    canvas.paste(cropped, (x, y), mask=cropped.split()[3])

    return canvas.convert("RGB")


def process_image(src: Path, dst: Path) -> None:
    print(f"  Processing: {src.name} → {dst.name}")
    img = Image.open(src).convert("RGBA")
    print(f"    Input size: {img.size}")

    # Remove background
    print(f"    Removing background...")
    fg = remove_background(img)

    # Composite on white with uniform framing
    result = composite_on_white(fg, TARGET_SIZE)
    print(f"    Output size: {result.size}")

    # Save as webp
    dst.parent.mkdir(parents=True, exist_ok=True)
    result.save(dst, format="WEBP", quality=WEBP_QUALITY, method=6)
    size_kb = dst.stat().st_size / 1024
    print(f"    Saved ({size_kb:.0f} KB)")


def main() -> None:
    if not REMBG_AVAILABLE:
        print("[ERROR] rembg not available.")
        sys.exit(1)

    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Target size: {TARGET_SIZE[0]}x{TARGET_SIZE[1]} px\n")

    errors: list[str] = []

    for src_name, dst_name in IMAGES:
        src = SOURCE_DIR / src_name
        dst = OUTPUT_DIR / dst_name
        if not src.exists():
            print(f"  [SKIP] Not found: {src}")
            errors.append(f"Missing: {src_name}")
            continue
        try:
            process_image(src, dst)
        except Exception as exc:
            print(f"  [ERROR] {src_name}: {exc}")
            errors.append(f"{src_name}: {exc}")

    print(f"\nDone. {len(IMAGES) - len(errors)}/{len(IMAGES)} processed.")
    if errors:
        print("Errors:")
        for e in errors:
            print(f"  - {e}")


if __name__ == "__main__":
    main()
