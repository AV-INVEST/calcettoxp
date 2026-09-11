import { Metadata } from 'next';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import { LegalLayout, Section, SubSection, P, Ul, Blockquote, legalMetaBase } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  ...legalMetaBase,
  title: `Disclaimer | ${LEGAL_CONFIG.appName}`,
  description: `Dichiarazioni importanti sulla natura ricreativa delle metriche di ${LEGAL_CONFIG.appName} e la separazione tra Solo Career e dati certificati.`,
};

const { appName, canonicalRoot, territory, contactEmail, lastUpdatedHuman } = LEGAL_CONFIG;

export default function DisclaimerPage() {
  return (
    <LegalLayout
      title="Disclaimer"
      subtitle={`Avvertenze importanti sulla natura ricreativa di ${appName}, sul significato delle metriche e sulla separazione tra dati auto-dichiarati e dati verificati. Ultimo aggiornamento: ${lastUpdatedHuman}.`}
    >
      <Section title="1. Avvertenza generale">
        <Blockquote>
          <p className="text-lg md:text-xl font-black text-textPrimary leading-snug tracking-tight">
            Le statistiche della Solo Career sono inserite direttamente dall&apos;utente.
          </p>
          <p className="text-textMuted leading-relaxed">
            {appName} attualmente gestisce un solo flusso di registrazione: le informazioni sulle partite
            sono compilate dall&apos;Utente e non sono verificate da terzi, arbitri, federazioni o meccanismi di conferma incrociata.
          </p>
        </Blockquote>
      </Section>

      <Section title="2. Cosa rappresentano Career Index, OVR e attributi della carta giocatore">
        <P>
          <strong>Career Index</strong>, <strong>OVR (Overall)</strong> e i sei attributi della carta giocatore (Forma, Impatto, Risultati, Realizzazione, Esperienza, Costanza) sono{' '}
          <em>metriche ricreative</em> create internamente da {appName}. Esse derivano da algoritmi deterministici applicati ai dati auto-dichiarati nella sezione Solo Career, con l&apos;unico obiettivo di rendere la progressione personale più coinvolgente e visualmente appagante.
        </P>
        <P>In nessun caso esse costituiscono:</P>
        <Ul>
          <li>statistiche ufficiali di federazioni sportive, Leghe o associazioni;</li>
          <li>misurazioni certificate o validate;</li>
          <li>valutazioni di scouting professionistico o canali di opportunità professionale;</li>
          <li>valutazioni mediche, atletiche o sanitarie di alcun tipo;</li>
          <li>garanzie di prestazione, capacità calcistica o potenziale sportivo;</li>
          <li>indicatori di ranking competitivo verificato.</li>
        </Ul>
      </Section>

      <Section title="3. Natura attuale del Servizio: Solo Career">
        <SubSection title="3.1 Solo Career">
          <P>Oggi {appName} gestisce un solo flusso di registrazione, denominato <strong>Solo Career</strong>:</P>
          <Ul>
            <li>Partite, risultati, goal, assist, note e ruolo sono inseriti direttamente dall&apos;Utente.</li>
            <li>Non sono previsti controlli terzi, conferme da avversari o arbitri ufficiali.</li>
            <li>Tutti i record personali, trofei, grafici e metriche si basano su questi dati auto-dichiarati.</li>
            <li>Il profilo pubblico mostra solo i dati che l&apos;Utente decide volontariamente di condividere, ma la loro origine resta sempre auto-dichiarata.</li>
          </Ul>
        </SubSection>

        <SubSection title="3.2 Eventuali future modalità multiplayer o di verifica">
          <P>Eventuali future modalità multiplayer o di verifica, se introdotte, saranno disciplinate separatamente e chiaramente distinte dai dati auto-dichiarati della Solo Career. Fino a quel momento tutte le metriche mostrate dal Servizio si riferiscono esclusivamente alla Solo Career auto-dichiarata a scopo ricreativo.</P>
        </SubSection>
      </Section>

      <Section title="4. Limiti di utilizzo">
        <P>L&apos;Utente si impegna a non interpretare o pubblicare alcun dato di {appName} come se fosse:</P>
        <Ul>
          <li>una referenza sportiva ufficiale;</li>
          <li>un requisito per selezioni, prove o colloqui;</li>
          <li>un elemento contrattuale o assicurativo.</li>
        </Ul>
      </Section>

      <Section title="5. Bug, modifiche agli algoritmi e prestazioni">
        <P>Gli algoritmi che calcolano Career Index, XP, OVR e attributi della carta giocatore possono essere aggiornati nel tempo per migliorare l&apos;esperienza o correggere errori. Le modifiche non influiscono sullo storico delle partite registrate, ma possono alterare i valori derivati in modo retroattivo: questo è parte integrante dell&apos;esperienza ricreativa del Servizio e non costituisce un disservizio.</P>
      </Section>

      <Section title="6. La tua responsabilità">
        <P>Sei tu il solo responsabile dei dati che inserisci, della loro veridicità e del loro utilizzo. Registra solo partite che hai realmente giocato e che ricordi in buona fede: la qualità dell&apos;esperienza di {appName} dipende dall&apos;onestà di ciascun giocatore.</P>
      </Section>

      <Section title="7. Contatti">
        <P>Servizio {appName}, operato sotto la giurisdizione italiana ({territory}). Per qualsiasi domanda relativa al presente Disclaimer, contattaci a:</P>
        <Ul>
          <li><strong>Email:</strong> <a className="text-greenElectric" href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
          <li><strong>Sito web:</strong> <a className="text-greenElectric underline" href={canonicalRoot} target="_blank" rel="noreferrer noopener">{canonicalRoot}</a></li>
        </Ul>
        <P>Informazioni complete sul trattamento dei dati personali e sulle condizioni contrattuali sono disponibili rispettivamente nella <a href="/privacy" className="text-greenElectric underline">Privacy Policy</a> e nei <a href="/termini" className="text-greenElectric underline">Termini e condizioni d&apos;uso</a>.</P>
      </Section>
    </LegalLayout>
  );
}
