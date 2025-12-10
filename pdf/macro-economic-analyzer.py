"""
Macro-Economic Bank Statement Analyzer
Professionelle makroökonomische Analyse von Bankauszügen
"""

import sys
import re
import json
import fitz  # PyMuPDF
from datetime import datetime
from typing import Dict, List, Optional
from collections import defaultdict
import statistics

class MacroEconomicAnalyzer:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = None
        self.transactions = []
        self.metrics = {}
        
    def extract_text(self) -> str:
        """Extrahiere Text aus PDF"""
        self.doc = fitz.open(self.pdf_path)
        full_text = ""
        for page in self.doc:
            full_text += page.get_text()
        return full_text
    
    def parse_transactions(self, text: str) -> List[Dict]:
        """Parse Transaktionen aus Bankauszug"""
        transactions = []
        
        # Muster für verschiedene Transaktionsformate
        patterns = [
            # Format: DD-MM-YYYY Description Amount
            r'(\d{2}[-/]\d{2}[-/]\d{4})\s+(.+?)\s+([+-]?[\d.,]+)',
            # Format: DD.MM.YYYY Description EUR Amount
            r'(\d{2}\.\d{2}\.\d{4})\s+(.+?)\s+EUR\s+([+-]?[\d.,]+)',
            # IBAN Format
            r'IBAN[:\s]+([A-Z]{2}\d{2}[A-Z0-9]+)',
        ]
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Suche nach Datum
            date_match = re.search(r'(\d{2}[-/.]\d{2}[-/.]\d{4})', line)
            if date_match:
                date_str = date_match.group(1)
                
                # Suche nach Betrag
                amount_match = re.search(r'([+-]?[\d.,]+)\s*EUR?', line, re.IGNORECASE)
                if not amount_match:
                    amount_match = re.search(r'([+-]?[\d.,]+)$', line)
                
                if amount_match:
                    amount_str = amount_match.group(1).replace(',', '.')
                    try:
                        amount = float(amount_str)
                        description = line.replace(date_str, '').replace(amount_str, '').strip()
                        
                        transactions.append({
                            'date': date_str,
                            'description': description,
                            'amount': amount,
                            'type': 'credit' if amount > 0 else 'debit'
                        })
                    except ValueError:
                        pass
        
        return transactions
    
    def calculate_macro_metrics(self, transactions: List[Dict]) -> Dict:
        """Berechne makroökonomische Metriken"""
        if not transactions:
            return {}
        
        amounts = [t['amount'] for t in transactions]
        credits = [t['amount'] for t in transactions if t['amount'] > 0]
        debits = [abs(t['amount']) for t in transactions if t['amount'] < 0]
        
        metrics = {
            'total_transactions': len(transactions),
            'total_volume': sum(amounts),
            'total_credits': sum(credits) if credits else 0,
            'total_debits': sum(debits) if debits else 0,
            'net_flow': sum(amounts),
            'average_transaction': statistics.mean(amounts) if amounts else 0,
            'median_transaction': statistics.median(amounts) if amounts else 0,
            'max_credit': max(credits) if credits else 0,
            'max_debit': max(debits) if debits else 0,
            'credit_count': len(credits),
            'debit_count': len(debits),
            'credit_debit_ratio': len(credits) / len(debits) if debits else float('inf'),
            'volatility': statistics.stdev(amounts) if len(amounts) > 1 else 0,
        }
        
        # Cashflow-Analyse
        if transactions:
            daily_flows = defaultdict(float)
            for t in transactions:
                date_key = t['date'][:10]  # YYYY-MM-DD
                daily_flows[date_key] += t['amount']
            
            metrics['daily_flows'] = dict(daily_flows)
            metrics['positive_days'] = sum(1 for v in daily_flows.values() if v > 0)
            metrics['negative_days'] = sum(1 for v in daily_flows.values() if v < 0)
            metrics['average_daily_flow'] = statistics.mean(list(daily_flows.values())) if daily_flows else 0
        
        # Kategorisierung
        categories = self.categorize_transactions(transactions)
        metrics['categories'] = categories
        
        return metrics
    
    def categorize_transactions(self, transactions: List[Dict]) -> Dict:
        """Kategorisiere Transaktionen"""
        categories = defaultdict(lambda: {'count': 0, 'total': 0, 'transactions': []})
        
        category_keywords = {
            'Income': ['salary', 'wage', 'income', 'payment', 'credit', 'deposit', 'overboeking'],
            'Expenses': ['payment', 'debit', 'withdrawal', 'purchase', 'betaling'],
            'Transfers': ['transfer', 'overboeking', 'sepa', 'iban'],
            'Fees': ['fee', 'charge', 'kosten', 'vergoeding'],
            'Interest': ['interest', 'rente'],
            'Investments': ['investment', 'dividend', 'dividend'],
        }
        
        for t in transactions:
            desc_lower = t['description'].lower()
            categorized = False
            
            for category, keywords in category_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    categories[category]['count'] += 1
                    categories[category]['total'] += abs(t['amount'])
                    categories[category]['transactions'].append(t)
                    categorized = True
                    break
            
            if not categorized:
                categories['Other']['count'] += 1
                categories['Other']['total'] += abs(t['amount'])
                categories['Other']['transactions'].append(t)
        
        return {k: {
            'count': v['count'],
            'total': v['total'],
            'percentage': (v['total'] / sum(abs(t['amount']) for t in transactions) * 100) if transactions else 0
        } for k, v in categories.items()}
    
    def generate_macro_report(self) -> Dict:
        """Generiere makroökonomischen Bericht"""
        text = self.extract_text()
        transactions = self.parse_transactions(text)
        metrics = self.calculate_macro_metrics(transactions)
        
        # Makroökonomische Indikatoren
        report = {
            'metadata': {
                'pdf_file': self.pdf_path,
                'analysis_date': datetime.now().isoformat(),
                'analyzer_version': '1.0.0',
                'total_pages': len(self.doc) if self.doc else 0
            },
            'transactions': transactions,
            'macro_metrics': metrics,
            'economic_indicators': self.calculate_economic_indicators(metrics),
            'trends': self.analyze_trends(transactions),
            'recommendations': self.generate_recommendations(metrics)
        }
        
        if self.doc:
            self.doc.close()
        
        return report
    
    def calculate_economic_indicators(self, metrics: Dict) -> Dict:
        """Berechne makroökonomische Indikatoren"""
        indicators = {}
        
        if metrics.get('total_volume', 0) != 0:
            # Liquiditätsindikator
            indicators['liquidity_ratio'] = metrics.get('total_credits', 0) / abs(metrics.get('total_debits', 1))
            
            # Cashflow-Stabilität
            volatility = metrics.get('volatility', 0)
            avg_transaction = abs(metrics.get('average_transaction', 1))
            indicators['stability_index'] = 1 - min(volatility / avg_transaction, 1) if avg_transaction > 0 else 0
            
            # Aktivitätsindikator
            indicators['activity_index'] = metrics.get('total_transactions', 0) / 30  # pro Tag
            
            # Diversifikationsindex
            categories = metrics.get('categories', {})
            if categories:
                category_counts = [v['count'] for v in categories.values()]
                total_categories = len([c for c in category_counts if c > 0])
                indicators['diversification_index'] = total_categories / len(categories) if categories else 0
        
        return indicators
    
    def analyze_trends(self, transactions: List[Dict]) -> Dict:
        """Analysiere Trends"""
        if not transactions:
            return {}
        
        # Sortiere nach Datum
        sorted_transactions = sorted(transactions, key=lambda x: x['date'])
        
        # Wöchentliche Trends
        weekly_totals = defaultdict(float)
        for t in sorted_transactions:
            # Vereinfachte Wochenberechnung
            week_key = t['date'][:7]  # YYYY-MM
            weekly_totals[week_key] += t['amount']
        
        # Trend-Richtung
        amounts = [t['amount'] for t in sorted_transactions]
        if len(amounts) > 1:
            trend_direction = 'increasing' if amounts[-1] > amounts[0] else 'decreasing'
        else:
            trend_direction = 'stable'
        
        return {
            'weekly_totals': dict(weekly_totals),
            'trend_direction': trend_direction,
            'transaction_frequency': len(transactions) / max(1, len(set(t['date'][:7] for t in transactions)))
        }
    
    def generate_recommendations(self, metrics: Dict) -> List[str]:
        """Generiere makroökonomische Empfehlungen"""
        recommendations = []
        
        # Liquiditätsanalyse
        liquidity_ratio = metrics.get('macro_metrics', {}).get('credit_debit_ratio', 0)
        if liquidity_ratio < 0.8:
            recommendations.append("⚠️ Niedrige Liquiditätsquote: Erhöhung der Einnahmen oder Reduzierung der Ausgaben empfohlen")
        elif liquidity_ratio > 1.5:
            recommendations.append("✅ Gute Liquiditätsquote: Überschüssige Mittel könnten investiert werden")
        
        # Volatilitätsanalyse
        volatility = metrics.get('macro_metrics', {}).get('volatility', 0)
        if volatility > 1000:
            recommendations.append("📊 Hohe Volatilität: Cashflow-Stabilisierung durch regelmäßige Zahlungen empfohlen")
        
        # Diversifikation
        categories = metrics.get('macro_metrics', {}).get('categories', {})
        if len(categories) < 3:
            recommendations.append("🔄 Geringe Diversifikation: Ausweitung der Transaktionskategorien empfohlen")
        
        # Aktivitätsanalyse
        activity = metrics.get('macro_metrics', {}).get('total_transactions', 0)
        if activity < 5:
            recommendations.append("📈 Niedrige Transaktionsaktivität: Regelmäßigere Finanzaktivitäten könnten vorteilhaft sein")
        
        return recommendations

def main():
    if len(sys.argv) < 2:
        print("Usage: python macro-economic-analyzer.py <pdf_file> [output_json]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_json = sys.argv[2] if len(sys.argv) > 2 else None
    
    analyzer = MacroEconomicAnalyzer(pdf_path)
    report = analyzer.generate_macro_report()
    
    # Ausgabe
    print("=" * 80)
    print("MACRO-ECONOMIC BANK STATEMENT ANALYSIS")
    print("=" * 80)
    print(f"\nPDF: {pdf_path}")
    print(f"Analysedatum: {report['metadata']['analysis_date']}")
    print(f"Seiten: {report['metadata']['total_pages']}")
    
    metrics = report['macro_metrics']
    print(f"\n📊 MAKROÖKONOMISCHE METRIKEN:")
    print(f"  Gesamttransaktionen: {metrics.get('total_transactions', 0)}")
    print(f"  Gesamtvolumen: €{metrics.get('total_volume', 0):,.2f}")
    print(f"  Netto-Cashflow: €{metrics.get('net_flow', 0):,.2f}")
    print(f"  Durchschnittliche Transaktion: €{metrics.get('average_transaction', 0):,.2f}")
    print(f"  Volatilität: €{metrics.get('volatility', 0):,.2f}")
    
    indicators = report['economic_indicators']
    print(f"\n📈 WIRTSCHAFTSINDIKATOREN:")
    for key, value in indicators.items():
        print(f"  {key}: {value:.3f}")
    
    print(f"\n💡 EMPFEHLUNGEN:")
    for rec in report['recommendations']:
        print(f"  {rec}")
    
    # JSON Export
    if output_json:
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        print(f"\n✅ Bericht gespeichert: {output_json}")
    else:
        print(f"\n💾 JSON Export:")
        print(json.dumps(report, indent=2, ensure_ascii=False, default=str)[:500] + "...")

if __name__ == "__main__":
    main()

