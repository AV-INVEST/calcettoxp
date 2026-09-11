import { Metadata } from 'next';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import { LegalLayout, Section, SubSection, P, Ul, Blockquote, legalMetaBase } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  ...legalMetaBase,
  title: `Termini e condizioni d'uso | ${LEGAL_CONFIG.appName}`,
  description: `Termini e condizioni generali di utilizzo del servizio ${LEGAL_CONFIG.appName}.`,
  robots: {
    index: false,
    follow: true,
  },
};

const { appName, serviceName, ownerName, legalAddress, domain, canonicalRoot, territory, contactEmail, lastUpdatedHuman } = LEGAL_CONFIG;

export default function TermsPage() {
  return (
    <LegalLayout
      title="Termini e condizioni d'uso"
      subtitle={`Condizioni contrattuali che regolano l'uso del servizio ${appName}. Ultimo aggiornamento: ${lastUpdatedHuman}.`}
    >
      <P>I presenti Termini e Condizioni Generali d&apos;Uso ({<em>&ldquo;Termini&rdquo;</em>} ) costituiscono il contratto tra l&apos;Utente (<em>&ldquo;Tu&rdquo;</em>) e il Titolare del servizio ({<em>&ldquo;Noi&rdquo;</em>} ) in relazione all&apos;accesso e all&apos;utilizzo di <strong>{appName}</strong>, tramite il dominio{' '}
        <a className="text-greenElectric underline decoration-dotted" href={`https://${domain}`} target="_blank" rel="noreferrer noopener">
          {domain}
        </a>{' '}
        e di ogni applicazione web, PWA e servizio correlato (collettivamente, il {<em>&ldquo;Servizio&rdquo;</em>}).
      </P>
      <P>L&apos;accesso al Servizio implica l&apos;accettazione integrale dei presenti Termini. Se non accetti, ti invitiamo a non utilizzare il Servizio.</P>

      <Section title="1. Oggetto del servizio">
        <P>{appName} è un servizio web che permette agli Utenti di registrare autonomamente informazioni relative alle partite di calcetto giocate, visualizzare una progressione personale a fini ricreativi (XP, livello, Career Index, carta giocatore, trofei, stagioni) e, opzionalmente, condividere pubblicamente il proprio profilo. Il Servizio include anche una versione PRO a pagamento con funzionalità aggiuntive di analisi, storico e personalizzazione visiva.</P>
        <P>Il Servizio NON è:</P>
        <Ul>
          <li>un prodotto federale ufficiale o uno strumento di valutazione calcistica certificata;</li>
          <li>una piattaforma di scommesse, gioco d&apos;azzardo o sistema predittivo finanziario;</li>
          <li>un servizio medico o una valutazione atletica o sanitaria;</li>
          <li>una federazione sportiva, un&apos;agenzia di scouting o un canale di opportunità professionale;</li>
          <li>una banca di statistiche verificate.</li>
        </Ul>
      </Section>

      <Section title="2. Requisiti di accesso e account">
        <Ul>
          <li>Puoi accedere al Servizio esclusivamente tramite l&apos;autenticazione con account Google.</li>
          <li>Non puoi utilizzare il Servizio se hai meno di 16 anni.</li>
          <li>Sei responsabile della sicurezza del tuo account Google e di ogni attività svolta con il tuo account su {appName}.</li>
          <li>La scelta dell&apos;username pubblico è regolata da specifiche regole (3-20 caratteri minuscoli, lettere/numeri/underscore, nomi riservati, cambio massimo ogni 30 giorni).</li>
          <li>È vietato impersonare altre persone, usare profili offensivi, usurpare identità altrui o usare il Servizio per usi illegittimi o contrari al buon costume.</li>
        </Ul>
      </Section>

      <Section title="3. Modalità Solo Career - Statistiche auto-dichiarate">
        <P>Al momento tutte le partite inserite nel Servizio sono classificate come <strong>Solo Career</strong>: statistiche, risultati, note e ruoli inseriti direttamente dall&apos;Utente, senza verifiche terze o conferme incrociate.</P>
        <P>Accetti espressamente che:</P>
        <Ul>
          <li>Tutte le metriche derivate (XP, OVR, Career Index, attributi, trofei, record, grafici) hanno valore esclusivamente ludico-ricreativo.</li>
          <li>Non possono essere usate come prova ufficiale in contesti agonistici, federali o professionali.</li>
          <li>Non sono certificazioni sportive, valutazioni mediche o atletiche, garanzie di abilità o opportunità professionali.</li>
          <li>Le registrazioni delle partite devono rispettare la finestra temporale prevista dal sistema (attualmente ±72 ore rispetto alla data attuale) e non possono essere inserite nel futuro. Una volta registrate, le partite sono considerate definitive e non modificabili secondo la logica attuale del Servizio.</li>
          <li>Sono applicati automaticamente limiti anti-abuso (attualmente massimo 2 partite registrabili per giorno solare) e controlli anti-duplicazione basati sulla finestra temporale della partita.</li>
          <li>Tali misure sono strumenti di salvaguardia dell&apos;esperienza ricreativa e non costituiscono certificazione di veridicità dei dati.</li>
        </Ul>
      </Section>

      <Section title="4. Abbonamenti PRO (Stripe)">
        <SubSection title="4.1 Piani">
          <P>Le funzionalità PRO includono analytics su periodi 7 / 30 / 90 giorni, statistiche per ruolo, storico completo del Career Index e delle partite, storico completo delle stagioni, record stagionali avanzati, temi Card premium (Night, Elite, Neon), 30 trofei PRO, badge PRO su Card e profilo, cambio username periodico e tracciamento dei progressi dei trofei PRO anche durante il periodo FREE. Tutto il piano FREE è incluso nel PRO.</P>
          <Ul>
            <li><strong>PRO Mensile</strong> &euro;3,90 / mese.</li>
            <li><strong>PRO Annuale</strong> &euro;29,90 / anno.</li>
          </Ul>
          <P>I prezzi indicati includono l&apos;IVA, ove applicabile secondo la normativa fiscale vigente.</P>
        </SubSection>
        <SubSection title="4.2 Pagamenti e rinnovi">
          <P>I pagamenti sono processati da Stripe nella veste di processore di pagamento. Il rinnovo è automatico alla fine del periodo pagato e può essere disattivato in qualsiasi momento tramite il Customer Portal Stripe accessibile da {appName} (Impostazioni &rarr; Abbonamento &rarr; Gestisci abbonamento), senza penali. Le modifiche alla sottoscrizione non sono retroattive.</P>
        </SubSection>
        <SubSection title="4.3 Politica &ldquo;No pay-to-win&rdquo;">
          <P>L&apos;abbonamento PRO non modifica in alcun modo XP, Career Index, OVR, formule di calcolo, risultati delle partite, ranking competitivi futuri o probabilità/prestazioni sportive. PRO offre esclusivamente funzionalità di analisi, consultazione dello storico, personalizzazione della Player Card, contenuti e trofei premium e prestigio visivo.</P>
        </SubSection>
        <SubSection title="4.4 Rimborso e recesso">
          <P>I diritti di recesso, rimborso e gli altri diritti del consumatore si applicano nei casi e secondo le modalità previste dalla normativa vigente. La disattivazione del rinnovo automatico tramite il Customer Portal non equivale di per sé a rimborso per i periodi già goduti, fatti salvi i diritti inderogabili riconosciuti al consumatore. Per richieste puoi scrivere a <a className="text-greenElectric" href={`mailto:${contactEmail}`}>{contactEmail}</a> indicando l&apos;email dell&apos;account.</P>
        </SubSection>
      </Section>

      <Section title="5. Limitazioni di responsabilità">
        <Blockquote accent={false}>
          <p className="font-bold text-textPrimary leading-snug">
            Il Servizio è fornito &ldquo;così com&apos;è&rdquo; ({<em>&ldquo;as is&rdquo;</em>}).
          </p>
          <p className="text-textMuted text-sm leading-relaxed">
            Nella misura massima consentita dalla legge, non garantiamo continuità, accessibilità o disponibilità temporale illimitata del Servizio, né l&apos;accuratezza o l&apos;affidabilità di risultati derivanti da dati auto-dichiarati, né la conformità del Servizio per utilizzi diversi da quelli descritti nei presenti Termini.
          </p>
        </Blockquote>
        <P>Non siamo responsabili per perdite dirette o indirette derivanti da mancati guadagni sportivi, decisioni personali prese basate su metriche ricreative o disservizi di provider terzi (Google, Stripe, Vercel, Neon).</P>
      </Section>

      <Section title="6. Diritti di proprietà intellettuale">
        <P>Tutti i marchi, loghi, testi originali, illustrazioni, algoritmi di progressione e interfacce del Servizio sono di proprietà del Titolare o di terzi che ne hanno concesso licenza. L&apos;Utente riceve una licenza limitata, personale, non trasferibile e non esclusiva per l&apos;utilizzo del Servizio per fini privati e non commerciali.</P>
        <P>È vietata qualsiasi riproduzione, distribuzione o modifica non autorizzata degli elementi del Servizio.</P>
      </Section>

      <Section title="7. Modifiche al Servizio e ai Termini">
        <P>Ci riserviamo il diritto di modificare, sospendere o interrompere parti o l&apos;intero Servizio in qualsiasi momento, inclusi algoritmi di progressione, layout UI e funzionalità. Per modifiche sostanziali ai Termini, sarà data comunicazione agli Utenti tramite email di servizio o avviso in-app.</P>
      </Section>

      <Section title="8. Legge applicabile e foro">
        <P>I presenti Termini sono regolati dalla legge {territory === 'Italia' ? 'italiana' : 'applicabile'}. Per i consumatori restano ferme le disposizioni inderogabili previste dalla normativa applicabile, incluso il foro competente del consumatore ove previsto. Negli altri casi si applicano le regole di competenza previste dalla legge.</P>
      </Section>

      <Section title="9. Dati del gestore e contatti">
        <P>Il servizio {serviceName} è gestito e fornito da:</P>
        <Ul>
          <li><strong>{ownerName}</strong></li>
          <li>{legalAddress.street}</li>
          <li>{legalAddress.zip} {legalAddress.city} ({legalAddress.province})</li>
          <li>{legalAddress.country}</li>
          <li><strong>Email:</strong> <a className="text-greenElectric" href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
          <li><strong>Sito web:</strong> <a className="text-greenElectric underline" href={canonicalRoot} target="_blank" rel="noreferrer noopener">{canonicalRoot}</a></li>
        </Ul>
        <P>Per qualsiasi domanda relativa ai presenti Termini, scrivi all&apos;indirizzo email sopra indicato. Informazioni complete sul trattamento dei dati personali sono disponibili nella <a href="/privacy" className="text-greenElectric underline">Privacy Policy</a>.</P>
      </Section>
    </LegalLayout>
  );
}
