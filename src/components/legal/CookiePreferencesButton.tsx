'use client';

import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CookiePreferencesButton({ className }: { className?: string }) {
  function openPreferences() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('calcettoxp:open-cookie-consent'));
    }
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={openPreferences}
      aria-label="Gestisci preferenze cookie"
    >
      <Cookie className="w-4 h-4" aria-hidden />
      Preferenze cookie
    </Button>
  );
}
