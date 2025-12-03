/**
 * Language Switcher Component
 * Phase 16: Internationalization
 * Supports EN and ES
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const supportedLanguages = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
} as const;

type SupportedLanguage = keyof typeof supportedLanguages;

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
  };

  // Get base language (e.g., 'en' from 'en-US')
  const currentLanguage = (i18n.language?.split('-')[0] as SupportedLanguage) || 'en';
  const langConfig = supportedLanguages[currentLanguage] || supportedLanguages.en;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 relative">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {langConfig.flag} {langConfig.name}
          </span>
          <span className="sm:hidden">{langConfig.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(supportedLanguages).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code as SupportedLanguage)}
            className={currentLanguage === code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{flag}</span>
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
