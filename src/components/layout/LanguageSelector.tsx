import { useState, useEffect, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string | null;
  flag: string | null;
  is_rtl: boolean | null;
  is_active: boolean | null;
  is_default?: boolean | null;
}

// Trigger button wrapped in forwardRef to fix ref warning
const LanguageTriggerButton = forwardRef<HTMLButtonElement, { currentLanguage?: Language }>(
  ({ currentLanguage, ...props }, ref) => (
    <Button ref={ref} variant="ghost" size="sm" className="gap-2" {...props}>
      <Globe className="w-4 h-4" />
      <span className="hidden sm:inline">{currentLanguage?.flag}</span>
      <span className="hidden md:inline">{currentLanguage?.name}</span>
    </Button>
  )
);
LanguageTriggerButton.displayName = "LanguageTriggerButton";

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (isOpen) fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const normalizeLng = (lng?: string) => (lng || "en").split("-")[0];

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from("language_settings")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      const list = (data as Language[]) || [];
      setLanguages(list);

      // If user never selected a language, respect the admin's default.
      const stored = localStorage.getItem("i18nextLng");
      if (!stored) {
        const defaultLang = list.find((l) => l.is_default === true) || list[0];
        if (defaultLang?.code) i18n.changeLanguage(defaultLang.code);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      // Fallback to defaults
      setLanguages([
        {
          id: "1",
          code: "en",
          name: "English",
          native_name: "English",
          flag: "🇺🇸",
          is_rtl: false,
          is_active: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activeLng = normalizeLng(i18n.resolvedLanguage || i18n.language);
  const currentLanguage =
    languages.find((lang) => lang.code === activeLng) ||
    languages.find((lang) => lang.is_default === true) ||
    languages[0];

  const handleLanguageChange = (code: string) => {
    const lang = languages.find((l) => l.code === code);
    i18n.changeLanguage(code);

    // Handle RTL
    document.documentElement.dir = lang?.is_rtl === true ? "rtl" : "ltr";
    document.documentElement.lang = code;

    setIsOpen(false);
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (languages.length === 0) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <LanguageTriggerButton currentLanguage={currentLanguage} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={activeLng === lang.code ? "bg-accent/10" : ""}
          >
            <span className="mr-2">{lang.flag || '🌐'}</span>
            <span className="flex-1">{lang.name}</span>
            {lang.native_name && lang.native_name !== lang.name && (
              <span className="text-xs text-muted-foreground">{lang.native_name}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};