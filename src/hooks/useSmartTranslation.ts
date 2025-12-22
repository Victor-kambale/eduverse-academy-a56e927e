import { useTranslation } from "react-i18next";

/**
 * Small helper for mixed translation file structures.
 * Tries multiple keys and returns the first that exists; otherwise uses defaultValue.
 */
export function useSmartTranslation() {
  const { t, i18n } = useTranslation();

  const tSmart = (
    keys: string | string[],
    options?: Parameters<typeof t>[1] & { defaultValue?: string }
  ) => {
    const list = Array.isArray(keys) ? keys : [keys];

    for (const key of list) {
      if (i18n.exists(key)) return t(key, options as any);
    }

    // Fall back: prefer explicit defaultValue if provided, otherwise return translation of first key.
    if (options?.defaultValue != null) return options.defaultValue;
    return t(list[0], options as any);
  };

  return { t, tSmart, i18n };
}
