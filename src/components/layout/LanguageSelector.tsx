import { useState, useEffect } from "react";
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
  native_name: string;
  flag: string;
  is_rtl: boolean;
  is_active: boolean;
}

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('language_settings')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLanguages((data as Language[]) || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      // Fallback to defaults
      setLanguages([
        { id: '1', code: 'en', name: 'English', native_name: 'English', flag: '🇺🇸', is_rtl: false, is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: string) => {
    const lang = languages.find(l => l.code === code);
    i18n.changeLanguage(code);
    
    // Handle RTL
    if (lang?.is_rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    
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
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="hidden md:inline">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={i18n.language === lang.code ? "bg-accent/10" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {lang.native_name !== lang.name && (
              <span className="text-xs text-muted-foreground">{lang.native_name}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};