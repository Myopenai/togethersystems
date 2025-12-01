# 📋 GEDETAILLEERD RAPPORT: TOEGANGSBEPERKING & KOOPPRIKKEL SYSTEEM

**Gemaakt:** 2025-01-XX  
**Status:** Volledige documentatie van alle implementaties  
**Talen:** DE, NL, EN

---

## 🎯 OVERZICHT

Dit rapport documenteert **ALLE** systemen voor toegangsbeperking, wachtwoordregulering en koopstimulering in het THYNK ORDERS Production System.

---

## 1️⃣ TIJDVERTRAGINGSMECHANISME (Industrial Design System)

### 📊 Gebruikers-Slots-Systeem

Het systeem gebruikt **5 verschillende gebruikersslots** met verschillende toegangsrechten en vertragingen:

#### 1.1 DEMO-SLOT
- **Vertragingsmultiplicator:** 1.0 (standaardvertraging)
- **Functietoegang:** Beperkt
- **Maximale vertraging:** 5 seconden
- **Progressieve vertraging:** NEE
- **Doel:** Demo-versie voor niet-prikkelbare gebruikers
- **Koopprikkel:** Laag - alleen voor testen

#### 1.2 FREE-SLOT
- **Vertragingsmultiplicator:** 1.5 (50% langzamer)
- **Functietoegang:** Basis (basis functies)
- **Maximale vertraging:** 10 seconden
- **Progressieve vertraging:** NEE
- **Doel:** Gratis versie
- **Koopprikkel:** Gemiddeld - gebruiker kan functies gebruiken, maar met vertraging

#### 1.3 PRICKLE-USER-SLOT ⚡
- **Vertragingsmultiplicator:** 2.0 (100% langzamer - dubbele wachttijd!)
- **Functietoegang:** Standaard (meer functies)
- **Maximale vertraging:** 15 seconden
- **Progressieve vertraging:** ✅ JA (wordt met de tijd erger)
- **Doel:** **Gebruikers die tot koop moeten worden aangemoedigd**
- **Koopprikkel:** **HOOG** - gebruiker wordt bewust geïrriteerd om koop te bevorderen

#### 1.4 PURCHASED-SLOT
- **Vertragingsmultiplicator:** 0.1 (slechts 10% vertraging - bijna geen)
- **Functietoegang:** Volledig (alle functies)
- **Maximale vertraging:** 0 seconden
- **Progressieve vertraging:** NEE
- **Doel:** Gekochte software - minimale vertraging
- **Koopprikkel:** Beloning - gebruiker heeft gekocht, krijgt bijna volledige snelheid

#### 1.5 PREMIUM-SLOT
- **Vertragingsmultiplicator:** 0.0 (GEEN vertraging!)
- **Functietoegang:** Volledig Plus (alle functies + Premium)
- **Maximale vertraging:** 0 seconden
- **Progressieve vertraging:** NEE
- **Doel:** Premium-versie - geen vertraging
- **Koopprikkel:** Hoogste beloning - volledige snelheid

---

## 2️⃣ FUNCTIE-TRAAGHEID (Function Inertia)

### 📊 Progressieve demping

Het systeem gebruikt **4 vertragingsniveaus** die progressief erger worden:

#### Niveau 1 (Zacht)
- **Vertraging:** 2 seconden
- **Beschrijving:** Eerste vertragingsniveau
- **Gebruikerservaring:** Nauwelijks merkbaar

#### Niveau 2 (Gemiddeld)
- **Vertraging:** 5 seconden
- **Beschrijving:** Tweede vertragingsniveau
- **Gebruikerservaring:** Merkbaar langzamer

#### Niveau 3 (Hard)
- **Vertraging:** 10 seconden
- **Beschrijving:** Derde vertragingsniveau
- **Gebruikerservaring:** Duidelijk langzamer

#### Niveau 4 (Zeer Hard)
- **Vertraging:** 20 seconden
- **Beschrijving:** Vierde vertragingsniveau - kort voor blokkade
- **Gebruikerservaring:** Zeer langzaam, maar nog bruikbaar

### ⏰ Genadeperiode

- **Geactiveerd:** ✅ JA
- **Duur:** 168 uur (7 dagen)
- **Beschrijving:** Genadeperiode: 7 dagen volledige functie voor blokkade
- **Doel:** Gebruiker heeft 7 dagen volledige functionaliteit voordat vertragingen ingaan

---

## 3️⃣ BLOKKADE-VOORKOMING

### 🛡️ Voor volledige blokkade

- **Tijdbeperkte toegang:** ✅ ACTIEF
- **Vernieuwing vereist:** Elke 24 uur
- **Beschrijving:** Voor volledige blokkade: tijdbeperking met hernieuwing
- **Doel:** Gebruiker moet regelmatig actief worden, anders wordt toegang beperkt

### 🔄 Vernieuwingsmechanisme

- **Automatische vernieuwing:** ✅ ACTIEF
- **Gebruikersmelding:** ✅ ACTIEF
- **Vernieuwingsvenster:** 48 uur
- **Doel:** Systeem probeert automatisch te vernieuwen, meldt gebruiker

---

## 4️⃣ VOUCHER-LICENTIE SYSTEEM

### 🎫 Vouchertypes

#### 4.1 Single-Use Voucher
- **Maximale activeringen:** 1
- **Geldigheid:** 365 dagen
- **Doel:** Eenmalige toegang

#### 4.2 Multi-Use Voucher
- **Maximale activeringen:** 5
- **Geldigheid:** 365 dagen
- **Doel:** Meerdere toegang (bijv. voor teams)

#### 4.3 Subscription Voucher
- **Maximale activeringen:** Onbeperkt (-1)
- **Geldigheid:** 30 dagen (maandabonnement)
- **Automatische verlenging:** ✅ JA
- **Doel:** Abonnement-gebaseerde toegang

### 🔐 Online-verificatie

- **Geactiveerd:** ✅ JA
- **Betaling eerst:** ✅ JA (Payment First)
- **Verificatie na betaling:** ✅ JA
- **Onmiddellijke activering:** ✅ JA
- **Doel:** Zorgen dat betaling vóór activering plaatsvindt

### 📴 Offline-resistentie

- **Geactiveerd:** ✅ JA
- **Genadeperiode:** 168 uur (7 dagen)
- **Gecachte verificatie:** ✅ JA
- **Progressieve demping offline:** ✅ JA
- **Doel:** Systeem werkt ook zonder internet gedurende 7 dagen

---

## 5️⃣ BELEIDSMOTOR (Functiebeperkingen)

### 📋 Restrictietypen

#### 5.1 Tijdgebaseerde restricties
- **Geactiveerd:** ✅ JA
- **Beschrijving:** Functies kunnen op bepaalde tijden geblokkeerd zijn
- **Voorbeeld:** Alleen tijdens kantooruren toegestaan

#### 5.2 Functie-gebaseerde restricties
- **Geactiveerd:** ✅ JA
- **Beschrijving:** Functies vereisen bepaalde features
- **Voorbeeld:** Premium-functie vereist premium-licentie

#### 5.3 Gebruik-gebaseerde restricties
- **Geactiveerd:** ✅ JA
- **Beschrijving:** Beperking van gebruiksfrequentie
- **Voorbeeld:** Maximaal 10 aanroepen per dag

---

## 6️⃣ RATE LIMITING (API-niveau)

### 🔒 Implementatie

Het systeem gebruikt **Rate Limiting** op API-niveau:

#### Standaardlimieten:
- **Voucher Issue:** 60 verzoeken per minuut
- **Voucher Book:** 60 verzoeken per minuut
- **Voucher Bookings:** 120 verzoeken per minuut
- **Slots Available:** 120 verzoeken per minuut
- **Mortgage Application:** 60 verzoeken per minuut
- **Mortgage Offer:** 60 verzoeken per minuut
- **Mortgage Offer List:** 120 verzoeken per minuut
- **Telemetry:** 300 verzoeken per minuut
- **Telbank Transfers:** 120 verzoeken per minuut

---

## 7️⃣ WACHTWOORDREGULERING / AUTHENTICATIE

### 🔐 Identiteitssysteem

**GEEN klassiek wachtwoordsysteem!**

In plaats daarvan:
- **Geen e-mailverificatie**
- **Geen wachtwoordlogin**
- **Geen klassieke accounts**

### ✅ Alternatief: Manifest-gebaseerde identiteit

Zie hoofdrapport voor volledige details.

---

## ✅ SAMENVATTING

**Toegangsbeperking:** ✅ Geïmplementeerd via tijdvertraging (geen blokkade)  
**Wachtwoordregulering:** ✅ Geïmplementeerd via Manifest-Auth (geen klassiek wachtwoord)  
**Koopprikkel:** ✅ Geïmplementeerd via progressieve demping & Prickle-User-Slot  
**Status:** Configuratie compleet, integratie in THYNK ORDERS frontend open

---

**Einde van het rapport**

