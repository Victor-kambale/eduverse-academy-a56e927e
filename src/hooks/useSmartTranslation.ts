import { useTranslation } from "react-i18next";

/**
 * Small helper for mixed translation file structures.
 * Tries multiple keys and returns the first that exists; otherwise uses defaultValue.
 */
export function useSmartTranslation() {
  const { t, i18n } = useTranslation();

  const tSmart = (
    keys: string | string[],
    options?: { defaultValue?: string; [key: string]: any }
  ): string => {
    const list = Array.isArray(keys) ? keys : [keys];

    for (const key of list) {
      if (i18n.exists(key)) {
        const result = t(key, options as any);
        return typeof result === 'string' ? result : String(result);
      }
    }

    // Fall back: prefer explicit defaultValue if provided, otherwise return translation of first key.
    if (options?.defaultValue != null) return options.defaultValue;
    const result = t(list[0], options as any);
    return typeof result === 'string' ? result : String(result);
  };

  return { t, tSmart, i18n };
}
