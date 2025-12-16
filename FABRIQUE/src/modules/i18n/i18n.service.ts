import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

type Locale = 'en' | 'de' | 'fr' | 'es';
type TranslationKey = string;
type TranslationValue = string | Record<string, unknown>;

@Injectable()
export class I18nService {
  private translations: Record<Locale, Record<TranslationKey, TranslationValue>> = {
    en: {},
    de: {},
    fr: {},
    es: {},
  };

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    const localesDir = path.join(__dirname, 'locales');
    
    (['en', 'de', 'fr', 'es'] as Locale[]).forEach((locale) => {
      try {
        const filePath = path.join(localesDir, `${locale}.yaml`);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          this.translations[locale] = yaml.load(fileContent) as Record<TranslationKey, TranslationValue>;
        }
      } catch (error) {
        console.error(`Failed to load ${locale} translations:`, error);
      }
    });
  }

  t(key: string, locale: Locale = 'en', params: Record<string, unknown> = {}): string {
    const keys = key.split('.');
    let value: any = this.translations[locale] || this.translations['en'];
    
    // Traverse the translation object
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key} for locale ${locale}`);
        return key; // Return the key as fallback
      }
    }

    // Handle string templates
    if (typeof value === 'string') {
      return Object.entries(params).reduce(
        (str, [param, val]) => str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val)),
        value
      );
    }

    return String(value);
  }

  // Add support for number formatting
  formatNumber(value: number, locale: Locale = 'en', options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale, options).format(value);
  }

  // Add support for date formatting
  formatDate(date: Date, locale: Locale = 'en', options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(date);
  }

  // Add support for currency formatting
  formatCurrency(amount: number, currency: string, locale: Locale = 'en'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  // Get all available locales
  getAvailableLocales(): Locale[] {
    return Object.keys(this.translations) as Locale[];
  }

  // Get translation for a specific key in all locales
  getAllTranslations(key: string): Record<Locale, string> {
    return this.getAvailableLocales().reduce((acc, locale) => ({
      ...acc,
      [locale]: this.t(key, locale),
    }), {} as Record<Locale, string>);
  }
}
