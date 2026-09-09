'use client';

import { Trash2 } from 'lucide-react';

export function DeleteAccountTriggerButton() {
  function handleTrigger(e: React.FormEvent) {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('calcettoxp:delete-account-open'));
    }
  }

  return (
    <form onSubmit={handleTrigger}>
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 rounded-xl bg-danger/10 border border-danger/30 text-danger font-semibold hover:bg-danger/15 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
      >
        <Trash2 className="w-4 h-4" aria-hidden />
        Elimina il mio account
      </button>
    </form>
  );
}
