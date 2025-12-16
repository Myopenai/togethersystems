type Locale = 'en' | 'de' | 'fr' | 'es';
export declare class I18nService {
    private translations;
    constructor();
    private loadTranslations;
    t(key: string, locale?: Locale, params?: Record<string, unknown>): string;
    formatNumber(value: number, locale?: Locale, options?: Intl.NumberFormatOptions): string;
    formatDate(date: Date, locale?: Locale, options?: Intl.DateTimeFormatOptions): string;
    formatCurrency(amount: number, currency: string, locale?: Locale): string;
    getAvailableLocales(): Locale[];
    getAllTranslations(key: string): Record<Locale, string>;
}
export {};
