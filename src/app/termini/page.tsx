import { Metadata } from 'next';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import { LegalLayout, Section, SubSection, P, Ul, legalMetaBase } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  ...legalMetaBase,
  title: `Termini e condizioni d'uso | ${LEGAL_CONFIG.appName}`,
  description: `Termini e condizioni generali di utilizzo del servizio ${LEGAL_CONFIG.appName}.`,
};

const { appName, domain, lastUpdatedHuman, ownerName, contactEmail } = LEGAL_CONFIG;

export default function TermsPage() {
  return (
    <LegalLayout
      title="Termini e condizioni d'uso"
      subtitle={`Condizioni contrattuali che regolano l'uso del servizio ${appName}. Ultimo aggiornamento: ${lastUpdatedHuman}.`}
    >
      <P>I presenti Termini e Condizioni Generali d&apos;Uso ({<em>&ldquo;Termini&rdquo;</em>} ) costituiscono il contratto tra l&apos;Utente (<em>&ldquo;Tu&rdquo;</em>) e il Titolare del servizio (<strong>{ownerName}</strong>, {<em>&ldquo;Noi&rdquo;</em>} ) in relazione all&apos;accesso e all&apos;utilizzo di <strong>{appName}</strong>, tramite il dominio{' '}
        <a className="text-greenElectric underline decoration-dotted" href={`https://${domain}`} target="_blank" rel="noreferrer noopener">
          {domain}
        </a>{' '}
        e di ogni applicazione web, PWA e servizio correlato (collettivamente, il {<em>&ldquo;Servizio&rdquo;</em>}).
      </P>
      <P>L&apos;accesso al Servizio implica l&apos;accettazione integrale dei presenti Termini. Se non accetti, ti invitiamo a non utilizzare il Servizio.</P>

      <Section title="1. Oggetto del servizio">
        <P>{appName} è un servizio web che permette agli Utenti di registrare autonomamente informazioni relative alle partite di calcetto giocate, visualizzare una progressione personale a fini ricreativi (XP, livello, Career Index, carta giocatore, achievement, stagioni) e, opzionalmente, condividere pubblicamente il proprio profilo. Il Servizio include anche una versione PRO a pagamento con funzionalità aggiuntive di analisi e personalizzazione visiva.</P>
        <P>Il Servizio NON è:</P>
        <Ul>
          <li>un prodotto federale ufficiale;</li>
          <li>uno strumento di valutazione calcistica certificata;</li>
          <li>un sistema di scommesse, gioco d&apos;azzardo o predittivo;</li>
          <li>una banca di statistiche verificare professionalmente fino a quando non saranno attive le funzionalità multiplayer certificate.</li>
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
          <li>Tutte le metriche derivate (XP, OVR, Career Index, attributi, achievement, record, grafici) hanno valore esclusivamente ludico-ricreativo;</li>
          <li>Non possono essere usate come prova ufficiale in contesti agonistici, federali o professionali;</li>
          <li>Il blocco di modifica dopo 15 minuti dalla registrazione e il limite di 3 partite giornaliere sono misure anti-manomissione a tutela dell&apos;esperienza ricreativa e non costituiscono una certificazione dei dati.</li>
        </Ul>
      </Section>

      <Section title="4. Abbonamenti PRO (Stripe)">
        <SubSection title="4.1 Piani">
          <P>Le funzionalità avanzate (statistiche avanzate, analisi 7/30/90 giorni, grafici estesi, record personali avanzati, confronti stagionali, insight di forma avanzati, personalizzazioni carta giocatore premium, achievement PRO) sono accessibili tramite abbonamento:</P>
          <Ul>
            <li><strong>PRO Mensile</strong> &euro;3,90 / mese, IVA inclusa ove applicabile.</li>
            <li><strong>PRO Annuale</strong> &euro;29,90 / anno, IVA inclusa ove applicabile.</li>
          </Ul>
        </SubSection>
        <SubSection title="4.2 Pagamenti e rinnovi">
          <P>I pagamenti sono processati da Stripe. Il rinnovo è automatico alla fine del periodo. Puoi annullare il rinnovo dal pannello Stripe accessibile tramite {appName} (Impostazioni &rarr; Abbonamento &rarr; Gestisci abbonamento). Le modifiche non sono retroattive.</P>
        </SubSection>
        <SubSection title="4.3 Politica &ldquo;No pay-to-win&rdquo;">
          <P>L&apos;abbonamento PRO non influisce in alcun modo su XP, OVR, Career Index, posizioni in classifiche future, risultati di partita o probabilità di sbloccare achievement. PRO concede solo funzionalità di analisi e personalizzazione visuale.</P>
        </SubSection>
        <SubSection title="4.4 Rimborso">
          <P>Eventuali richieste di rimborso sono valutate caso per caso secondo la normativa applicabile e le regole di Stripe. Scrivi a {contactEmail} indicando l&apos;email dell&apos;account e l&apos;importo pagato.</P>
        </SubSection>
      </Section>

      <Section title="5. Limitazioni di responsabilità">
        <P>Il Servizio è fornito &ldquo;così com&apos;è&rdquo; ({<em>&ldquo;as is&rdquo;</em>}). Nella misura massima consentita dalla legge, non garantiamo:</P>
        <Ul>
          <li>continuità, accessibilità o disponibilità temporale illimitata del Servizio;</li>
          <li>accuratezza o affidabilità di risultati derivanti da dati auto-dichiarati;</li>
          <li>conformità del Servizio per utilizzi diversi da quelli descritti nei presenti Termini.</li>
        </Ul>
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
        <P>I presenti Termini sono regolati dalla legge italiana. Per ogni controversia relativa all&apos;interpretazione, esecuzione o violazione dei presenti Termini è competente in via esclusiva il Foro del luogo ove ha sede il Titolare, salvo diverse disposizioni inderogabili di legge.</P>
      </Section>

      <Section title="9. Contatti">
        <P>Per qualsiasi domanda relativa ai presenti Termini, scrivi a: <a className="text-greenElectric" href={`mailto:${contactEmail}`}>{contactEmail}</a>.</P>
      </Section>
    </LegalLayout>
  );
}
