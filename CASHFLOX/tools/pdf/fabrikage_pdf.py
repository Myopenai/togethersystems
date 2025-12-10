import argparse
import hashlib
import json
import os
from datetime import datetime
from typing import List, Optional, Tuple

import fitz  # PyMuPDF


def hex_to_rgb01(hex_color: str) -> Tuple[float, float, float]:
    hex_color = (hex_color or '').strip().lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c * 2 for c in hex_color])
    if len(hex_color) != 6:
        return 0.0, 0.0, 0.0
    r = int(hex_color[0:2], 16) / 255.0
    g = int(hex_color[2:4], 16) / 255.0
    b = int(hex_color[4:6], 16) / 255.0
    return r, g, b


def load_config(path: Optional[str]) -> dict:
    if not path or not os.path.exists(path):
        return {}
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def apply_redactions(doc: fitz.Document, patterns: List[str]) -> int:
    redactions = 0
    for page in doc:
        for pattern in patterns:
            if not pattern:
                continue
            # Use default case-sensitive search_for compatible with PyMuPDF 1.24.x
            # Call once with the given pattern; patterns list already contains upper/lower variants as needed.
            rects = page.search_for(pattern)
            for rect in rects:
                page.add_redact_annot(rect, fill=(1, 1, 1))
                redactions += 1
        # Apply any redaction annotations on the page (no-op if none were added)
        try:
            page.apply_redactions()
        except Exception:
            pass
    return redactions


def add_header(doc: fitz.Document, label: str, height_px: int, bg_hex: str, fg_hex: str,
               logo_path: Optional[str], logo_wh: Tuple[int, int], logo_fallback_text: str) -> None:
    bg = hex_to_rgb01(bg_hex)
    fg = hex_to_rgb01(fg_hex)

    for page in doc:
        width = page.rect.width
        rect = fitz.Rect(0, 0, width, float(height_px))
        page.draw_rect(rect, color=None, fill=bg, width=0)

        # Logo (left)
        x_offset = 12.0
        if logo_path and os.path.exists(logo_path):
            try:
                pix = fitz.Pixmap(logo_path)
                page.insert_image(
                    fitz.Rect(x_offset, 6, x_offset + logo_wh[0], 6 + logo_wh[1]),
                    pixmap=pix,
                    keep_proportion=True
                )
                x_offset += logo_wh[0] + 8
            except Exception:
                # Fallback to text logo
                page.insert_text((x_offset, height_px - 10), logo_fallback_text, color=fg, fontsize=10)
                x_offset += 80
        else:
            page.insert_text((x_offset, height_px - 10), logo_fallback_text, color=fg, fontsize=10)
            x_offset += 80

        # Label (right)
        page.insert_textbox(
            fitz.Rect(x_offset, 4, width - 10, height_px - 4),
            label,
            color=fg,
            fontsize=10,
            align=2  # right
        )


def set_stamp_metadata(doc: fitz.Document, stamp: dict, sha256: Optional[str]) -> None:
    meta = doc.metadata or {}
    meta['producer'] = 'Fabrikage PDF Processor'
    meta['creationDate'] = datetime.utcnow().strftime('D:%Y%m%d%H%M%SZ')
    meta['modDate'] = datetime.utcnow().strftime('D:%Y%m%d%H%M%SZ')
    meta['keywords'] = f"fabrikage, together-systems, replica:{stamp.get('version','')}, sha256:{sha256 or ''}"
    meta['subject'] = f"FABRIKAGE STAMP {stamp.get('version','')} — {stamp.get('document_id','')}"
    meta['author'] = "TogetherSystems"
    meta['title'] = "Fabrikage Processed Document"
    doc.set_metadata(meta)


def compute_sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


def save_report(report_path: str, source_pdf: str, output_pdf: str, sha_in: str, sha_out: str,
                stamp: dict, stats: dict) -> None:
    payload = {
        "meta": {
            "generator": "Fabrikage PDF Processor",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        },
        "input": {
            "file": os.path.abspath(source_pdf),
            "sha256": sha_in
        },
        "output": {
            "file": os.path.abspath(output_pdf),
            "sha256": sha_out
        },
        "stamp": {
            "version": stamp.get("version"),
            "signature": stamp.get("signature"),
            "document_id": stamp.get("document_id"),
            "repo": stamp.get("repo")
        },
        "stats": stats
    }
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


def process_pdf(input_pdf: str, output_pdf: str, cfg: dict) -> None:
    patterns = cfg.get('remove_text_patterns', [])
    header = cfg.get('header', {})
    logo = cfg.get('logo', {})
    stamp = cfg.get('stamp', {})

    sha_in = compute_sha256(input_pdf)

    doc = fitz.open(input_pdf)

    redactions = apply_redactions(doc, patterns)

    if header.get('enabled', True):
        add_header(
            doc,
            label=header.get('label', 'FABRIKAGE'),
            height_px=int(header.get('height_px', 34)),
            bg_hex=header.get('bg_color', '#F3F4F6'),
            fg_hex=header.get('fg_color', '#111827'),
            logo_path=logo.get('path') or None,
            logo_wh=(int(logo.get('width_px', 120)), int(logo.get('height_px', 20))),
            logo_fallback_text=logo.get('text_fallback', 'FABRIKAGE')
        )

    # Save preliminary to compute output sha
    doc.save(output_pdf)
    doc.close()

    sha_out = compute_sha256(output_pdf)

    # Set metadata with stamp/sha (requires reopening to inject meta consistently)
    doc2 = fitz.open(output_pdf)
    set_stamp_metadata(doc2, stamp, sha_out)
    doc2.save(output_pdf, incremental=True)
    doc2.close()

    save_report(
        report_path=os.path.splitext(output_pdf)[0] + ".report.json",
        source_pdf=input_pdf,
        output_pdf=output_pdf,
        sha_in=sha_in,
        sha_out=sha_out,
        stamp=stamp,
        stats={
            "redactions": redactions,
            "patterns": patterns
        }
    )


def main():
    parser = argparse.ArgumentParser(description="Fabrikage PDF Processor — redact text, add header/logo, stamp & report.")
    parser.add_argument("-i", "--input", required=True, help="Input PDF file path")
    parser.add_argument("-o", "--output", required=True, help="Output PDF file path")
    parser.add_argument("-c", "--config", default="config/fabrikage_pdf.config.json", help="Config JSON path")
    args = parser.parse_args()

    cfg = load_config(args.config)

    if not os.path.exists(args.input):
        raise SystemExit(f"Input not found: {args.input}")

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    process_pdf(args.input, args.output, cfg)
    print(f"OK: Wrote {args.output} and report {os.path.splitext(args.output)[0] + '.report.json'}")


if __name__ == "__main__":
    main()


