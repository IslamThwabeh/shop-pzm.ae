from __future__ import annotations

import argparse
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError, features


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_SIZE = (1000, 1000)
DEFAULT_QUALITY = 80


@dataclass
class OptimizationReport:
    scanned: int = 0
    processed: int = 0
    failed: list[str] = field(default_factory=list)
    total_before_bytes: int = 0
    total_after_bytes: int = 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Back up and optimize ecommerce images into WebP format."
    )
    parser.add_argument(
        "--source",
        default=r"D:\Personal\PZM Website\GiminiImages",
        help="Source folder to optimize.",
    )
    parser.add_argument(
        "--backup",
        default=r"D:\Personal\PZM Website\GiminiImages_backup",
        help="Backup folder created before optimization.",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=DEFAULT_QUALITY,
        help="WebP quality setting.",
    )
    return parser.parse_args()


def format_bytes(size: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    value = float(size)
    unit = units[0]
    for unit in units:
        if value < 1024 or unit == units[-1]:
            break
        value /= 1024
    return f"{value:.2f} {unit}"


def iter_source_images(source_dir: Path) -> list[Path]:
    return sorted(
        path
        for path in source_dir.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def create_backup(source_dir: Path, backup_dir: Path) -> None:
    if backup_dir.exists():
        raise FileExistsError(
            f"Backup directory already exists: {backup_dir}. Remove or rename it before running again."
        )

    shutil.copytree(source_dir, backup_dir, copy_function=shutil.copy2)


def prepare_image(image: Image.Image, original_path: Path) -> Image.Image:
    image = ImageOps.exif_transpose(image)

    if image.mode not in {"RGB", "RGBA"}:
        if image.mode in {"P", "LA"} or (
            image.mode == "L" and "transparency" in image.info
        ):
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")

    if image.mode == "RGBA" and original_path.suffix.lower() in {".jpg", ".jpeg"}:
        image = image.convert("RGB")

    resized = image.copy()
    resized.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
    return resized


def optimize_image(image_path: Path, quality: int) -> tuple[int, int]:
    output_path = image_path.with_suffix(".webp")
    temp_output_path = output_path.with_name(f"{output_path.stem}.tmp.webp")

    before_size = image_path.stat().st_size

    with Image.open(image_path) as source_image:
        optimized_image = prepare_image(source_image, image_path)

        save_kwargs = {
            "format": "WEBP",
            "quality": quality,
            "method": 6,
        }

        if optimized_image.mode == "RGBA":
            save_kwargs["lossless"] = False

        optimized_image.save(temp_output_path, **save_kwargs)

    after_size = temp_output_path.stat().st_size
    temp_output_path.replace(output_path)
    image_path.unlink()
    return before_size, after_size


def print_report(report: OptimizationReport) -> None:
    reduction = 0.0
    if report.total_before_bytes > 0:
        reduction = (
            (report.total_before_bytes - report.total_after_bytes)
            / report.total_before_bytes
        ) * 100

    print("\nOptimization Report")
    print(f"Total images processed: {report.processed}")
    print(
        "Total size before vs after: "
        f"{format_bytes(report.total_before_bytes)} -> {format_bytes(report.total_after_bytes)}"
    )
    print(f"Size reduction: {reduction:.2f}%")

    if report.failed:
        print("Failed files:")
        for failure in report.failed:
            print(f"- {failure}")
    else:
        print("Failed files: none")


def main() -> int:
    args = parse_args()
    source_dir = Path(args.source)
    backup_dir = Path(args.backup)

    if not source_dir.exists() or not source_dir.is_dir():
        print(f"Source directory does not exist: {source_dir}", file=sys.stderr)
        return 1

    if not features.check("webp"):
        print("Pillow WebP support is not available in this Python environment.", file=sys.stderr)
        return 1

    print(f"Creating backup: {source_dir} -> {backup_dir}")
    create_backup(source_dir, backup_dir)
    print("Backup completed successfully.")

    report = OptimizationReport()
    image_paths = iter_source_images(source_dir)
    report.scanned = len(image_paths)

    for image_path in image_paths:
        try:
            before_size, after_size = optimize_image(image_path, args.quality)
            report.processed += 1
            report.total_before_bytes += before_size
            report.total_after_bytes += after_size
            print(f"Optimized: {image_path}")
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            report.failed.append(f"{image_path} :: {exc}")
            print(f"Failed: {image_path} :: {exc}", file=sys.stderr)
        except Exception as exc:
            report.failed.append(f"{image_path} :: {exc}")
            print(f"Failed: {image_path} :: {exc}", file=sys.stderr)

    print_report(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())