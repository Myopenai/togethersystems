#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  MARKTWERT-RECHNER                                                        ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Berechnet Teilhabe-Anspruch basierend auf Marktwert-Formel              ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
set -euo pipefail

# Farben
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
NC='\033[0m'

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  💰 MARKTWERT-TEILHABE RECHNER                                            ║"
echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# EINGABEN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}📊 Eingabewerte${NC}"
echo ""

# Basisersparnis pro Jahr (S)
read -p "  Basisersparnis pro Jahr (S) [EUR]: " S
S=${S:-50000}

# Marktwert der erzeugten Produktion (V)
read -p "  Marktwert der Produktion (V) [EUR]: " V
V=${V:-400000}

# Ideenentwickler-Marge (p) in Prozent
read -p "  Ideenentwickler-Marge (p) [%]: " p_percent
p_percent=${p_percent:-12}

# Abschlag wegen Formalqualifikation
read -p "  Abschlag (nur falls vereinbart) [%]: " abschlag_percent
abschlag_percent=${abschlag_percent:-0}

# Verteilungsfaktor über Partner/Investoren (f)
read -p "  Dein Anteil nach Deals (f) [0-1]: " f
f=${f:-0.7}

# ═══════════════════════════════════════════════════════════════════════════════
# BERECHNUNG
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}⚙️  Berechnung${NC}"
echo ""

# Konvertiere Prozent zu Dezimal
p=$(echo "scale=4; $p_percent / 100" | bc)
abschlag=$(echo "scale=4; $abschlag_percent / 100" | bc)

# p_eff = max(0, p - abschlag)
p_eff=$(echo "scale=4; if($p - $abschlag > 0) $p - $abschlag else 0" | bc)

# V_gesamt = V + S (Cost-Avoidance als Leistungskomponente)
V_gesamt=$(echo "scale=2; $V + $S" | bc)

# A = p_eff * V * f (Jährlicher Anspruch auf Marktwert)
A_marktwert=$(echo "scale=2; $p_eff * $V * $f" | bc)

# A_gesamt = p_eff * V_gesamt * f (inkl. Ersparnis)
A_gesamt=$(echo "scale=2; $p_eff * $V_gesamt * $f" | bc)

# Monatlicher Anspruch
A_monatlich=$(echo "scale=2; $A_gesamt / 12" | bc)

# Ohne Abschlag
p_ohne_abschlag=$p
A_ohne_abschlag=$(echo "scale=2; $p_ohne_abschlag * $V_gesamt * $f" | bc)

# Differenz
Differenz=$(echo "scale=2; $A_ohne_abschlag - $A_gesamt" | bc)

# ═══════════════════════════════════════════════════════════════════════════════
# AUSGABE
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║  📈 MARKTWERT-ANALYSE                                                     ║${NC}"
echo -e "${PURPLE}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${PURPLE}║                                                                           ║${NC}"
echo -e "${PURPLE}║  ${CYAN}EINGABEN${NC}"
echo -e "${PURPLE}║  ────────────────────────────────────────────────────────────────────────${NC}"
printf "${PURPLE}║  Basisersparnis (S):          %'15.2f EUR${NC}\n" $S
printf "${PURPLE}║  Marktwert Produktion (V):    %'15.2f EUR${NC}\n" $V
printf "${PURPLE}║  Ideenentwickler-Marge (p):   %15.1f %%${NC}\n" $p_percent
printf "${PURPLE}║  Abschlag:                    %15.1f %%${NC}\n" $abschlag_percent
printf "${PURPLE}║  Dein Anteil (f):             %15.2f${NC}\n" $f
echo -e "${PURPLE}║                                                                           ║${NC}"
echo -e "${PURPLE}║  ${CYAN}FORMELN${NC}"
echo -e "${PURPLE}║  ────────────────────────────────────────────────────────────────────────${NC}"
echo -e "${PURPLE}║  p_eff = max(0, p - Abschlag) = $(echo "scale=2; $p_eff * 100" | bc) %${NC}"
echo -e "${PURPLE}║  V_gesamt = V + S = $(printf "%'.2f" $V_gesamt) EUR${NC}"
echo -e "${PURPLE}║  A = p_eff × V_gesamt × f${NC}"
echo -e "${PURPLE}║                                                                           ║${NC}"
echo -e "${PURPLE}║  ${GREEN}ERGEBNIS${NC}"
echo -e "${PURPLE}║  ────────────────────────────────────────────────────────────────────────${NC}"
printf "${PURPLE}║  ${GREEN}Jährlicher Anspruch:          %'15.2f EUR${NC}\n" $A_gesamt
printf "${PURPLE}║  ${GREEN}Monatlicher Anspruch:         %'15.2f EUR${NC}\n" $A_monatlich
echo -e "${PURPLE}║                                                                           ║${NC}"
echo -e "${PURPLE}║  ${YELLOW}VERGLEICH (ohne Abschlag)${NC}"
echo -e "${PURPLE}║  ────────────────────────────────────────────────────────────────────────${NC}"
printf "${PURPLE}║  Ohne Abschlag (p=${p_percent}%%):      %'15.2f EUR${NC}\n" $A_ohne_abschlag
printf "${PURPLE}║  Differenz durch Abschlag:    %'15.2f EUR${NC}\n" $Differenz
echo -e "${PURPLE}║                                                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# SZENARIEN
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}📊 Szenarien-Analyse${NC}"
echo ""

echo -e "${BLUE}┌─────────────────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│  Marge (p)  │  Mit Abschlag  │  Ohne Abschlag  │  Differenz              │${NC}"
echo -e "${BLUE}├─────────────────────────────────────────────────────────────────────────────┤${NC}"

for marge in 8 10 12 15 18 20; do
    p_dec=$(echo "scale=4; $marge / 100" | bc)
    p_eff_scenario=$(echo "scale=4; if($p_dec - $abschlag > 0) $p_dec - $abschlag else 0" | bc)
    
    A_mit=$(echo "scale=2; $p_eff_scenario * $V_gesamt * $f" | bc)
    A_ohne=$(echo "scale=2; $p_dec * $V_gesamt * $f" | bc)
    diff=$(echo "scale=2; $A_ohne - $A_mit" | bc)
    
    printf "${BLUE}│     %2d %%    │  %'12.2f € │   %'12.2f € │  %'12.2f €          │${NC}\n" $marge $A_mit $A_ohne $diff
done

echo -e "${BLUE}└─────────────────────────────────────────────────────────────────────────────┘${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# EMPFEHLUNGEN
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║  💡 EMPFEHLUNGEN                                                          ║${NC}"
echo -e "${PURPLE}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${PURPLE}║                                                                           ║${NC}"
echo -e "${PURPLE}║  1. Verhandle ein Margenintervall: p ∈ [8%, 18%] mit KPI-Eskalation      ║${NC}"
echo -e "${PURPLE}║  2. Setze Abschlag nur, wenn er schnellere Unterschrift bringt           ║${NC}"
echo -e "${PURPLE}║  3. Definiere V klar: Umsatz + Cost-Avoidance + Konversions-KPIs         ║${NC}"
echo -e "${PURPLE}║  4. Vereinbare Floor/Cap für Stabilität                                  ║${NC}"
echo -e "${PURPLE}║  5. Sichere Auditrechte (Quartalsberichte, unabhängige Prüfung)          ║${NC}"
echo -e "${PURPLE}║  6. Schütze IP sofort: Marke, Urheberrecht, Geschäftsgeheimnis           ║${NC}"
echo -e "${PURPLE}║                                                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${PURPLE}[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"
echo -e "${PURPLE}© 2025 Raymond Demitrio Tel${NC}"

