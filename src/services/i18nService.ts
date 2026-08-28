import i18n, { type i18n as i18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend"
import LanguageDetector from "i18next-browser-languagedetector";
import { LSC } from "../configs"

const FALLBACK_LOCALE = "en";

function isField(node: unknown): node is { type: string; label?: string; value: unknown } {
  return (
    typeof node === "object" &&
    node !== null &&
    !Array.isArray(node) &&
    "type" in node &&
    "value" in node
  );
}

function unwrap(node: unknown): unknown {
  if (isField(node)) return unwrap(node.value);
  if (Array.isArray(node)) return node.map(unwrap);
  if (typeof node === "object" && node !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) out[k] = unwrap(v);
    return out;
  }
  return node;
}

class I18nService {
  private instance: i18nInstance;
  constructor() {
    this.instance = i18n;
  }

  private getLoadPath(id?: string) {
    return (lngs: string[]) => {
      const lang = lngs[0];
      return id
          ? `/translations/${id}-${lang}.json`
          : `/translations/${lang}.json`;
      }
  }

  private getStoredLocale(): string | null {
    return localStorage.getItem(LSC.LS_APP_LOCALE)
  }

  private resolveInitialLocale(): string{
    return this.getStoredLocale() || FALLBACK_LOCALE;
  }


  public init(lang: string, id?: string) {
    return this.instance
      .use(HttpBackend)
      .use(initReactI18next)
      .use(LanguageDetector)
      .init({
        lng: lang,
        fallbackLng: FALLBACK_LOCALE,
        backend: {
          loadPath: this.getLoadPath(id),
          parse: (data: string) => unwrap(JSON.parse(data)) as Record<string, unknown>,
        },
        keySeparator: ".",
        nsSeparator: ":",
        interpolation: { escapeValue: false },
        react: { useSuspense: true, bindI18nStore: "added removed" },
      });
  }

  public loadPath(id?: string) {
    return this.getLoadPath(id);
  }

  public changeLanguage(lang: string) {
    return this.instance.changeLanguage(lang)
  }

  public getInstance() {
    return this.instance;
  }
}

export const i18nService = new I18nService();
