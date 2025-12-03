# INTERNATIONALISIERUNG (I18N)
## Multi-Language Support Spezifikation

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Zweck:** Vollständige I18N-Architektur für Templates, UI, API-Responses

---

## 1. ÜBERSICHT

### 1.1 Unterstützte Sprachen

**Standard-Sprachen:**
- Deutsch (de)
- Englisch (en)
- Niederländisch (nl)
- Französisch (fr)
- Spanisch (es)
- Italienisch (it)

**Erweiterbar:**
- Beliebige Sprachen über Locale-Codes (ISO 639-1)
- Fallback auf Englisch (en) wenn Übersetzung fehlt

### 1.2 I18N-Bereiche

```
1. Templates (Nachrichten)
   - Subject
   - Body
   - Platzhalter-Werte (z.B. Datum-Formatierung)

2. System-Meldungen
   - API-Error-Messages
   - Validation-Messages
   - Status-Messages

3. UI (wenn vorhanden)
   - Labels
   - Buttons
   - Formulare
   - Navigation

4. Journey-Namen & Beschreibungen
   - Journey-Labels
   - Node-Labels
   - Segment-Namen
```

---

## 2. TEMPLATE-I18N

### 2.1 Multi-Language Templates

**Template-Struktur:**

```
Template {
  id: UUID
  name: "welcome_email"
  channel_kind: "email"
  
  // Multi-Language-Varianten
  variants: Map<Locale, TemplateVariant>
}

TemplateVariant {
  locale: "de" | "en" | "nl" | ...
  subject: String
  body: String
  variables: Set<String>
}
```

**Template-Erstellung:**

```
CREATE TEMPLATE welcome_email
  CHANNEL: email
  
  VARIANT de:
    SUBJECT: "Willkommen bei {{workspace.name}}!"
    BODY: |
      Hallo {{contact.attributes.first_name}},
      
      Willkommen in unserer Community!
      
      Viele Grüße,
      {{workspace.name}}

  VARIANT en:
    SUBJECT: "Welcome to {{workspace.name}}!"
    BODY: |
      Hello {{contact.attributes.first_name}},
      
      Welcome to our community!
      
      Best regards,
      {{workspace.name}}

  VARIANT nl:
    SUBJECT: "Welkom bij {{workspace.name}}!"
    BODY: |
      Hallo {{contact.attributes.first_name}},
      
      Welkom in onze community!
      
      Groeten,
      {{workspace.name}}
```

### 2.2 Locale-Erkennung

**Prioritätsreihenfolge:**

```
1. Contact-Locale (contact.attributes["language"] oder contact.attributes["locale"])
2. Workspace-Default-Locale (workspace.settings["default_locale"])
3. System-Default: "en"
```

**Locale-Resolver-Formel:**

```
resolve_template_locale(contact: Contact, workspace: Workspace) → Locale:

  // 1. Kontakt-Locale prüfen
  if contact.attributes["locale"] ∈ supported_locales:
    return contact.attributes["locale"]
  
  if contact.attributes["language"] ∈ supported_locales:
    return contact.attributes["language"]
  
  // 2. Workspace-Default
  if workspace.settings["default_locale"] ∈ supported_locales:
    return workspace.settings["default_locale"]
  
  // 3. System-Default
  return "en"
```

**Template-Loading:**

```
get_template_variant(template_id: UUID, locale: Locale) → TemplateVariant:

  template = get_template(template_id)
  
  // 1. Exakte Locale-Variante
  if locale in template.variants:
    return template.variants[locale]
  
  // 2. Fallback: Englisch
  if "en" in template.variants:
    return template.variants["en"]
  
  // 3. Fallback: Erste verfügbare Variante
  if |template.variants| > 0:
    return template.variants.values[0]
  
  // 4. Error: Keine Variante vorhanden
  throw ERROR_NO_TEMPLATE_VARIANT
```

### 2.3 Platzhalter-I18N

**Datum-Formatierung:**

```
{{date | format: DATE_FORMAT}}

Locale-spezifische Formatierung:
- de: "DD.MM.YYYY" → "27.01.2025"
- en: "MM/DD/YYYY" → "01/27/2025"
- nl: "DD-MM-YYYY" → "27-01-2025"
- fr: "DD/MM/YYYY" → "27/01/2025"

{{date | format: LONG_DATE}}

- de: "27. Januar 2025"
- en: "January 27, 2025"
- nl: "27 januari 2025"
- fr: "27 janvier 2025"
```

**Währung-Formatierung:**

```
{{amount | currency: CURRENCY_CODE}}

Locale-spezifische Formatierung:
- de: "99,99 €"
- en: "€99.99"
- nl: "€ 99,99"
- fr: "99,99 €"

{{amount | currency: USD}}

- de: "99,99 $"
- en: "$99.99"
- nl: "$ 99,99"
- fr: "99,99 $"
```

**Zahlen-Formatierung:**

```
{{number | number_format}}

Locale-spezifisch:
- de: "1.234,56"
- en: "1,234.56"
- nl: "1.234,56"
- fr: "1 234,56"
```

**Zeit-Formatierung:**

```
{{time | format: TIME_FORMAT}}

- de: "14:30 Uhr"
- en: "2:30 PM"
- nl: "14:30"
- fr: "14h30"
```

### 2.4 Template-Rendering mit I18N

```
render_template_i18n(template_id: UUID, contact: Contact, context: CONTEXT) → Message:

  // 1. Locale bestimmen
  locale = resolve_template_locale(contact, context.workspace)
  
  // 2. Template-Variante laden
  template_variant = get_template_variant(template_id, locale)
  
  // 3. Platzhalter ersetzen (mit Locale-Formaten)
  resolved_subject = render_placeholders(
    template_variant.subject,
    context,
    locale
  )
  
  resolved_body = render_placeholders(
    template_variant.body,
    context,
    locale
  )
  
  return {
    subject: resolved_subject,
    body: resolved_body,
    locale: locale
  }

render_placeholders(text: String, context: CONTEXT, locale: Locale) → String:

  resolved = text
  
  ∀ placeholder ∈ extract_placeholders(text):
    value = resolve_variable(placeholder, context)
    
    // Locale-spezifische Formatierung anwenden
    if placeholder contains "| format:":
      format_type = extract_format_type(placeholder)
      formatted_value = format_value(value, format_type, locale)
    else:
      formatted_value = value
    
    resolved = replace(resolved, placeholder, formatted_value)
  
  return resolved

format_value(value: Value, format_type: String, locale: Locale) → String:

  SWITCH format_type:
    CASE "DATE":
      return format_date(value, locale.date_format)
    
    CASE "LONG_DATE":
      return format_date_long(value, locale)
    
    CASE "TIME":
      return format_time(value, locale.time_format)
    
    CASE "CURRENCY":
      currency_code = extract_currency_code(format_type)
      return format_currency(value, currency_code, locale)
    
    CASE "NUMBER":
      return format_number(value, locale.number_format)
    
    DEFAULT:
      return str(value)
```

---

## 3. SYSTEM-MESSAGES I18N

### 3.1 API-Error-Messages

**Error-Message-Struktur:**

```
ErrorResponse {
  error_code: String  // Maschinen-lesbar (immer englisch)
  message: String     // Lokalisiert
  locale: Locale
  details: Map<String, Value>
}
```

**Error-Message-Resolver:**

```
get_error_message(error_code: String, locale: Locale, details: Map) → String:

  // Error-Messages aus i18n-File laden
  error_messages = load_i18n_file("errors", locale)
  
  if error_code in error_messages:
    template = error_messages[error_code]
    return render_error_template(template, details, locale)
  else:
    // Fallback auf Englisch
    return get_error_message(error_code, "en", details)
```

**Error-Message-Beispiele:**

```
errors.de.json:
{
  "CONTACT_NOT_FOUND": "Kontakt nicht gefunden",
  "INVALID_EMAIL": "Ungültige E-Mail-Adresse: {{email}}",
  "RATE_LIMIT_EXCEEDED": "Rate-Limit überschritten. Bitte versuche es später erneut.",
  "PERMISSION_DENIED": "Keine Berechtigung für diese Aktion",
  "JOURNEY_NOT_FOUND": "Journey nicht gefunden: {{journey_id}}"
}

errors.en.json:
{
  "CONTACT_NOT_FOUND": "Contact not found",
  "INVALID_EMAIL": "Invalid email address: {{email}}",
  "RATE_LIMIT_EXCEEDED": "Rate limit exceeded. Please try again later.",
  "PERMISSION_DENIED": "Permission denied for this action",
  "JOURNEY_NOT_FOUND": "Journey not found: {{journey_id}}"
}
```

### 3.2 Validation-Messages

**Validation-Error-Struktur:**

```
ValidationError {
  field: String
  error_code: String
  message: String  // Lokalisiert
  locale: Locale
}
```

**Validation-Message-Beispiele:**

```
validation.de.json:
{
  "REQUIRED": "{{field}} ist erforderlich",
  "INVALID_FORMAT": "{{field}} hat ungültiges Format",
  "TOO_SHORT": "{{field}} muss mindestens {{min}} Zeichen lang sein",
  "TOO_LONG": "{{field}} darf maximal {{max}} Zeichen lang sein",
  "INVALID_EMAIL": "{{field}} muss eine gültige E-Mail-Adresse sein",
  "INVALID_PHONE": "{{field}} muss eine gültige Telefonnummer sein"
}

validation.en.json:
{
  "REQUIRED": "{{field}} is required",
  "INVALID_FORMAT": "{{field}} has invalid format",
  "TOO_SHORT": "{{field}} must be at least {{min}} characters long",
  "TOO_LONG": "{{field}} must not exceed {{max}} characters",
  "INVALID_EMAIL": "{{field}} must be a valid email address",
  "INVALID_PHONE": "{{field}} must be a valid phone number"
}
```

### 3.3 Status-Messages

**Status-Message-Struktur:**

```
StatusMessage {
  status: String
  message: String  // Lokalisiert
  locale: Locale
}
```

**Status-Message-Beispiele:**

```
status.de.json:
{
  "SUCCESS": "Erfolgreich",
  "CREATED": "{{entity}} erfolgreich erstellt",
  "UPDATED": "{{entity}} erfolgreich aktualisiert",
  "DELETED": "{{entity}} erfolgreich gelöscht",
  "SENT": "Nachricht erfolgreich gesendet",
  "PROCESSING": "Wird verarbeitet..."
}

status.en.json:
{
  "SUCCESS": "Success",
  "CREATED": "{{entity}} created successfully",
  "UPDATED": "{{entity}} updated successfully",
  "DELETED": "{{entity}} deleted successfully",
  "SENT": "Message sent successfully",
  "PROCESSING": "Processing..."
}
```

---

## 4. JOURNEY & SEGMENT I18N

### 4.1 Journey-Namen & Beschreibungen

**Multi-Language Journey:**

```
Journey {
  id: UUID
  name: String  // Interner Key
  
  // Lokalisierte Labels
  labels: Map<Locale, String>
  descriptions: Map<Locale, String>
}

Beispiel:
{
  "name": "onboarding_journey",
  "labels": {
    "de": "Onboarding-Reise",
    "en": "Onboarding Journey",
    "nl": "Onboarding Reis"
  },
  "descriptions": {
    "de": "Führt neue Benutzer durch den Onboarding-Prozess",
    "en": "Guides new users through the onboarding process",
    "nl": "Begeleidt nieuwe gebruikers door het onboarding proces"
  }
}
```

### 4.2 Node-Labels

**Multi-Language Node-Labels:**

```
JourneyNode {
  id: UUID
  label: String  // Interner Key
  
  // Lokalisierte Labels
  labels: Map<Locale, String>
}

Beispiel:
{
  "label": "send_welcome_email",
  "labels": {
    "de": "Willkommens-E-Mail senden",
    "en": "Send welcome email",
    "nl": "Verstuur welkom e-mail"
  }
}
```

### 4.3 Segment-Namen

**Multi-Language Segment-Namen:**

```
Segment {
  id: UUID
  name: String  // Interner Key
  
  // Lokalisierte Namen
  names: Map<Locale, String>
  descriptions: Map<Locale, String>
}

Beispiel:
{
  "name": "active_buyers_de",
  "names": {
    "de": "Aktive Käufer in Deutschland",
    "en": "Active Buyers in Germany",
    "nl": "Actieve kopers in Duitsland"
  }
}
```

---

## 5. I18N-DATEI-STRUKTUR

### 5.1 Datei-Organisation

```
i18n/
  ├── templates/
  │   ├── welcome_email.de.json
  │   ├── welcome_email.en.json
  │   ├── welcome_email.nl.json
  │   └── ...
  ├── errors/
  │   ├── errors.de.json
  │   ├── errors.en.json
  │   └── ...
  ├── validation/
  │   ├── validation.de.json
  │   ├── validation.en.json
  │   └── ...
  ├── status/
  │   ├── status.de.json
  │   ├── status.en.json
  │   └── ...
  └── ui/  // Falls UI vorhanden
      ├── ui.de.json
      ├── ui.en.json
      └── ...
```

### 5.2 I18N-File-Format

**JSON-Format:**

```json
{
  "key": "Übersetzter Text",
  "key_with_placeholder": "Text mit {{placeholder}}",
  "nested": {
    "key": "Verschachtelter Text"
  }
}
```

**Beispiel: errors.de.json:**

```json
{
  "CONTACT_NOT_FOUND": "Kontakt nicht gefunden",
  "INVALID_EMAIL": "Ungültige E-Mail-Adresse: {{email}}",
  "PERMISSION_DENIED": "Keine Berechtigung für diese Aktion",
  "RATE_LIMIT": {
    "EXCEEDED": "Rate-Limit überschritten",
    "RETRY_AFTER": "Bitte versuche es nach {{seconds}} Sekunden erneut"
  }
}
```

### 5.3 I18N-Loading

```
load_i18n_file(category: String, locale: Locale) → Map<String, Value>:

  file_path = "i18n/{category}/{category}.{locale}.json"
  
  if file_exists(file_path):
    return parse_json_file(file_path)
  else:
    // Fallback auf Englisch
    if locale ≠ "en":
      return load_i18n_file(category, "en")
    else:
      // Fallback auf leere Map
      return {}
```

---

## 6. LOCALE-DETECTION

### 6.1 HTTP-Header

**Accept-Language Header:**

```
API-Request:
  Header: Accept-Language: de-DE,de;q=0.9,en;q=0.8

Locale-Resolver:
  parse_accept_language(header: String) → Array<Locale>:
    // Parsed: ["de-DE", "de", "en"]
    // Qualität: de-DE=1.0, de=0.9, en=0.8
    return sorted_locales_by_quality

resolve_locale_from_header(header: String) → Locale:
    locales = parse_accept_language(header)
    ∀ locale ∈ locales:
      locale_code = extract_language_code(locale)  // "de-DE" → "de"
      if locale_code ∈ supported_locales:
        return locale_code
    return "en"  // Default
```

### 6.2 API-Parameter

**Locale als Query-Parameter:**

```
GET /api/v1/contacts?locale=de
GET /api/v1/messages?locale=nl

Priorität:
  1. Query-Parameter (?locale=de)
  2. Header (Accept-Language)
  3. Workspace-Default
  4. System-Default
```

### 6.3 Contact-Attribute

**Locale aus Kontakt:**

```
contact.attributes["locale"] = "de"
contact.attributes["language"] = "de"

Bei Template-Rendering:
  locale = contact.attributes["locale"] ?? 
           contact.attributes["language"] ?? 
           workspace.settings["default_locale"] ?? 
           "en"
```

---

## 7. DATUMS- & ZEIT-I18N

### 7.1 Datum-Formate

**Locale-spezifische Formate:**

```
DATE_FORMATS = {
  "de": {
    "SHORT": "DD.MM.YYYY",        // 27.01.2025
    "MEDIUM": "DD. MMM YYYY",      // 27. Jan 2025
    "LONG": "DD. MMMM YYYY",       // 27. Januar 2025
    "FULL": "dddd, DD. MMMM YYYY"  // Montag, 27. Januar 2025
  },
  "en": {
    "SHORT": "MM/DD/YYYY",         // 01/27/2025
    "MEDIUM": "MMM DD, YYYY",      // Jan 27, 2025
    "LONG": "MMMM DD, YYYY",       // January 27, 2025
    "FULL": "dddd, MMMM DD, YYYY"  // Monday, January 27, 2025
  },
  "nl": {
    "SHORT": "DD-MM-YYYY",         // 27-01-2025
    "MEDIUM": "DD MMM YYYY",       // 27 jan 2025
    "LONG": "DD MMMM YYYY",        // 27 januari 2025
    "FULL": "dddd DD MMMM YYYY"    // maandag 27 januari 2025
  }
}
```

**Wochentag-Namen:**

```
WEEKDAY_NAMES = {
  "de": ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
  "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "nl": ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]
}
```

**Monatsnamen:**

```
MONTH_NAMES = {
  "de": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  "nl": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
}
```

### 7.2 Zeit-Formate

**Locale-spezifische Zeit-Formate:**

```
TIME_FORMATS = {
  "de": {
    "SHORT": "HH:mm",        // 14:30
    "MEDIUM": "HH:mm Uhr",   // 14:30 Uhr
    "LONG": "HH:mm:ss"       // 14:30:45
  },
  "en": {
    "SHORT": "h:mm A",       // 2:30 PM
    "MEDIUM": "h:mm:ss A",   // 2:30:45 PM
    "LONG": "HH:mm:ss"       // 14:30:45
  },
  "nl": {
    "SHORT": "HH:mm",        // 14:30
    "MEDIUM": "HH:mm",       // 14:30
    "LONG": "HH:mm:ss"       // 14:30:45
  }
}
```

### 7.3 Relative Zeit

**Locale-spezifische relative Zeit:**

```
RELATIVE_TIME = {
  "de": {
    "now": "gerade eben",
    "minutes_ago": "vor {{count}} Minuten",
    "hours_ago": "vor {{count}} Stunden",
    "days_ago": "vor {{count}} Tagen",
    "weeks_ago": "vor {{count}} Wochen",
    "months_ago": "vor {{count}} Monaten",
    "years_ago": "vor {{count}} Jahren"
  },
  "en": {
    "now": "just now",
    "minutes_ago": "{{count}} minutes ago",
    "hours_ago": "{{count}} hours ago",
    "days_ago": "{{count}} days ago",
    "weeks_ago": "{{count}} weeks ago",
    "months_ago": "{{count}} months ago",
    "years_ago": "{{count}} years ago"
  }
}
```

---

## 8. IMPLEMENTIERUNGS-HINWEISE

### 8.1 I18N-Library-Empfehlungen

**JavaScript/TypeScript:**
- `i18next` - Vollständige I18N-Lösung
- `react-i18next` - Für React-Apps
- `date-fns` - Für Datum-Formatierung (locale-aware)

**Python:**
- `babel` - I18N & Lokalisierung
- `python-babel` - Datum- & Zahlen-Formatierung

**Go:**
- `golang.org/x/text` - Vollständige I18N-Unterstützung

**Java:**
- `java.util.ResourceBundle` - Native Java I18N
- `java.text.MessageFormat` - Formatierung

### 8.2 Best Practices

**1. Keys statt Strings:**
```
❌ FALSCH: "Willkommen bei uns"
✅ RICHTIG: "welcome_message"

Grund: Keys sind maschinen-lesbar, Übersetzungen getrennt
```

**2. Plurale:**
```
"items_count": {
  "zero": "Keine Artikel",
  "one": "Ein Artikel",
  "other": "{{count}} Artikel"
}
```

**3. Kontext-spezifische Übersetzungen:**
```
"button": {
  "save": "Speichern",
  "cancel": "Abbrechen"
},
"message": {
  "save": "Wird gespeichert...",
  "cancel": "Aktion abgebrochen"
}
```

**4. Fallback-Chain:**
```
de → en → system_default
```

### 8.3 Testing

**I18N-Tests:**

```
test_template_rendering_all_locales():
  template_id = "welcome_email"
  supported_locales = ["de", "en", "nl", "fr"]
  
  ∀ locale ∈ supported_locales:
    variant = get_template_variant(template_id, locale)
    assert variant ≠ null
    assert variant.subject ≠ ""
    assert variant.body ≠ ""

test_placeholder_formatting():
  date = "2025-01-27"
  locale = "de"
  
  formatted = format_date(date, "LONG", locale)
  assert formatted = "27. Januar 2025"
  
  locale = "en"
  formatted = format_date(date, "LONG", locale)
  assert formatted = "January 27, 2025"
```

---

## ENDE DER I18N-SPEZIFIKATION

**Diese Spezifikation enthält:**
- ✅ Vollständige Template-I18N
- ✅ System-Message-I18N
- ✅ Locale-Detection
- ✅ Datum- & Zeit-Formatierung
- ✅ Best Practices
- ✅ Implementierungs-Hinweise

**Verwendung:**
- Als Referenz für I18N-Implementierung
- Für Template-Erstellung in mehreren Sprachen
- Für API-Response-Lokalisierung

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-01-27
