"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    q: "Posso cancellare l'abbonamento in qualsiasi momento?",
    a: "Sì. Puoi disattivare il rinnovo automatico in qualsiasi momento dal Customer Portal Stripe (Impostazioni → Abbonamento → Gestisci abbonamento), senza penali. La disattivazione non pregiudica l'utilizzo del periodo PRO già pagato fino alla sua scadenza naturale.",
  },
  {
    q: "Cosa succede al mio account se torno FREE?",
    a: "Niente. Tutti i tuoi dati restano intatti. Torni semplicemente ad avere le limitazioni del piano FREE.",
  },
  {
    q: "Come posso pagare?",
    a: "Accettiamo tutte le principali carte di credito e debito, oltre a Google Pay e Apple Pay tramite Stripe.",
  },
  {
    q: "C'è un periodo di prova?",
    a: "Il piano PRO si attiva immediatamente al momento dell'abbonamento; non è attualmente previsto un periodo di prova tecnico. I diritti di recesso, rimborso e gli altri diritti del consumatore si applicano nei casi e secondo le modalità previste dalla normativa vigente.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="divide-y divide-white/10 border-y border-white/10 -my-1">
      {faqItems.map((item, idx) => {
        const isOpen = openIndex === idx;
        const panelId = `faq-panel-${idx}`;
        const buttonId = `faq-button-${idx}`;
        return (
          <div key={idx}>
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(idx)}
              className={`w-full flex items-center justify-between gap-4 text-left py-4 md:py-[18px] px-1
                transition-colors duration-200
                hover:bg-white/[0.02]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenElectric/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bgCard focus-visible:rounded-lg
                group`}
            >
              <span
                className={`text-sm md:text-[15px] font-bold tracking-tight transition-colors duration-200 ${
                  isOpen ? "text-greenElectric" : "text-textPrimary"
                }`}
              >
                {item.q}
              </span>
              <ChevronDown
                size={18}
                strokeWidth={2.25}
                className={`shrink-0 transition-all duration-300 ease-out ${
                  isOpen
                    ? "rotate-180 text-greenElectric"
                    : "text-textMuted group-hover:text-textPrimary"
                }`}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-all duration-300 ease-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100 pb-4 md:pb-5"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-sm md:text-[14px] text-textMuted leading-relaxed pr-2 md:pr-8">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
