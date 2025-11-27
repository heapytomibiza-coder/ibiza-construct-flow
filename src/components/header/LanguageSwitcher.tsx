/**
 * Language Switcher Component
 * Phase 16: Internationalization
 * Updated to support EN, ES, DE, FR
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
import { supportedLanguages, type SupportedLanguage } from '@/lib/i18n/config';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = async (lng: SupportedLanguage) => {
    try {
      // Save to localStorage first (required for custom detector)
      localStorage.setItem('i18nextLng', lng);
      // Change the language
      await i18n.changeLanguage(lng);
      // Force reload to ensure all lazy-loaded translations update
      window.location.reload();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const currentLanguage = (i18n.language.split('-')[0] as SupportedLanguage) || 'en';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 relative">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {supportedLanguages[currentLanguage]?.flag} {supportedLanguages[currentLanguage]?.name}
          </span>
          <span className="sm:hidden">{supportedLanguages[currentLanguage]?.flag}</span>
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