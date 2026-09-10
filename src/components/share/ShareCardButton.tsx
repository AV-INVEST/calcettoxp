'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAppBaseUrl } from '@/lib/app-url';

interface ShareCardButtonProps {
  username: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

function buildShareUrl(username: string): string {
  const envBase = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_APP_URL) || undefined;
  const base = (typeof window !== 'undefined' && window.location.origin) || envBase || getAppBaseUrl();
  return `${base.replace(/\/$/, '')}/p/${encodeURIComponent(username)}`;
}

export function ShareCardButton({
  username,
  label = 'Condividi la mia card',
  variant = 'secondary',
  size = 'md',
}: ShareCardButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareUrl = buildShareUrl(username);
  const shareText = 'Guarda la mia carriera su CalcettoXP ⚽';
  const shareTitle = 'La mia carriera CalcettoXP';

  async function handleShare() {
    setLoading(true);
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      }
      await handleCopy();
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.warn('share fallback to copy', e);
        await handleCopy();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error('copy failed', e);
    }
  }

  return (
    <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap w-full sm:w-auto">
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={loading}
        aria-label="Condividi la mia scheda giocatore"
        className="inline-flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" aria-hidden />
        <span>{label}</span>
      </Button>
      <Button
        variant="ghost"
        size={size}
        onClick={handleCopy}
        aria-label="Copia link profilo pubblico"
        className="inline-flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-greenElectric" aria-hidden />
            <span className="md:inline hidden text-greenElectric">Copiato!</span>
            <span className="md:hidden inline text-greenElectric">OK</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" aria-hidden />
            <span className="md:inline hidden">Copia link</span>
            <span className="md:hidden inline">Copia</span>
          </>
        )}
      </Button>
    </div>
  );
}
