from __future__ import annotations

import argparse
import colorsys
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageFilter, features


@dataclass(frozen=True)
class FinishProfile:
    name: str
    rgb: tuple[int, int, int]
    saturation: float
    lightness_scale: float
    lightness_shift: float
    blend: float = 1.0


@dataclass(frozen=True)
class MaskProfile:
    name: str
    regions: tuple[tuple[float, float, float, float], ...]
    min_luma: int
    max_luma: int
    exclude_dark: int
    exclude_bright: int
    blur_radius: float = 2.5


@dataclass(frozen=True)
class RecolorJob:
    name: str
    source_path: Path
    output_path: Path
    finish: str
    mask: str


FINISHES: dict[str, FinishProfile] = {
    'black': FinishProfile('black', (46, 46, 48), saturation=0.03, lightness_scale=0.70, lightness_shift=-0.06),
    'white': FinishProfile('white', (236, 238, 241), saturation=0.04, lightness_scale=1.95, lightness_shift=0.30),
    'teal': FinishProfile('teal', (118, 180, 176), saturation=0.38, lightness_scale=1.55, lightness_shift=0.08),
    'blue': FinishProfile('blue', (147, 177, 200), saturation=0.28, lightness_scale=1.10, lightness_shift=0.04),
    'pink': FinishProfile('pink', (215, 180, 193), saturation=0.24, lightness_scale=1.10, lightness_shift=0.06),
    'silver': FinishProfile('silver', (204, 211, 217), saturation=0.06, lightness_scale=1.25, lightness_shift=0.14),
    'yellow': FinishProfile('yellow', (225, 210, 125), saturation=0.40, lightness_scale=1.12, lightness_shift=0.05),
    'purple': FinishProfile('purple', (181, 171, 214), saturation=0.30, lightness_scale=1.08, lightness_shift=0.05),
    'space-gray': FinishProfile('space-gray', (96, 103, 112), saturation=0.08, lightness_scale=0.86, lightness_shift=-0.01),
}


MASKS: dict[str, MaskProfile] = {
    'iphone-back-device': MaskProfile(
        name='iphone-back-device',
        regions=((0.46, 0.07, 0.91, 0.93),),
        min_luma=18,
        max_luma=245,
        exclude_dark=16,
        exclude_bright=236,
        blur_radius=2.2,
    ),
    'ipad-back-device': MaskProfile(
        name='ipad-back-device',
        regions=(
            (0.34, 0.07, 0.87, 0.25),
            (0.60, 0.14, 0.90, 0.88),
        ),
        min_luma=30,
        max_luma=242,
        exclude_dark=28,
        exclude_bright=236,
        blur_radius=2.8,
    ),
}


ACTIVE_APPLE_COLOR_JOBS: tuple[RecolorJob, ...] = (
    RecolorJob(
        name='iPhone 16 Black',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\phone\iphone\iphone-16-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\phone\iphone\iphone-16-black.webp'),
        finish='black',
        mask='iphone-back-device',
    ),
    RecolorJob(
        name='iPhone 16 White',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\phone\iphone\iphone-16-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\phone\iphone\iphone-16-white.webp'),
        finish='white',
        mask='iphone-back-device',
    ),
    RecolorJob(
        name='iPhone 16 Teal',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\phone\iphone\iphone-16-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\phone\iphone\iphone-16-teal.webp'),
        finish='teal',
        mask='iphone-back-device',
    ),
    RecolorJob(
        name='iPad 11 Blue',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-11-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-11-blue.webp'),
        finish='blue',
        mask='ipad-back-device',
    ),
    RecolorJob(
        name='iPad 11 Pink',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-11-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-11-pink.webp'),
        finish='pink',
        mask='ipad-back-device',
    ),
    RecolorJob(
        name='iPad 11 Silver',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-11-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-11-silver.webp'),
        finish='silver',
        mask='ipad-back-device',
    ),
    RecolorJob(
        name='iPad 11 Yellow',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-11-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-11-yellow.webp'),
        finish='yellow',
        mask='ipad-back-device',
    ),
    RecolorJob(
        name='iPad Air 11-inch M3 Blue',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-air-11-m3-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-air-11-m3-blue.webp'),
        finish='blue',
        mask='ipad-back-device',
    ),
    RecolorJob(
        name='iPad Air 11-inch M3 Purple',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-air-11-m3-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-air-11-m3-purple.webp'),
        finish='purple',
        mask='ipad-back-device',
    ),
    RecolorJob(
        name='iPad Air 11-inch M3 Space Gray',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-air-11-m3-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-air-11-m3-space-gray.webp'),
        finish='space-gray',
        mask='ipad-back-device',
    ),
    RecolorJob(
        name='iPad Pro 11-inch M5 Black',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-pro-11-m5-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-pro-11-m5-black.webp'),
        finish='black',
        mask='ipad-back-device',
    ),
    RecolorJob(
        name='iPad Pro 11-inch M5 Silver',
        source_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-pro-11-m5-family-primary.webp'),
        output_path=Path(r'D:\Personal\PZM Website\GiminiImages\tablets\ipad\ipad-pro-11-m5-silver.webp'),
        finish='silver',
        mask='ipad-back-device',
    ),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Create quick recolored device variants from existing catalog images.'
    )
    parser.add_argument(
        '--batch',
        default='active-apple-colors',
        choices=['active-apple-colors'],
        help='Built-in recolor job batch to run.',
    )
    parser.add_argument(
        '--overwrite',
        action='store_true',
        help='Overwrite outputs if they already exist.',
    )
    parser.add_argument(
        '--quality',
        type=int,
        default=90,
        help='WebP quality for the generated variant assets.',
    )
    return parser.parse_args()


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def build_mask(source_image: Image.Image, profile: MaskProfile) -> Image.Image:
    width, height = source_image.size
    rgb_image = source_image.convert('RGB')
    source_pixels = rgb_image.load()
    mask = Image.new('L', source_image.size, 0)
    mask_pixels = mask.load()
    regions = [
        (
            int(width * left),
            int(height * top),
            int(width * right),
            int(height * bottom),
        )
        for left, top, right, bottom in profile.regions
    ]

    for y in range(height):
        for x in range(width):
            inside_region = any(left <= x < right and top <= y < bottom for left, top, right, bottom in regions)
            if not inside_region:
                continue

            red, green, blue = source_pixels[x, y]
            luminance = int((0.299 * red) + (0.587 * green) + (0.114 * blue))

            if luminance < profile.min_luma or luminance > profile.max_luma:
                continue
            if luminance <= profile.exclude_dark or luminance >= profile.exclude_bright:
                continue
            if red > 242 and green > 242 and blue > 242:
                continue

            mask_pixels[x, y] = 255

    return mask.filter(ImageFilter.GaussianBlur(radius=profile.blur_radius))


def apply_finish(red: int, green: int, blue: int, finish: FinishProfile) -> tuple[int, int, int]:
    source_r = red / 255.0
    source_g = green / 255.0
    source_b = blue / 255.0
    target_r = finish.rgb[0] / 255.0
    target_g = finish.rgb[1] / 255.0
    target_b = finish.rgb[2] / 255.0

    target_hue, _, _ = colorsys.rgb_to_hls(target_r, target_g, target_b)
    _, source_lightness, source_saturation = colorsys.rgb_to_hls(source_r, source_g, source_b)

    new_lightness = clamp((source_lightness * finish.lightness_scale) + finish.lightness_shift, 0.02, 0.96)
    new_saturation = clamp(finish.saturation + (source_saturation * 0.08), 0.0, 1.0)
    recolored_r, recolored_g, recolored_b = colorsys.hls_to_rgb(target_hue, new_lightness, new_saturation)

    return (
        int(round(recolored_r * 255)),
        int(round(recolored_g * 255)),
        int(round(recolored_b * 255)),
    )


def recolor_image(source_image: Image.Image, mask: Image.Image, finish: FinishProfile) -> Image.Image:
    source_rgb = source_image.convert('RGB')
    output = Image.new('RGB', source_image.size)
    source_pixels = source_rgb.load()
    mask_pixels = mask.load()
    output_pixels = output.load()
    width, height = source_image.size

    for y in range(height):
        for x in range(width):
            red, green, blue = source_pixels[x, y]
            alpha = mask_pixels[x, y] / 255.0

            if alpha <= 0.0:
                output_pixels[x, y] = (red, green, blue)
                continue

            recolored_red, recolored_green, recolored_blue = apply_finish(red, green, blue, finish)
            blend = alpha * finish.blend
            output_pixels[x, y] = (
                int(round((red * (1.0 - blend)) + (recolored_red * blend))),
                int(round((green * (1.0 - blend)) + (recolored_green * blend))),
                int(round((blue * (1.0 - blend)) + (recolored_blue * blend))),
            )

    return output


def resolve_jobs(batch_name: str) -> tuple[RecolorJob, ...]:
    if batch_name == 'active-apple-colors':
        return ACTIVE_APPLE_COLOR_JOBS

    raise ValueError(f'Unsupported batch: {batch_name}')


def process_job(job: RecolorJob, quality: int, overwrite: bool) -> None:
    finish = FINISHES[job.finish]
    mask_profile = MASKS[job.mask]

    if not job.source_path.exists():
        raise FileNotFoundError(f'Source image not found: {job.source_path}')
    if job.output_path.exists() and not overwrite:
        raise FileExistsError(f'Output already exists: {job.output_path}. Re-run with --overwrite to replace it.')

    with Image.open(job.source_path) as source_image:
        if source_image.mode not in {'RGB', 'RGBA'}:
            source_image = source_image.convert('RGB')

        mask = build_mask(source_image, mask_profile)
        recolored = recolor_image(source_image, mask, finish)

    job.output_path.parent.mkdir(parents=True, exist_ok=True)
    recolored.save(job.output_path, format='WEBP', quality=quality, method=6)
    print(f'Generated: {job.output_path}')


def main() -> int:
    args = parse_args()

    if not features.check('webp'):
        print('Pillow WebP support is not available in this Python environment.', file=sys.stderr)
        return 1

    jobs = resolve_jobs(args.batch)
    failures: list[str] = []

    for job in jobs:
        try:
            process_job(job, quality=args.quality, overwrite=args.overwrite)
        except Exception as exc:
            failures.append(f'{job.name}: {exc}')
            print(f'Failed: {job.name}: {exc}', file=sys.stderr)

    if failures:
        print('\nRecolor run finished with failures:', file=sys.stderr)
        for failure in failures:
            print(f'- {failure}', file=sys.stderr)
        return 1

    print(f'\nDone. Generated {len(jobs)} recolored variant assets.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())