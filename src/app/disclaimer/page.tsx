import { Metadata } from 'next';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import { LegalLayout, Section, SubSection, P, Ul, legalMetaBase } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  ...legalMetaBase,
  title: `Disclaimer | ${LEGAL_CONFIG.appName}`,
  description: `Dichiarazioni importanti sulla natura ricreativa delle metriche di ${LEGAL_CONFIG.appName} e la separazione tra Solo Career e dati certificati.`,
};

const { appName } = LEGAL_CONFIG;

export default function DisclaimerPage() {
  return (
    <LegalLayout
      title="Disclaimer"
      subtitle="Avvertenze importanti sulla natura ricreativa di CalcettoXP, sul significato delle metriche e sulla separazione tra dati auto-dichiarati e dati verificati."
    >
      <Section title="1. Avvertenza generale">
        <blockquote className="border-l-4 border-greenElectric/70 bg-bgSecondary/60 rounded-r-2xl p-4 md:p-5 my-3 space-y-3">
          <p className="text-lg md:text-xl font-bold text-textPrimary leading-snug">
            Le statistiche della Solo Career sono inserite direttamente dall&apos;utente.
          </p>
          <p className="text-textMuted">
            {appName} attualmente gestisce un solo flusso di registrazione: le informazioni sulle partite
            sono compilate dall&apos;Utente e non sono verificate da terzi, arbitri, federazioni o meccanismi di conferma incrociata.
          </p>
        </blockquote>
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
          <li>valutazioni di scouting professionistico;</li>
          <li>garanzie di prestazione, capacità calcistica o potenziale sportivo;</li>
          <li>indicatori di ranking competitivo verificato.</li>
        </Ul>
      </Section>

      <Section title="3. Separazione rigorosa: Solo Career vs Multiplayer verificato">
        <P>L&apos;architettura di {appName} prevede due contesti ben distinti, attivi o in via di sviluppo:</P>

        <SubSection title="3.1 Solo Career (ATTIVO)">
          <P>Modalità in esercizio oggi:</P>
          <Ul>
            <li>Partite, risultati, goal, assist, note e ruolo inseriti direttamente dall&apos;Utente.</li>
            <li>Nessun controllo terzi, nessun avversario conferma, nessun arbitro ufficiale.</li>
            <li>Tutti i record personali, achievement, confronti e grafici si basano su questi dati.</li>
            <li>Il profilo pubblico mostra solo i dati che l&apos;Utente decide volontariamente di condividere (profilo pubblico), ma la loro origine resta sempre auto-dichiarata.</li>
          </Ul>
        </SubSection>

        <SubSection title="3.2 Multiplayer / Ranked / Verificato (FUTURO - NON ATTIVO)">
          <P>È previsto un contesto separato per statistiche certificate tra più giocatori, ancora non implementato. Quando attivo:</P>
          <Ul>
            <li>Saranno necessarie conferme incrociate tra partecipanti (o arbitri designati), gestione delle contestazioni e un sistema di Trust Score.</li>
            <li>Le metriche &ldquo;Ranked&rdquo; saranno calcolate in modo separato e NON erediteranno automaticamente i numeri della Solo Career.</li>
            <li>Le due sezioni saranno chiaramente etichettate nell&apos;interfaccia per evitare equivoci tra dati auto-dichiarati e dati verificati.</li>
          </Ul>
        </SubSection>

        <P className="pt-2">
          Fino a data successiva all&apos;introduzione del multiplayer verificato, ogni numero, grafico, record, medaglia o ranking mostrato da {appName} si riferisce <strong>esclusivamente</strong> alla Solo Career auto-dichiarata.
        </P>
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
    </LegalLayout>
  );
}
