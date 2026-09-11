import { Metadata } from 'next';
import { LEGAL_CONFIG } from '@/lib/legal-config';
import { LegalLayout, Section, SubSection, P, Ul, Blockquote, legalMetaBase } from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  ...legalMetaBase,
  title: `Privacy Policy | ${LEGAL_CONFIG.appName}`,
  description: `Informativa sulla privacy di ${LEGAL_CONFIG.appName}. Dati raccolti, finalità, diritti dell'interessato e servizi utilizzati.`,
  robots: {
    index: false,
    follow: true,
  },
};

const { appName, serviceName, ownerName, legalAddress, domain, canonicalRoot, territory, contactEmail, privacyContactEmail, lastUpdatedHuman, services } =
  LEGAL_CONFIG;
export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle={`Informativa sul trattamento dei dati personali degli utenti di ${appName}. Ultimo aggiornamento: ${lastUpdatedHuman}.`}
    >
      <P>
        La presente Informativa descrive le modalità di trattamento dei dati personali degli utenti
        ({' '}
        <em>&ldquo;Utenti&rdquo;</em> o <em>&ldquo;Tu&rdquo;</em> ) relative al servizio web{' '}
        <strong>{appName}</strong> accessibile tramite il dominio{' '}
        <a
          className="text-greenElectric underline decoration-dotted"
          href={`https://${domain}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          {domain}
        </a>{' '}
        ({<em>&ldquo;Servizio&rdquo;</em>} ). Il servizio non si rivolge a persone di età inferiore
        ai 16 anni.
      </P>

      <Section title="1. Titolare del trattamento">
        <P>
          <strong>Titolare del trattamento dei dati personali:</strong> {ownerName}.
        </P>
        <P>
          <strong>{serviceName}</strong> è il servizio gestito dal Titolare.
        </P>
        <Ul>
          <li><strong>{ownerName}</strong></li>
          <li>{legalAddress.street}</li>
          <li>{legalAddress.zip} {legalAddress.city} ({legalAddress.province})</li>
          <li>{legalAddress.country}</li>
          <li>Email: <a className="text-greenElectric" href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
          <li>Email privacy: <a className="text-greenElectric" href={`mailto:${privacyContactEmail}`}>{privacyContactEmail}</a></li>
          <li>Sito web: <a className="text-greenElectric underline" href={canonicalRoot} target="_blank" rel="noreferrer noopener">{canonicalRoot}</a></li>
        </Ul>
        <P>
          Il Servizio è operato sotto la giurisdizione italiana ({territory}).
        </P>
      </Section>

      <Section title="2. Tipologie di dati raccolti e finalità">
        <P>I dati personali raccolti all&apos;interno del Servizio sono esclusivamente quelli necessari a garantire il funzionamento delle funzionalità descritte. {appName} non raccoglie dati non dichiarati in questa informativa.</P>

        <SubSection title="2.1 Autenticazione con account Google (Google OAuth)">
          <P>Per accedere al Servizio, l&apos;Utente utilizza esclusivamente l&apos;autenticazione OAuth fornita da Google (servizio: {services.auth.name}, Titolare: {services.auth.provider}).</P>
          <Ul>
            <li>Dati raccolti automaticamente all&apos;atto della prima autenticazione: identificatore interno Google (non pubblicamente esposto), nome visualizzato Google, indirizzo email, eventuale immagine del profilo Google.</li>
            <li>Finalità: autenticare l&apos;Utente, creare l&apos;account personale, associare i dati di carriera all&apos;account e inviare comunicazioni di servizio ove strettamente necessario.</li>
            <li>Base giuridica: esecuzione del contratto e misure precontrattuali (art. 6.1.b GDPR) per la creazione dell&apos;account e la fornitura del Servizio. Il consenso, quando richiesto per specifici trattamenti opzionali, viene raccolto separatamente secondo le modalità previste dalla normativa.</li>
            <li>Informativa Google: <a className="text-greenElectric underline" href={services.auth.privacyUrl} target="_blank" rel="noreferrer noopener">{services.auth.privacyUrl}</a></li>
          </Ul>
        </SubSection>

        <SubSection title="2.2 Dati di carriera &ldquo;Solo Career&rdquo; forniti volontariamente dall&apos;Utente">
          <P>{appName} permette all&apos;Utente di registrare partite, risultati, statistiche e preferenze calcistiche auto-dichiarate.</P>
          <Ul>
            <li>Dati: nickname, citt&agrave;, nazionalit&agrave;, ruolo, piede preferito, data di nascita (utilizzata solo lato server per statistiche demografiche aggregate ove abilitate e mai esposta pubblicamente), statistiche delle partite (es. risultato, goal, assist, ruolo ricoperto, note), username pubblico, preferenze di privacy, tema carta giocatore. L&apos;eventuale foto del profilo associata all&apos;account proviene esclusivamente dall&apos;immagine pubblica fornita da Google durante l&apos;autenticazione. {appName} non offre attualmente una funzionalit&agrave; di upload diretto di file o immagini da parte dell&apos;utente.</li>
            <li>Finalità: visualizzazione della progressione personale (XP, Career Index, OVR, carta giocatore, achievement, stagioni), statistiche avanzate per abbonati PRO, condivisione pubblica facoltativa del profilo tramite username.</li>
            <li>Base giuridica: contratto ed esecuzione del servizio (art. 6.1.b GDPR).</li>
          </Ul>
        </SubSection>

        <SubSection title="2.3 Dati di pagamento (Stripe)">
          <P>Per la gestione degli abbonamenti PRO (mensile e annuale), il Servizio si avvale della piattaforma {services.payments.name} ({services.payments.provider}).</P>
          <Ul>
            <li>{appName} non memorizza numeri di carta o codici CVV. Tutti i dati sensibili di pagamento sono gestiti direttamente da Stripe su server certificati PCI-DSS.</li>
            <li>Dati che transitano e sono conservati nel database applicativo: identificatore cliente Stripe, identificatore sottoscrizione, stato della sottoscrizione (ATTIVA / ANNULLATA / SCADUTA), data fine periodo corrente, identificatore piano tariffario.</li>
            <li>Finalità: attivare, rinnovare, gestire e disattivare l&apos;abbonamento PRO; bloccare l&apos;addebito al momento della cancellazione dell&apos;account.</li>
            <li>Base giuridica: contratto (art. 6.1.b GDPR).</li>
            <li>Informativa Stripe: <a className="text-greenElectric underline" href={services.payments.privacyUrl} target="_blank" rel="noreferrer noopener">{services.payments.privacyUrl}</a></li>
          </Ul>
        </SubSection>

        <SubSection title="2.4 Database e infrastruttura (Neon PostgreSQL, Vercel Hosting)">
          <P>I dati dell&apos;Utente sono memorizzati e gestiti tramite infrastrutture di terze parti conformi:</P>
          <Ul>
            <li><strong>{services.database.name}</strong> ({services.database.provider}): database relazionale principale per account, partite e preferenze.</li>
            <li><strong>{services.hosting.name}</strong> ({services.hosting.provider}): hosting dell&apos;applicazione web, rendering lato server e funzioni serverless.</li>
            <li>Base giuridica: contratto (art. 6.1.b GDPR) e interesse legittimo alla sicurezza e stabilità del Servizio (art. 6.1.f GDPR).</li>
            <li>Informativa Neon: <a className="text-greenElectric underline" href={services.database.privacyUrl} target="_blank" rel="noreferrer noopener">{services.database.privacyUrl}</a></li>
            <li>Informativa Vercel: <a className="text-greenElectric underline" href={services.hosting.privacyUrl} target="_blank" rel="noreferrer noopener">{services.hosting.privacyUrl}</a></li>
          </Ul>
        </SubSection>

        <SubSection title="2.5 Referral e condivisioni social (referralCode, ShareRecord)">
          <P>{appName} offre funzionalit&agrave; di invito (referral) e condivisione della Player Card. Per il loro funzionamento possono essere trattati i seguenti dati tecnici:</P>
          <Ul>
            <li><strong>referralCode</strong>: codice identificativo univoco associato al profilo dell&apos;utente per gli inviti.</li>
            <li><strong>Relazione di attribuzione</strong>: collegamento tra l&apos;account di chi invita (invitante) e l&apos;eventuale nuovo account che completa l&apos;onboarding tramite codice o link di invito.</li>
            <li><strong>Cookie tecnico `cxp_ref`</strong>: conserva l&apos;attribuzione referral per circa 60 giorni, salvo cancellazione manuale da parte dell&apos;utente.</li>
            <li><strong>ShareRecord</strong>: tracciamento dell&apos;evento di condivisione valido e del giorno solare in cui avviene, ai fini di meccanismi anti-farming (max 1 condivisione valida per giorno). Pu&ograve; essere memorizzata anche l&apos;eventuale sorgente tecnica della condivisione (es. voce del menu).</li>
            <li>{appName} <strong>non conosce n&eacute; registra</strong> il contenuto privato del messaggio condiviso dall&apos;utente, n&eacute; il gruppo o la persona WhatsApp/Social a cui la Card viene inoltrata. L&apos;utente sceglie autonomamente canale e destinatario.</li>
            <li>Base giuridica: interesse legittimo al funzionamento tecnico corretto dei sistemi di invito e alla prevenzione di abusi (art. 6.1.f GDPR), oltre all&apos;esecuzione del servizio (art. 6.1.b GDPR).</li>
          </Ul>
        </SubSection>

        <SubSection title="2.6 Cookie e preferenze">
          <P>Vedi sezione specifica <a href="/cookie-policy" className="text-greenElectric underline">Cookie Policy</a> e la pagina <a href="/settings" className="text-greenElectric underline">Impostazioni</a> per modificare le preferenze in qualsiasi momento.</P>
        </SubSection>

        <SubSection title="2.7 Dati di log e sicurezza">
          <P>{services.hosting.provider} ({services.hosting.name}) e {services.database.provider} ({services.database.name}) possono raccogliere log tecnici (indirizzo IP anonimizzato ove possibile, tipo di browser, orario della richiesta) per motivi di sicurezza, anti-abuso e stabilità della piattaforma. Tali log sono trattati come strettamente necessari, con conservazione limitata nel tempo e non incrociati con dati personali degli Utenti salvo ove obbligatorio per legge o contrasto frodi.</P>
        </SubSection>
      </Section>

      <Section title="3. Conservazione dei dati">
        <Ul>
          <li>Account e dati di carriera: conservati per tutta la durata del rapporto contrattuale e successivamente cancellati o anonimizzati entro termini ragionevoli dopo la richiesta di cancellazione da parte dell&apos;Utente.</li>
          <li>Dati di pagamento e fatturazione: conservati secondo i termini richiesti dalle normative fiscali e civili applicabili (generalmente 10 anni).</li>
          <li>Log di sicurezza: conservati per periodi brevi, orientativamente tra i 7 e i 90 giorni, salvo obblighi di legge.</li>
        </Ul>
      </Section>

      <Section title="4. Luogo di trattamento e trasferimenti extra UE">
        <P>Alcuni dei fornitori utilizzati da {appName} possono operare in paesi extra UE (Stati Uniti). In ogni caso:</P>
        <Ul>
          <li>{services.payments.provider}, {services.hosting.provider}, {services.auth.provider} operano clausole contrattuali standard (SCC) e/o meccanismi certificati di trasferimento dati conformi al GDPR.</li>
          <li>Database principale Neon è ospitato su infrastruttura conforme GDPR; per dettagli consultare: <a className="text-greenElectric underline" href={services.database.privacyUrl} target="_blank" rel="noreferrer noopener">{services.database.privacyUrl}</a>.</li>
        </Ul>
      </Section>

      <Section title="5. Profili pubblici e dati condivisi volontariamente">
        <P>{appName} permette di impostare il proprio profilo come <strong>pubblico</strong> o <strong>privato</strong> (sezione <a href="/settings" className="text-greenElectric underline">Impostazioni &rarr; Profilo</a>).</P>
        <Ul>
          <li>Se il profilo è <em>pubblico</em>, informazioni quali nickname, username, citt&agrave; (se abilitata), nazionalit&agrave;, ruolo, piede preferito, carta giocatore, OVR, livello, Career Index, numero di partite, vittorie, goal, assist, tasso di vittorie, achievement sbloccati, stagione corrente e l&apos;andamento recente del Career Index sono accessibili a chiunque tramite l&apos;URL pubblico /p/nomeutente (dove nomeutente corrisponde al proprio username), anche senza account.</li>
          <li>Le informazioni sensibili (email, data di nascita esatta, identificativi Google, identificativi Stripe, preferenze private) non sono mai esposte nei profili pubblici.</li>
          <li>L&apos;Utente può rendere il profilo privato in qualsiasi momento: la modifica applica immediatamente il blocco lato server.</li>
        </Ul>
      </Section>

      <Section title="6. Statistiche auto-dichiarate">
        <P>{appName} distingue nettamente due contesti:</P>
        <Ul>
          <li><strong>Solo Career</strong>: partite e statistiche inserite direttamente dall&apos;Utente e non verificate da terzi.</li>
          <li><strong>Multiplayer / Verificato</strong>: modalit&agrave; future, ancora non attive, per statistiche certificate tra giocatori.</li>
        </Ul>
        <P>Fino all&apos;attivazione delle funzioni multiplayer verificate, tutte le metriche mostrate (Career Index, OVR, attributi carta giocatore, record personali, achievement) derivano da dati auto-dichiarati a scopo ricreativo e non costituiscono in alcun modo valutazioni ufficiali, certificazioni o garanzie di prestazione calcistica.</P>
      </Section>

      <Section title="7. Diritti dell&apos;interessato">
        <Blockquote accent={false}>
          <p className="font-bold text-textPrimary leading-snug">
            L&apos;Utente può esercitare in qualsiasi momento i propri diritti ai sensi degli artt. 15-22 GDPR.
          </p>
          <p className="text-textMuted text-sm">
            Tra cui: diritto di accesso, rettifica, cancellazione (&ldquo;diritto all&apos;oblio&rdquo;), limitazione del trattamento, opposizione e portabilità dei dati. È inoltre garantito il diritto di revocare il consenso in qualsiasi momento (senza pregiudicare la liceità del trattamento basata sul consenso prima della revoca) e il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali.
          </p>
        </Blockquote>

        <SubSection title="7.1 Diritto di accesso e portabilità">
          <Ul>
            <li>Scarica una copia dei tuoi dati: vai su <a href="/settings" className="text-greenElectric underline">Impostazioni &rarr; Dati &rarr; Scarica i miei dati</a>.</li>
            <li>Il file JSON scaricabile include: profilo, partite, storico Career Index, stagioni, achievement e preferenze.</li>
          </Ul>
        </SubSection>

        <SubSection title="7.2 Diritto di cancellazione (oblio)">
          <Ul>
            <li>Cancella definitivamente il tuo account: vai su <a href="/settings" className="text-greenElectric underline">Impostazioni &rarr; Dati &rarr; Elimina account</a>.</li>
            <li>Prima della cancellazione definitiva, il sistema annulla automaticamente eventuali abbonamenti Stripe attivi per evitare addebiti successivi.</li>
          </Ul>
        </SubSection>

        <SubSection title="7.3 Rettifica e richieste particolari">
          <P>Per richieste specifiche (modifica manuale di dati, reclami formali, accesso dati formale, limitazione del trattamento) scrivi a:</P>
          <Ul>
            <li>Email privacy: <a className="text-greenElectric" href={`mailto:${privacyContactEmail}`}>{privacyContactEmail}</a></li>
            <li>Email generale: <a className="text-greenElectric" href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
          </Ul>
        </SubSection>

        <SubSection title="7.4 Reclamo all&apos;autorità di controllo">
          <P>Se l&apos;Utente ritiene che il trattamento dei propri dati violi il GDPR, ha sempre il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (Autorità Garante) secondo le modalità indicate sul sito ufficiale.</P>
        </SubSection>
      </Section>

      <Section title="8. Modifiche alla presente informativa">
        <P>Il Titolare si riserva il diritto di modificare la presente Privacy Policy in qualsiasi momento, dandone comunicazione agli Utenti tramite avviso nell&apos;app o email di servizio per modifiche rilevanti. Ogni versione è identificata dalla data di ultimo aggiornamento indicata in testa a questa pagina.</P>
      </Section>
    </LegalLayout>
  );
}
