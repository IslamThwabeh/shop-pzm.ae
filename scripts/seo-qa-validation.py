#!/usr/bin/env python3
"""
seo-qa-validation.py — Live SEO QA validator for https://pzm.ae

Usage
-----
    # Audit every URL in the live sitemap (default)
    python scripts/seo-qa-validation.py

    # Also audit the GSC error URL lists you exported as plain text files
    python scripts/seo-qa-validation.py \
        --gsc-page-with-redirect gsc/page-with-redirect.txt \
        --gsc-alternate-canonical gsc/alternate-canonical.txt \
        --gsc-not-found gsc/not-found.txt \
        --gsc-crawled-not-indexed gsc/crawled-not-indexed.txt \
        --gsc-noindex gsc/noindex.txt \
        --gsc-redirect-error gsc/redirect-error.txt \
        --gsc-discovered-not-indexed gsc/discovered-not-indexed.txt

Outputs
-------
    out/seo-audit.csv          — one row per URL with all signals
    out/seo-audit.md           — human-readable Markdown report
    out/seo-audit-issues.csv   — only URLs that failed at least one check

Requires: requests, lxml  (pip install requests lxml)
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import csv
import dataclasses
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import requests

SITE = "https://pzm.ae"
SITEMAP = f"{SITE}/sitemap.xml"
ROBOTS = f"{SITE}/robots.txt"
USER_AGENT = "PZM-SEO-QA/1.0 (+https://pzm.ae)"
TIMEOUT = 20
MAX_WORKERS = 10

CANONICAL_RE = re.compile(
    r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', re.I)
ROBOTS_META_RE = re.compile(
    r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']+)["\']', re.I)
TITLE_RE = re.compile(r"<title>([^<]+)</title>", re.I)
OG_URL_RE = re.compile(
    r'<meta[^>]+property=["\']og:url["\'][^>]+content=["\']([^"\']+)["\']', re.I)
JSONLD_BLOCK_RE = re.compile(
    r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S)


@dataclasses.dataclass
class AuditRow:
    url: str
    final_url: str = ""
    status: int = 0
    redirect_chain: str = ""
    title: str = ""
    canonical: str = ""
    canonical_self: bool = False
    robots_meta: str = ""
    is_noindex: bool = False
    og_url: str = ""
    og_url_matches_canonical: bool = False
    jsonld_blocks: int = 0
    has_product: bool = False
    has_breadcrumb: bool = False
    has_organization: bool = False
    has_itemlist: bool = False
    word_count: int = 0
    issues: str = ""


def fetch(url: str, allow_redirects: bool = True) -> requests.Response | None:
    try:
        return requests.get(
            url,
            allow_redirects=allow_redirects,
            timeout=TIMEOUT,
            headers={"User-Agent": USER_AGENT},
        )
    except requests.RequestException as exc:
        print(f"  ! fetch error {url}: {exc}", file=sys.stderr)
        return None


def discover_sitemap_urls() -> list[str]:
    r = fetch(SITEMAP)
    if not r or r.status_code != 200:
        print("Sitemap not reachable.", file=sys.stderr)
        return []
    locs = re.findall(r"<loc>([^<]+)</loc>", r.text)
    return [u.strip() for u in locs]


def parse_jsonld_types(html: str) -> tuple[int, set[str]]:
    types: set[str] = set()
    blocks = JSONLD_BLOCK_RE.findall(html)
    for raw in blocks:
        try:
            data = json.loads(raw.strip())
        except Exception:
            # Be tolerant: try greedy first object recovery
            m = re.search(r"\{.*\}", raw, re.S)
            if not m:
                continue
            try:
                data = json.loads(m.group(0))
            except Exception:
                continue
        for node in _iter_jsonld(data):
            t = node.get("@type")
            if isinstance(t, list):
                for tt in t:
                    if isinstance(tt, str):
                        types.add(tt)
            elif isinstance(t, str):
                types.add(t)
    return len(blocks), types


def _iter_jsonld(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from _iter_jsonld(v)
    elif isinstance(node, list):
        for item in node:
            yield from _iter_jsonld(item)


def trace_redirects(url: str, max_hops: int = 6) -> tuple[str, int, str]:
    chain: list[str] = [url]
    current = url
    for _ in range(max_hops):
        try:
            r = requests.get(
                current,
                allow_redirects=False,
                timeout=TIMEOUT,
                headers={"User-Agent": USER_AGENT},
            )
        except requests.RequestException as exc:
            return " -> ".join(chain) + f" :: ERR {exc}", 0, current
        if r.is_redirect or r.status_code in (301, 302, 303, 307, 308):
            loc = r.headers.get("Location") or ""
            target = urljoin(current, loc)
            chain.append(f"[{r.status_code}] -> {target}")
            current = target
            continue
        chain.append(f"[{r.status_code}]")
        return " ".join(chain), r.status_code, current
    return " ".join(chain) + " :: TOO_MANY_HOPS", 0, current


def audit(url: str) -> AuditRow:
    row = AuditRow(url=url)
    chain, final_status, final_url = trace_redirects(url)
    row.redirect_chain = chain
    row.status = final_status
    row.final_url = final_url
    if final_status != 200:
        row.issues = f"non-200 final status ({final_status})"
        return row

    r = fetch(final_url, allow_redirects=False)
    if not r:
        row.issues = "fetch failed after redirect resolution"
        return row

    html = r.text
    row.title = (TITLE_RE.search(html).group(1).strip()
                 if TITLE_RE.search(html) else "")
    row.canonical = (CANONICAL_RE.search(html).group(1).strip()
                     if CANONICAL_RE.search(html) else "")
    row.robots_meta = (ROBOTS_META_RE.search(html).group(1).strip()
                       if ROBOTS_META_RE.search(html) else "")
    row.og_url = (OG_URL_RE.search(html).group(1).strip()
                  if OG_URL_RE.search(html) else "")
    row.canonical_self = (row.canonical.rstrip("/") == final_url.rstrip("/"))
    row.og_url_matches_canonical = bool(
        row.og_url and row.canonical and
        row.og_url.rstrip("/") == row.canonical.rstrip("/"))
    row.is_noindex = "noindex" in row.robots_meta.lower()

    blocks, types = parse_jsonld_types(html)
    row.jsonld_blocks = blocks
    row.has_product = "Product" in types
    row.has_breadcrumb = "BreadcrumbList" in types
    row.has_organization = bool(
        types & {"Organization", "LocalBusiness", "Store", "ComputerStore",
                 "MobilePhoneStore", "ElectronicsStore", "HomeAndConstructionBusiness"})
    row.has_itemlist = "ItemList" in types

    text = re.sub(r"<[^>]+>", " ", html)
    row.word_count = len([w for w in text.split() if w])

    issues: list[str] = []
    if not row.canonical:
        issues.append("missing canonical")
    elif not row.canonical_self:
        issues.append(f"canonical mismatch -> {row.canonical}")
    if row.is_noindex and "/services/" not in url and "/areas/" not in url \
            and "/product/" not in url and url.rstrip("/") != SITE:
        # noindex on legal pages is acceptable; flag only on indexable types
        pass
    if "/product/" in url and not row.has_product:
        issues.append("product page missing Product JSON-LD")
    if url.rstrip("/") == SITE and not row.has_organization:
        issues.append("homepage missing Organization/LocalBusiness JSON-LD")
    if not row.has_breadcrumb and "/product/" in url:
        issues.append("product page missing BreadcrumbList JSON-LD")
    row.issues = "; ".join(issues)
    return row


def load_url_list(path: str | None) -> list[str]:
    if not path:
        return []
    p = Path(path)
    if not p.exists():
        print(f"  ! list file missing: {p}", file=sys.stderr)
        return []
    return [
        line.strip() for line in p.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gsc-page-with-redirect")
    parser.add_argument("--gsc-alternate-canonical")
    parser.add_argument("--gsc-not-found")
    parser.add_argument("--gsc-crawled-not-indexed")
    parser.add_argument("--gsc-noindex")
    parser.add_argument("--gsc-redirect-error")
    parser.add_argument("--gsc-discovered-not-indexed")
    parser.add_argument("--out-dir", default="out")
    parser.add_argument("--max", type=int, default=0,
                        help="Limit total URLs (0 = no limit)")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 0. crawlability gates
    print("== Crawlability gates ==")
    rb = fetch(ROBOTS)
    print(f"  robots.txt: {rb.status_code if rb else 'ERR'}")
    sm = fetch(SITEMAP)
    print(f"  sitemap.xml: {sm.status_code if sm else 'ERR'}")

    sitemap_urls = discover_sitemap_urls()
    print(f"  sitemap URLs: {len(sitemap_urls)}")

    buckets: dict[str, list[str]] = {
        "sitemap": sitemap_urls,
        "page-with-redirect": load_url_list(args.gsc_page_with_redirect),
        "alternate-canonical": load_url_list(args.gsc_alternate_canonical),
        "not-found": load_url_list(args.gsc_not_found),
        "crawled-not-indexed": load_url_list(args.gsc_crawled_not_indexed),
        "noindex": load_url_list(args.gsc_noindex),
        "redirect-error": load_url_list(args.gsc_redirect_error),
        "discovered-not-indexed": load_url_list(
            args.gsc_discovered_not_indexed),
    }

    seen: set[str] = set()
    targets: list[tuple[str, str]] = []  # (bucket, url)
    for bucket, urls in buckets.items():
        for u in urls:
            if u in seen:
                continue
            seen.add(u)
            targets.append((bucket, u))
    if args.max:
        targets = targets[: args.max]

    print(f"\n== Auditing {len(targets)} URLs with {MAX_WORKERS} workers ==")
    rows: list[tuple[str, AuditRow]] = []
    started = time.time()
    with cf.ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        future_map = {pool.submit(audit, u): (bucket, u)
                      for bucket, u in targets}
        for i, fut in enumerate(cf.as_completed(future_map), 1):
            bucket, u = future_map[fut]
            try:
                row = fut.result()
            except Exception as exc:
                row = AuditRow(url=u, issues=f"audit exception: {exc}")
            rows.append((bucket, row))
            if i % 25 == 0 or i == len(targets):
                print(f"  {i}/{len(targets)} ({time.time()-started:.1f}s)")

    # CSV (full)
    csv_path = out_dir / "seo-audit.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["bucket", *[f.name for f in dataclasses.fields(AuditRow)]])
        for bucket, row in rows:
            w.writerow([bucket, *[getattr(row, f.name)
                                  for f in dataclasses.fields(AuditRow)]])

    # CSV (issues only)
    issues_path = out_dir / "seo-audit-issues.csv"
    with issues_path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["bucket", "url", "status", "issues",
                    "redirect_chain", "canonical", "robots_meta"])
        for bucket, row in rows:
            if row.issues or row.status != 200:
                w.writerow([bucket, row.url, row.status, row.issues,
                            row.redirect_chain, row.canonical,
                            row.robots_meta])

    # Markdown summary
    md_path = out_dir / "seo-audit.md"
    by_bucket: dict[str, list[AuditRow]] = {}
    for bucket, row in rows:
        by_bucket.setdefault(bucket, []).append(row)
    with md_path.open("w", encoding="utf-8") as fh:
        fh.write("# pzm.ae SEO QA Audit\n\n")
        fh.write(f"- Total URLs audited: **{len(rows)}**\n")
        fh.write(f"- Sitemap URLs: **{len(sitemap_urls)}**\n\n")
        fh.write("## Bucket summary\n\n")
        fh.write("| Bucket | Audited | 200 OK | Redirects | 4xx/5xx | Issues |\n")
        fh.write("|---|---:|---:|---:|---:|---:|\n")
        for bucket, items in by_bucket.items():
            ok = sum(1 for r in items if r.status == 200)
            redir = sum(1 for r in items if 300 <= r.status < 400)
            err = sum(1 for r in items if r.status >= 400 or r.status == 0)
            iss = sum(1 for r in items if r.issues)
            fh.write(f"| {bucket} | {len(items)} | {ok} | {redir} | {err} | {iss} |\n")
        fh.write("\n## Failed URLs (top 50)\n\n")
        bad = [(b, r) for b, r in rows if r.issues or r.status != 200][:50]
        for b, r in bad:
            fh.write(f"- `[{b}]` `{r.url}` -> status {r.status}  \n")
            if r.issues:
                fh.write(f"  - issues: {r.issues}\n")
            if r.redirect_chain:
                fh.write(f"  - chain: {r.redirect_chain}\n")
    print(f"\nWrote {csv_path}\nWrote {issues_path}\nWrote {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
