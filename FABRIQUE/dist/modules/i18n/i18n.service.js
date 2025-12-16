"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nService = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
let I18nService = class I18nService {
    translations = {
        en: {},
        de: {},
        fr: {},
        es: {},
    };
    constructor() {
        this.loadTranslations();
    }
    loadTranslations() {
        const localesDir = path.join(__dirname, 'locales');
        ['en', 'de', 'fr', 'es'].forEach((locale) => {
            try {
                const filePath = path.join(localesDir, `${locale}.yaml`);
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    this.translations[locale] = yaml.load(fileContent);
                }
            }
            catch (error) {
                console.error(`Failed to load ${locale} translations:`, error);
            }
        });
    }
    t(key, locale = 'en', params = {}) {
        const keys = key.split('.');
        let value = this.translations[locale] || this.translations['en'];
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
            return Object.entries(params).reduce((str, [param, val]) => str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val)), value);
        }
        return String(value);
    }
    // Add support for number formatting
    formatNumber(value, locale = 'en', options) {
        return new Intl.NumberFormat(locale, options).format(value);
    }
    // Add support for date formatting
    formatDate(date, locale = 'en', options) {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options,
        }).format(date);
    }
    // Add support for currency formatting
    formatCurrency(amount, currency, locale = 'en') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
        }).format(amount);
    }
    // Get all available locales
    getAvailableLocales() {
        return Object.keys(this.translations);
    }
    // Get translation for a specific key in all locales
    getAllTranslations(key) {
        return this.getAvailableLocales().reduce((acc, locale) => ({
            ...acc,
            [locale]: this.t(key, locale),
        }), {});
    }
};
exports.I18nService = I18nService;
exports.I18nService = I18nService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], I18nService);
//# sourceMappingURL=i18n.service.js.map