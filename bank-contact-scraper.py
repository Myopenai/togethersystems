#!/usr/bin/env python3
"""
Bank Contact Scraper
Extrahiert Kontaktinformationen von Banken und Finanzinstituten
Output: CSV mit E-Mail-Adressen und Kontaktformular-URLs

Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
"""

import requests
from bs4 import BeautifulSoup
import re
import csv
import json
from urllib.parse import urljoin, urlparse
from datetime import datetime
import time
import sys

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9.\-_+]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"(\+?\d{1,3}[\s\-]?)?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}")

KEYWORDS = ["kontakt", "contact", "support", "impressum", "service", "help", "anfrage", "anruf"]

def find_contact_pages(base_url, max_pages=10):
    """Finde Kontakt-Seiten auf einer Webseite"""
    try:
        resp = requests.get(base_url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp.raise_for_status()
    except Exception as e:
        print(f"Fehler beim Laden von {base_url}: {e}", file=sys.stderr)
        return []

    soup = BeautifulSoup(resp.text, 'html.parser')
    links = []
    seen = set()

    for a in soup.find_all("a", href=True):
        href = a["href"].lower()
        text = (a.get_text() or "").lower()
        
        if any(k in href for k in KEYWORDS) or any(k in text for k in KEYWORDS):
            full_url = urljoin(base_url, a["href"])
            if full_url not in seen:
                seen.add(full_url)
                links.append(full_url)
                if len(links) >= max_pages:
                    break

    return links

def extract_emails_from_page(url):
    """Extrahiere E-Mail-Adressen von einer Seite"""
    try:
        resp = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp.raise_for_status()
    except Exception:
        return set()

    emails = set(EMAIL_REGEX.findall(resp.text))
    # Filtere offensichtlich falsche E-Mails
    emails = {e for e in emails if not any(x in e.lower() for x in ['example.com', 'test.com', 'placeholder'])}
    return emails

def extract_phone_from_page(url):
    """Extrahiere Telefonnummern von einer Seite"""
    try:
        resp = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp.raise_for_status()
    except Exception:
        return ""

    phones = PHONE_REGEX.findall(resp.text)
    if phones:
        return phones[0] if isinstance(phones[0], str) else "".join(phones[0])
    return ""

def process_bank(bank_id, name, country, city, website):
    """Verarbeite eine Bank und extrahiere Kontaktinformationen"""
    print(f"Verarbeite: {name} ({website})", file=sys.stderr)
    
    contact_pages = find_contact_pages(website)
    emails = set()
    phone = ""
    
    # Durchsuche Hauptseite und Kontakt-Seiten
    for page in [website] + contact_pages[:5]:  # Max 5 Kontakt-Seiten
        emails |= extract_emails_from_page(page)
        if not phone:
            phone = extract_phone_from_page(page)
        time.sleep(0.5)  # Rate limiting
    
    main_email = next(iter(emails), "")
    contact_form_url = contact_pages[0] if contact_pages else ""
    
    return {
        "bank_id": bank_id,
        "bank_name": name,
        "country": country,
        "city": city,
        "website": website,
        "contact_email": main_email,
        "contact_form_url": contact_form_url,
        "phone": phone,
        "channel_type": "bank",
        "verified_at": datetime.now().strftime("%Y-%m-%d")
    }

def main():
    """Hauptfunktion"""
    # Beispielhafte Eingabeliste - Erweitere diese mit echten Banken
    banks = [
        (1, "Musterbank AG", "Germany", "Berlin", "https://www.musterbank.de"),
        (2, "FinPay Europe B.V.", "Netherlands", "Amsterdam", "https://www.finpay.eu"),
        # Füge hier weitere Banken hinzu
    ]
    
    results = []
    
    for bank in banks:
        try:
            result = process_bank(*bank)
            results.append(result)
        except Exception as e:
            print(f"Fehler bei {bank[1]}: {e}", file=sys.stderr)
            continue
    
    # CSV schreiben
    with open("bank_contacts.csv", "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "bank_id", "bank_name", "country", "city", "website",
            "contact_email", "contact_form_url", "phone",
            "channel_type", "verified_at"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    
    # JSON schreiben (für HTML-Dashboard)
    with open("bank_contacts.json", "w", encoding="utf-8") as f:
        json.dump({"banks": results}, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ {len(results)} Banken verarbeitet", file=sys.stderr)
    print(f"📄 CSV: bank_contacts.csv", file=sys.stderr)
    print(f"📄 JSON: bank_contacts.json", file=sys.stderr)

if __name__ == "__main__":
    main()

