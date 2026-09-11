import { Metadata } from 'next';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import { LegalLayout, Section, SubSection, P, Ul, Blockquote, legalMetaBase } from '@/components/legal/LegalLayout';
import { CookiePrefCard } from '@/components/legal/CookiePrefCard';

export const metadata: Metadata = {
  ...legalMetaBase,
  title: `Cookie Policy | ${LEGAL_CONFIG.appName}`,
  description: `Politica sui cookie e preferenze di tracciamento di ${LEGAL_CONFIG.appName}. Categorie di cookie, durata e modalità di gestione.`,
};

const { appName, canonicalRoot, territory, contactEmail, lastUpdatedHuman, services } = LEGAL_CONFIG;

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle={`Come ${appName} utilizza i cookie e strumenti simili. Ultimo aggiornamento: ${lastUpdatedHuman}.`}
    >
      <CookiePrefCard />

      <P>
        La presente Cookie Policy descrive l&apos;uso di cookie, localStorage e tecnologie simili da parte di <strong>{appName}</strong>.
      </P>

      <Section title="1. Categorie di cookie presenti">
        <P>{appName} utilizza <strong>esclusivamente cookie tecnici necessari</strong> per il funzionamento del Servizio. <strong>Non sono presenti cookie analitici, di profilazione o di marketing</strong>: nessun tracciamento statistico aggregato, nessuna pubblicità comportamentale, nessun retargeting.</P>

        <SubSection title="1.1 Cookie Necessari (sempre attivi)">
          <P>Cookie tecnici indispensabili per il funzionamento base del Servizio. Non possono essere disattivati. Non richiedono consenso espresso ai sensi delle normative vigenti.</P>
          <Ul>
            <li><strong>Auth.js sessione</strong> (NextAuth / Auth.js v5): cookie di sessione e CSRF per mantenere l&apos;Utente autenticato e proteggere i form. Durata: sessione + refresh token configurato da Auth.js.</li>
            <li><strong>Stripe sessione</strong>: cookie tecnici gestiti da Stripe durante i flussi di pagamento e nel Customer Portal per il corretto completamento delle transazioni. Durata: secondo le policy di Stripe.</li>
            <li><strong>Preferenze funzionali</strong>: voci in localStorage per ricordare tema chiaro/scuro, preferenze di layout e scelte puramente funzionali dell&apos;interfaccia. Durata: persistente fino a cancellazione manuale o logout.</li>
          </Ul>
        </SubSection>

        <SubSection title="1.2 Cookie Analitici">
          <P><strong>Nessun cookie analitico è presente o caricato</strong> su {appName}. Non sono attivi Google Analytics, Plausible, Vercel Analytics o altri strumenti di misurazione aggregata. Non vengono raccolti dati di navigazione a fini statistici o di miglioramento UX tramite cookie di terze parti.</P>
        </SubSection>

        <SubSection title="1.3 Cookie Marketing / Pubblicitari">
          <P><strong>Nessun cookie marketing o pubblicitario è presente o caricato</strong> su {appName}. Non sono installati Meta Pixel, Google Ads, LinkedIn Insight o strumenti di profilazione per campagne promozionali. Non viene effettuato retargeting pubblicitario.</P>
        </SubSection>
      </Section>

      <Section title="2. Strumenti analitici e di marketing">
        <Blockquote>
          <p className="font-bold text-textPrimary leading-snug">
            {appName} non carica attualmente strumenti analitici o di marketing.
          </p>
          <p className="text-textMuted leading-relaxed">
            Il pannello delle preferenze permette di consultare e gestire le categorie di cookie e sarà utilizzato qualora in futuro vengano introdotti strumenti opzionali nel rispetto della normativa applicabile. In ogni momento puoi comunque cancellare tutti i cookie e i dati di sito direttamente dalle impostazioni del tuo browser.
          </p>
        </Blockquote>
      </Section>

      <Section title="3. Gestione delle preferenze tramite browser">
        <P>Puoi gestire o cancellare i cookie direttamente dalle impostazioni del tuo browser. Le modalità variano a seconda del browser in uso:</P>
        <Ul>
          <li>Chrome, Edge, Brave: Impostazioni &rarr; Privacy e sicurezza &rarr; Cookie e altri dati dei siti.</li>
          <li>Firefox: Impostazioni &rarr; Privacy e sicurezza &rarr; Cookie e dati dei siti web.</li>
          <li>Safari: Impostazioni &rarr; Privacy &rarr; Gestisci dati del sito web.</li>
        </Ul>
        <P>Disabilitare i cookie necessari potrebbe impedire il corretto funzionamento dell&apos;autenticazione, dei pagamenti Stripe o delle preferenze di interfaccia.</P>
      </Section>

      <Section title="4. Cookie di terze parti">
        <P>Solo nel contesto di flussi specifici e per il loro corretto svolgimento, alcune tecnologie possono installare cookie o storage necessari per il funzionamento:</P>
        <Ul>
          <li><strong>OAuth Google Login</strong>: cookie gestiti direttamente da Google per l&apos;autenticazione (non controllati da {appName}). Vedi informativa Google: <a className="text-greenElectric underline" href={services.auth.privacyUrl} target="_blank" rel="noreferrer noopener">{services.auth.privacyUrl}</a>.</li>
          <li><strong>Stripe Checkout e Customer Portal</strong>: cookie Stripe durante i flussi di pagamento e gestione abbonamento (non controllati da {appName}). Vedi informativa Stripe: <a className="text-greenElectric underline" href={services.payments.privacyUrl} target="_blank" rel="noreferrer noopener">{services.payments.privacyUrl}</a>.</li>
        </Ul>
      </Section>

      <Section title="5. Riferimenti normativi">
        <P>
          La presente policy è ispirata alle Linee guida cookie e altri strumenti di tracciamento del Garante per la Protezione dei Dati Personali, Provvedimento n. 231 del 10 giugno 2021, e alle successive novità interpretative.
        </P>
      </Section>

      <Section title="6. Titolare e contatti">
        <P>Servizio {appName}, operato sotto la giurisdizione italiana ({territory}).</P>
        <Ul>
          <li><strong>Email:</strong> <a className="text-greenElectric" href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
          <li><strong>Sito web:</strong> <a className="text-greenElectric underline" href={canonicalRoot} target="_blank" rel="noreferrer noopener">{canonicalRoot}</a></li>
        </Ul>
        <P>Per domande sulla Cookie Policy o sulle preferenze di tracciamento, contattaci all&apos;indirizzo email sopra indicato. I dati completi del titolare e le regole contrattuali sono disponibili rispettivamente nella <a href="/privacy" className="text-greenElectric underline">Privacy Policy</a> e nei <a href="/termini" className="text-greenElectric underline">Termini e condizioni d&apos;uso</a>.</P>
      </Section>
    </LegalLayout>
  );
}
