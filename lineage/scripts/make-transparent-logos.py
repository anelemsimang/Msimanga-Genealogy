"""Strip solid plate backgrounds so logo PNGs have real alpha."""

from collections import deque
from pathlib import Path

from PIL import Image

brand = Path(r"C:\Users\USER\Desktop\Msimanga\lineage\public\images\brand")


def color_dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def flood_from_target(
    im: Image.Image,
    target: tuple[int, int, int],
    seeds: list[tuple[int, int]],
    tol: float,
) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        r, g, b, a = px[x, y]
        if a == 0:
            return
        if color_dist((r, g, b), target) <= tol:
            idx = y * w + x
            if not visited[idx]:
                visited[idx] = 1
                q.append((x, y))

    for x, y in seeds:
        if 0 <= x < w and 0 <= y < h:
            try_seed(x, y)

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or ny < 0 or nx >= w or ny >= h:
                continue
            idx = ny * w + nx
            if visited[idx]:
                continue
            nr, ng, nb, na = px[nx, ny]
            if na == 0:
                visited[idx] = 1
                continue
            if color_dist((nr, ng, nb), target) <= tol:
                visited[idx] = 1
                q.append((nx, ny))
    return im


def corner_target(im: Image.Image) -> tuple[int, int, int]:
    w, h = im.size
    px = im.load()
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    samples = [px[x, y][:3] for x, y in corners]
    return (
        sum(c[0] for c in samples) // 4,
        sum(c[1] for c in samples) // 4,
        sum(c[2] for c in samples) // 4,
    )


def edge_seeds(im: Image.Image) -> list[tuple[int, int]]:
    w, h = im.size
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    step_x = max(1, w // 64)
    step_y = max(1, h // 64)
    for x in range(0, w, step_x):
        seeds.append((x, 0))
        seeds.append((x, h - 1))
    for y in range(0, h, step_y):
        seeds.append((0, y))
        seeds.append((w - 1, y))
    return seeds


def flood_clear_corners(im: Image.Image, tol: float = 52.0) -> Image.Image:
    target = corner_target(im)
    return flood_from_target(im, target, edge_seeds(im), tol)


def flood_clear_plate_touching_alpha(im: Image.Image, tol: float = 40.0) -> Image.Image:
    """Second pass: clear light/dark plate that touches already-transparent pixels."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()

    # Collect opaque neighbors of transparent pixels as candidate plate seeds
    seeds: list[tuple[int, int]] = []
    samples: list[tuple[int, int, int]] = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] != 0:
                continue
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if nx < 0 or ny < 0 or nx >= w or ny >= h:
                    continue
                r, g, b, a = px[nx, ny]
                if a == 0:
                    continue
                # Plate candidates: light parchment OR near-black (not mid brown art)
                lum = (r + g + b) / 3
                is_parchment = r > 200 and g > 190 and b > 160
                is_dark_plate = lum < 55 and abs(r - g) < 25 and abs(g - b) < 25
                if is_parchment or is_dark_plate:
                    seeds.append((nx, ny))
                    samples.append((r, g, b))

    if not samples:
        return im

    # Use median-ish average of plate samples
    target = (
        sum(c[0] for c in samples) // len(samples),
        sum(c[1] for c in samples) // len(samples),
        sum(c[2] for c in samples) // len(samples),
    )
    # Deduplicate seeds lightly
    uniq = list(dict.fromkeys(seeds))[:5000]
    return flood_from_target(im, target, uniq, tol)


def clear_light_fringe(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if r > 228 and g > 220 and b > 200:
                px[x, y] = (r, g, b, 0)
            elif abs(r - g) < 14 and abs(g - b) < 14 and r > 195:
                px[x, y] = (r, g, b, 0)
    return im


def chroma_key_plate(im: Image.Image, light: bool) -> Image.Image:
    """Clear enclosed plate leftovers (e.g. letter counters) flood can't reach."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            lum = (r + g + b) / 3
            drop = False
            if lum < 55 and abs(r - g) < 30 and abs(g - b) < 30:
                drop = True  # near-black plate / counters
            if light and r > 200 and g > 185 and b > 155:
                drop = True  # parchment
            if light and abs(r - g) < 18 and abs(g - b) < 18 and r > 185:
                drop = True  # light gray fringe
            if drop:
                px[x, y] = (r, g, b, 0)
    return im


def process(src: Path, dest: Path, light: bool) -> None:
    out = flood_clear_corners(Image.open(src), tol=52.0)
    # Icons/banners with rounded parchment plate need a second flood
    out = flood_clear_plate_touching_alpha(out, tol=42.0 if light else 38.0)
    if light:
        out = clear_light_fringe(out)
    out = chroma_key_plate(out, light=light)
    out.save(dest, "PNG")
    opaque = sum(
        1
        for y in range(out.size[1])
        for x in range(out.size[0])
        if out.getpixel((x, y))[3] > 128
    )
    print(f"saved {dest.name} opaque={opaque} corner={out.getpixel((0, 0))}")


jobs = [
    ("msimanga-banner-light.png", "msimanga-banner-light-transparent.png", True),
    ("msimanga-banner-dark.png", "msimanga-banner-dark-transparent.png", False),
    ("msimanga-icon-light.png", "msimanga-icon-light-transparent.png", True),
    ("msimanga-icon-dark.png", "msimanga-icon-dark-transparent.png", False),
]

for src_name, dest_name, light in jobs:
    process(brand / src_name, brand / dest_name, light)

print("done")
