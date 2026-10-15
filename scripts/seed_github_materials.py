#!/usr/bin/env python3
"""Seed public.materials from materials/manifest.csv (GitHub hybrid).

Reads secrets from ~/.config/ebb/supabase.env (not committed).
Idempotent upsert on file_path.
"""
from __future__ import annotations

import csv
import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "materials" / "manifest.csv"
ENV_FILE = Path.home() / ".config" / "ebb" / "supabase.env"

GITHUB_RAW = "https://raw.githubusercontent.com/Remmy1-AI/engineering-brain-bank/main/"
# Prefer Google Drive links from the manifest when present (works if the GitHub repo is private).
DRIVE_FILE_RE = re.compile(r"/file/d/([^/?]+)")
DRIVE_OPEN_RE = re.compile(r"[?&]id=([a-zA-Z0-9_-]+)")

DEPT_BY_PREFIX = {
    "CE": "civil",
    "EE": "electrical",
    "ME": "mechanical",
    "COE": "computer",
    "CHE": "chemical",
    "IE": "industrial",
    "AE": "agricultural",
    "MATH": "general",
    "ENGL": "general",
    "GE": "general",
    "CENG": "general",
    "MME": "mechanical",
    "SEMESTER": "general",
}

TYPE_MAP = {
    "notes": "notes",
    "past-questions": "past-questions",
    "slides": "slides",
    "tutorials": "tutorials",
    "videos": "videos",
    "shared": "shared",
}


def load_env() -> dict:
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    for k in (
        "EBB_SUPABASE_URL",
        "EBB_SUPABASE_SERVICE_ROLE_KEY",
        "EBB_SUPABASE_ACCESS_TOKEN",
    ):
        if os.environ.get(k):
            env[k] = os.environ[k]
    return env


def course_code_from_folder(folder: str) -> str:
    """AE-196-Engineering-Workshop-Practice -> AE 196"""
    if not folder:
        return ""
    if folder.lower().startswith("extras"):
        # extras-BASIC-ELECTRONICS-EE-152 -> EE 152 if trailing CODE-NUM
        m = re.search(r"([A-Za-z]+)-(\d{2,3})(?:-|$)", folder)
        if m:
            return f"{m.group(1).upper()} {m.group(2)}"
        return folder.replace("-", " ")[:80]
    m = re.match(r"^([A-Za-z]+)-(\d{2,4})(?:-|$)", folder)
    if m:
        return f"{m.group(1).upper()} {m.group(2)}"
    return folder.replace("-", " ")[:80]


def department_for(folder: str, code: str) -> str:
    pref = (code.split() or [""])[0].upper()
    if pref in DEPT_BY_PREFIX:
        return DEPT_BY_PREFIX[pref]
    head = folder.split("-")[0].upper()
    return DEPT_BY_PREFIX.get(head, "general")


def level_for(year: str) -> str:
    y = (year or "").strip()
    return {"1": "100", "2": "200", "3": "300", "4": "400"}.get(y, y or None)


def mime_for(name: str) -> str:
    mimetypes.add_type("application/vnd.openxmlformats-officedocument.presentationml.presentation", ".pptx")
    mimetypes.add_type("application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx")
    mimetypes.add_type("video/mp4", ".mp4")
    mimetypes.add_type("application/octet-stream", ".prt")
    mimetypes.add_type("application/octet-stream", ".camrec")
    guess, _ = mimetypes.guess_type(name)
    return guess or "application/octet-stream"


def github_url(rel_path: str) -> str:
    parts = rel_path.replace("\\", "/").lstrip("/").split("/")
    return GITHUB_RAW + "/".join(urllib.request.quote(p, safe="") for p in parts)


def drive_id(source_url: str) -> str | None:
    if not source_url:
        return None
    m = DRIVE_FILE_RE.search(source_url) or DRIVE_OPEN_RE.search(source_url)
    return m.group(1) if m else None


def drive_urls(source_url: str) -> tuple[str | None, str | None]:
    """Return (view/preview url, download url)."""
    did = drive_id(source_url)
    if not did:
        return None, None
    view = f"https://drive.google.com/file/d/{did}/preview"
    download = f"https://drive.google.com/uc?export=download&id={did}"
    return view, download


def title_from_name(name: str) -> str:
    stem = Path(name).stem
    stem = re.sub(r"\s+", " ", stem).strip()
    return stem[:200] or name[:200]


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


def run_sql(token: str, ref: str, query: str):
    url = f"https://api.supabase.com/v1/projects/{ref}/database/query"
    data = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.status, json.loads(resp.read().decode() or "null")


def upsert_batch(url: str, key: str, rows: list[dict]):
    body = json.dumps(rows).encode()
    req = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/materials?on_conflict=file_path",
        data=body,
        method="POST",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"upsert failed {e.code}: {e.read()[:500]}") from e


def main() -> int:
    env = load_env()
    url = env.get("EBB_SUPABASE_URL")
    key = env.get("EBB_SUPABASE_SERVICE_ROLE_KEY")
    token = env.get("EBB_SUPABASE_ACCESS_TOKEN")
    ref = env.get("EBB_SUPABASE_REF", "jcybycszuxlzkfjsmxjp")
    if not url or not key:
        print("Missing EBB_SUPABASE_URL / SERVICE_ROLE_KEY", file=sys.stderr)
        return 1
    if not MANIFEST.exists():
        print(f"Missing manifest: {MANIFEST}", file=sys.stderr)
        return 1

    # Apply migration if token present
    mig = ROOT / "supabase" / "schema_github_hybrid.sql"
    if token and mig.exists():
        print("Applying schema_github_hybrid.sql …")
        run_sql(token, ref, mig.read_text())
        print("Migration OK")

    by_path: dict[str, dict] = {}
    with MANIFEST.open(newline="", encoding="utf-8", errors="replace") as f:
        for r in csv.DictReader(f):
            path = (r.get("path") or "").strip().replace("\\", "/")
            if not path or path.endswith("manifest.csv"):
                continue
            folder = r.get("course") or ""
            code = course_code_from_folder(folder)
            mtype = TYPE_MAP.get((r.get("type") or "").strip(), "shared")
            name = path.rsplit("/", 1)[-1]
            size = int(r.get("size_bytes") or 0)
            # Always index GitHub raw URLs so Watch/Download stay on our site
            # (repo must be public for anonymous raw.githubusercontent.com access).
            # Drive source_url is ignored for serving — kept only in git history/manifest.
            gh = github_url(path)
            by_path[path] = {
                "title": title_from_name(name),
                "description": f"{folder} · {r.get('type') or ''}".strip(" ·")[:1000],
                "course_code": code or None,
                "department": department_for(folder, code),
                "level": level_for(r.get("year") or ""),
                "material_type": mtype,
                "file_path": path,
                "file_name": name,
                "mime_type": mime_for(name),
                "file_size": size,
                "published": True,
                "source": "github",
                "external_url": gh,
                "download_url": gh,
            }

    rows_out = list(by_path.values())
    print(f"Seeding {len(rows_out)} materials (deduped by file_path) …")
    batch = 50
    for i in range(0, len(rows_out), batch):
        chunk = rows_out[i : i + batch]
        upsert_batch(url, key, chunk)
        print(f"  upserted {min(i + batch, len(rows_out))}/{len(rows_out)}")

    # verify count via REST
    req = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/materials?select=id&select=id",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Prefer": "count=exact",
            "Range": "0-0",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        print("materials_total", resp.headers.get("Content-Range"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
