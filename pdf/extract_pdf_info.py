"""
Extract information from PDF file
"""
import sys
import fitz  # PyMuPDF

if len(sys.argv) < 2:
    print("Usage: python extract_pdf_info.py <pdf_file>")
    sys.exit(1)

pdf_path = sys.argv[1]

try:
    doc = fitz.open(pdf_path)
    print(f"Seiten: {len(doc)}")
    print(f"\nMetadaten:")
    meta = doc.metadata
    for key, value in meta.items():
        if value:
            print(f"  {key}: {value}")
    
    # Extract text from first page
    if len(doc) > 0:
        page = doc[0]
        text = page.get_text()
        print(f"\nErste Seite Text (erste 1000 Zeichen):")
        print(text[:1000])
    
    doc.close()
except Exception as e:
    print(f"Fehler: {e}")
    sys.exit(1)

