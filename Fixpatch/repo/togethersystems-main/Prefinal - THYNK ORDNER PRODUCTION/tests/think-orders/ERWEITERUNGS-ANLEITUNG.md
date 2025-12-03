# 📚 Erweiterungs-Anleitung - Tests erweitern für Dummies

## 🎯 Einführung

Diese Anleitung zeigt Ihnen Schritt-für-Schritt, wie Sie die Think Orders Test-Suite erweitern können. Keine Programmierkenntnisse erforderlich - alles wird einfach erklärt!

---

## 📋 Inhaltsverzeichnis

1. [Basis-Wissen](#basis-wissen)
2. [Ersten Test hinzufügen](#ersten-test-hinzufügen)
3. [Helper-Funktionen verwenden](#helper-funktionen-verwenden)
4. [Neue Features testen](#neue-features-testen)
5. [Beispiele](#beispiele)
6. [Troubleshooting](#troubleshooting)

---

## 🔑 Basis-Wissen

### Was ist ein Test?

Ein Test ist ein **automatisiertes Programm**, das prüft, ob eine Funktion richtig funktioniert.

**Beispiel:**
```typescript
test('Button funktioniert', async ({ page }) => {
  await page.click('button');  // Klicke auf Button
  await expect(page.locator('text=Erfolg')).toBeVisible();  // Prüfe ob Text erscheint
});
```

### Test-Struktur

Jeder Test besteht aus 3 Teilen:

1. **Arrange** (Vorbereitung): Daten vorbereiten, Seite öffnen
2. **Act** (Aktion): Button klicken, Formular ausfüllen
3. **Assert** (Prüfung): Ergebnis überprüfen

---

## ✏️ Ersten Test hinzufügen

### Schritt 1: Datei öffnen

Öffnen Sie die Datei:
```
tests/think-orders/think-orders.spec.ts
```

### Schritt 2: Neuen Test-Block finden

Suchen Sie nach einem passenden `test.describe` Block oder erstellen Sie einen neuen:

```typescript
test.describe('Ihr Feature Name', () => {
  // Ihre Tests kommen hier rein
});
```

### Schritt 3: Test schreiben

Fügen Sie einen Test hinzu:

```typescript
test('Was Ihr Test macht', async ({ page }) => {
  // Ihr Test-Code
});
```

### Schritt 4: Test ausführen

```bash
npm test
```

---

## 🛠️ Helper-Funktionen verwenden

Helper-Funktionen machen Tests einfacher. Sie sind in `helpers/test-helpers.ts` definiert.

### Navigation

```typescript
const helpers = new ThinkTestHelpers(page);

// Zu einer Seite navigieren
await helpers.navigateToRoute('/orders');

// Navigation-Link klicken
await helpers.clickNavLink('Orders');

// Prüfen ob Seite aktiv ist
await helpers.isPageActive('page-orders');
```

### Formulare ausfüllen

```typescript
// Eingabefeld füllen
await helpers.fillInput('#productName', 'Mein Produkt');
await helpers.fillInput('#productPrice', '29.99');

// Button klicken
await helpers.clickButton('Speichern');
```

### Daten erstellen

```typescript
// Test-Order erstellen
const order = await helpers.createTestOrder();

// Test-Product erstellen
const product = await helpers.createTestProduct();
```

### LocalStorage

```typescript
// Daten löschen
await helpers.clearLocalStorage();

// Daten setzen
await helpers.setLocalStorage('thynk_orders', orders);

// Daten lesen
const orders = await helpers.getLocalStorage('thynk_orders');
```

---

## 🆕 Neue Features testen

### Beispiel 1: Neuer Button testen

Angenommen, Sie haben einen neuen Button "Löschen" hinzugefügt:

```typescript
test('Löschen-Button funktioniert', async ({ page }) => {
  const helpers = new ThinkTestHelpers(page);
  
  // 1. Vorbereitung: Test-Daten erstellen
  await helpers.createTestOrder();
  await helpers.navigateToRoute('/orders');
  await helpers.waitForPageLoad();
  
  // 2. Aktion: Button klicken
  page.on('dialog', async dialog => {
    await dialog.accept(); // Dialog bestätigen
  });
  await page.click('button:has-text("Löschen")');
  
  // 3. Prüfung: Order sollte gelöscht sein
  await expect(page.locator('text=No orders found')).toBeVisible();
});
```

### Beispiel 2: Neues Formular testen

Angenommen, Sie haben ein neues Formular "Kategorie hinzufügen":

```typescript
test('Kategorie hinzufügen funktioniert', async ({ page }) => {
  const helpers = new ThinkTestHelpers(page);
  
  // 1. Vorbereitung: Zu Products-Seite navigieren
  await helpers.navigateToRoute('/products');
  await helpers.waitForPageLoad();
  
  // 2. Aktion: Formular ausfüllen
  await helpers.fillInput('#categoryName', 'Elektronik');
  await helpers.fillInput('#categoryDescription', 'Elektronische Geräte');
  await helpers.clickButton('Kategorie hinzufügen');
  
  // 3. Prüfung: Kategorie sollte angezeigt werden
  await expect(page.locator('text=Elektronik')).toBeVisible();
});
```

### Beispiel 3: Neue Seite testen

Angenommen, Sie haben eine neue Seite "Berichte" hinzugefügt:

```typescript
test.describe('Think Orders - Berichte', () => {
  test('Berichte-Seite sollte laden', async ({ page }) => {
    const helpers = new ThinkTestHelpers(page);
    
    // Navigieren
    await helpers.navigateToRoute('/reports');
    await helpers.waitForPageLoad();
    
    // Prüfen
    await helpers.isPageActive('page-reports');
    await expect(page.locator('h1:has-text("Berichte")')).toBeVisible();
  });
  
  test('Bericht generieren funktioniert', async ({ page }) => {
    const helpers = new ThinkTestHelpers(page);
    
    // Vorbereitung
    await helpers.createTestOrder();
    await helpers.navigateToRoute('/reports');
    await helpers.waitForPageLoad();
    
    // Aktion
    await helpers.clickButton('Bericht generieren');
    await page.waitForTimeout(2000);
    
    // Prüfung
    await expect(page.locator('text=Bericht generiert')).toBeVisible();
  });
});
```

---

## 💡 Häufige Muster

### Dialoge behandeln

```typescript
// Alert bestätigen
page.on('dialog', async dialog => {
  await dialog.accept();
});

// Prompt mit Wert ausfüllen
page.on('dialog', async dialog => {
  await dialog.accept('Mein Wert');
});

// Dialog ablehnen
page.on('dialog', async dialog => {
  await dialog.dismiss();
});
```

### Auf Elemente warten

```typescript
// Auf Element warten
await page.waitForSelector('#myElement');

// Auf Text warten
await expect(page.locator('text=Mein Text')).toBeVisible({ timeout: 5000 });
```

### Screenshots

```typescript
// Screenshot aufnehmen
await page.screenshot({ path: 'screenshot.png' });

// Automatisch bei Fehler (in config eingestellt)
```

---

## 📝 Vollständiges Beispiel

Hier ist ein vollständiges Beispiel für einen neuen Test:

```typescript
test.describe('Think Orders - Neues Feature', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.clearLocalStorage();
    await helpers.navigateToRoute('/');
    await helpers.waitForPageLoad();
  });

  test('Neue Funktion sollte funktionieren', async ({ page }) => {
    // 1. VORBEREITUNG (Arrange)
    await helpers.createTestOrder();
    await helpers.navigateToRoute('/orders');
    await helpers.waitForPageLoad();

    // 2. AKTION (Act)
    await page.click('button:has-text("Neue Funktion")');
    await page.waitForTimeout(1000);

    // 3. PRÜFUNG (Assert)
    await expect(page.locator('text=Funktion ausgeführt')).toBeVisible();
  });
});
```

---

## 🔍 Elemente finden

### Nach Text suchen

```typescript
// Button mit Text finden
await page.click('button:has-text("Speichern")');

// Link mit Text finden
await page.click('a:has-text("Home")');

// Text sollte sichtbar sein
await expect(page.locator('text=Erfolg')).toBeVisible();
```

### Nach ID suchen

```typescript
// Element mit ID finden
await page.fill('#productName', 'Test');
await page.click('#submitButton');
```

### Nach Klasse suchen

```typescript
// Element mit Klasse finden
await page.click('.btn-primary');
await page.click('.card');
```

### Nach Attribut suchen

```typescript
// Element mit Attribut finden
await page.click('[data-testid="my-button"]');
await page.click('[type="submit"]');
```

---

## 🐛 Troubleshooting

### Test schlägt fehl: "Element nicht gefunden"

**Problem:** Test findet Element nicht

**Lösung:**
1. Prüfe ob Element wirklich existiert
2. Warte länger: `await page.waitForTimeout(2000)`
3. Verwende `waitForSelector`:
   ```typescript
   await page.waitForSelector('#myElement', { timeout: 10000 });
   ```

### Test schlägt fehl: "Timeout"

**Problem:** Test läuft zu lange

**Lösung:**
1. Erhöhe Timeout in Config oder Test:
   ```typescript
   test('Mein Test', async ({ page }) => {
     test.setTimeout(60000); // 60 Sekunden
   });
   ```
2. Prüfe ob Aktion wirklich ausgeführt wird
3. Verwende `waitForLoadState`:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

### Test funktioniert manuell, aber nicht automatisch

**Problem:** Timing-Problem

**Lösung:**
1. Füge Wartezeiten hinzu:
   ```typescript
   await page.waitForTimeout(500);
   ```
2. Warte auf spezifisches Element:
   ```typescript
   await page.waitForSelector('#myElement');
   ```

---

## ✅ Checkliste für neue Tests

- [ ] Test hat aussagekräftigen Namen
- [ ] Test ist in passendem `test.describe` Block
- [ ] LocalStorage wird geleert (wenn nötig)
- [ ] Vorbereitung (Arrange) ist vollständig
- [ ] Aktion (Act) ist klar
- [ ] Prüfung (Assert) ist vorhanden
- [ ] Test läuft durch (`npm test`)
- [ ] Test ist dokumentiert

---

## 📚 Weiterführende Ressourcen

- [Playwright Dokumentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Best Practices](https://playwright.dev/docs/best-practices)

---

## 🆘 Hilfe

Bei Problemen:

1. Prüfe Browser-Console für Fehler
2. Führe Test mit `--headed` aus: `npm run test:headed`
3. Verwende Debug-Modus: `npm run test:debug`
4. Prüfe Test-Report: `npm run test:report`

---

**Viel Erfolg beim Testen! 🚀**

