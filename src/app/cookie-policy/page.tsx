import { Metadata } from 'next';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import { LegalLayout, Section, SubSection, P, Ul, Blockquote, legalMetaBase } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  ...legalMetaBase,
  title: `Cookie Policy | ${LEGAL_CONFIG.appName}`,
  description: `Politica sui cookie e preferenze di tracciamento di ${LEGAL_CONFIG.appName}. Categorie di cookie, durata e modalità di gestione.`,
};

const { appName, lastUpdatedHuman, ownerName, contactEmail, vatId, address } = LEGAL_CONFIG;

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle={`Come ${appName} utilizza i cookie e strumenti simili, come puoi gestire le preferenze e cosa viene realmente caricato in base al tuo consenso. Ultimo aggiornamento: ${lastUpdatedHuman}.`}
    >
      <P>
        La presente Cookie Policy descrive l&apos;uso di cookie, localStorage e tecnologie simili da parte di <strong>{appName}</strong>. Una versione interattiva di gestione delle preferenze è disponibile:
      </P>
      <Ul>
        <li>nel banner di primo accesso;</li>
        <li>nel footer del sito (&ldquo;Preferenze cookie&rdquo;);</li>
        <li>nella pagina <a href="/settings" className="text-greenElectric underline">Impostazioni &rarr; Privacy &rarr; Gestisci preferenze cookie</a>.</li>
      </Ul>

      <Section title="1. Categorie di cookie">
        <P>{appName} distingue tre categorie:</P>

        <SubSection title="1.1 Cookie Necessari (sempre attivi)">
          <P>Cookie tecnici indispensabili per il funzionamento base del Servizio. Non possono essere disattivati. Non richiedono consenso espresso ai sensi delle normative vigenti.</P>
          <Ul>
            <li><strong>Auth.js sessione</strong> (NextAuth / Auth.js v5): cookie di sessione e CSRF per mantenere l&apos;Utente autenticato e proteggere i form. Durata: sessione + refresh token configurato da Auth.js.</li>
            <li><strong>calcettoxp-consent</strong>: cookie tecnico che memorizza la tua scelta sulle categorie di cookie. Durata: 12 mesi.</li>
          </Ul>
        </SubSection>

        <SubSection title="1.2 Cookie Analitici (solo su consenso)">
          <P>Strumenti di analisi aggregata per capire come viene utilizzato il Servizio, migliorare la UX e misurare performance macro (es. numero di pagine visitate, durata sessione, dispositivi più comuni).</P>
          <Ul>
            <li>Al momento <strong>nessuno strumento analitico</strong> è attivo su {appName}. I provider (es. Google Analytics, Plausible, Vercel Analytics) non sono stati caricati nel codice di produzione per non installare tracciamenti non necessari. In futuro, prima di attivare ogni strumento, aggiorneremo questa policy e ti chiederemo esplicito consenso tramite il banner, con blocco preventivo del caricamento.</li>
          </Ul>
        </SubSection>

        <SubSection title="1.3 Cookie Marketing (solo su consenso)">
          <P>Cookie di profilazione per attività promozionali, retargeting, campagne pubblicitarie o misurazione conversioni su piattaforme terze.</P>
          <Ul>
            <li>Al momento <strong>nessuno strumento marketing</strong> è caricato su {appName}. Non sono installati Meta Pixel, Google Ads, LinkedIn Insight o simili. Eventuali integrazioni future saranno subordonate alla tua scelta e caricate solo dopo consenso esplicito.</li>
          </Ul>
        </SubSection>
      </Section>

      <Section title="2. Modalità di blocco preventivo">
        <Blockquote>
          <p className="font-bold text-textPrimary leading-snug">
            {appName} implementa un sistema di <strong>blocco preventivo (&ldquo;cookie blocking&rdquo;)</strong>.
          </p>
          <p className="text-textMuted leading-relaxed">
            Fino a quando non esprimi una scelta esplicita sulle preferenze cookie:
          </p>
        </Blockquote>
        <Ul>
          <li>Solo i cookie Necessari sono installati e attivi.</li>
          <li>Nessun script analitico o marketing viene caricato nel browser.</li>
          <li>Nessuna informazione di profilazione transita verso provider terzi.</li>
        </Ul>
      </Section>

      <Section title="3. Gestione delle preferenze">
        <P>Puoi scegliere le categorie desiderate tramite:</P>
        <Ul>
          <li><strong>ACCETTA TUTTI</strong>: consenti Necessari, Analitici e Marketing.</li>
          <li><strong>RIFIUTA NON NECESSARI</strong>: consenti solo Necessari.</li>
          <li><strong>PERSONALIZZA</strong>: pannello con toggle espliciti per ogni categoria non necessaria.</li>
        </Ul>
        <P>La scelta viene salvata nel cookie tecnico <code className="bg-bgSecondary px-1.5 py-0.5 rounded border border-white/10 text-xs">calcettoxp-consent</code> per 12 mesi e può essere modificata in qualsiasi momento dalle posizioni elencate all&apos;inizio di questa policy.</P>
      </Section>

      <Section title="4. Cookie di terze parti">
        <P>Anche senza consenso analitico/marketing, durante l&apos;uso del Servizio alcune tecnologie possono installare cookie o storage necessari per il loro funzionamento:</P>
        <Ul>
          <li>OAuth Google Login: cookie gestiti direttamente da Google per l&apos;autenticazione (non controllati da {appName}). Vedi informativa Google.</li>
          <li>Stripe Checkout e Customer Portal: cookie Stripe durante i flussi di pagamento. Vedi informativa Stripe.</li>
        </Ul>
      </Section>

      <Section title="5. Riferimenti normativi">
        <P>
          La presente policy è ispirata alle Linee guida cookie e strumenti simili del Garante per la Protezione dei Dati Personali (Provv. 10/2020, 30/06/2020) e alle successive novità interpretative.
        </P>
      </Section>

      <Section title="6. Titolare e contatti">
        <Ul>
          <li><strong>Titolare del trattamento:</strong> {ownerName}</li>
          <li><strong>Partita IVA:</strong> {vatId}</li>
          <li><strong>Indirizzo:</strong> {address}</li>
          <li><strong>Email:</strong> <a className="text-greenElectric" href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
        </Ul>
        <P>Per domande sulla Cookie Policy o sulle preferenze di tracciamento, contattaci all&apos;indirizzo email sopra indicato.</P>
      </Section>
    </LegalLayout>
  );
}
