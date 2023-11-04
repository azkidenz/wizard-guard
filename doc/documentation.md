##1 Introduzione
WizardGuard è un servizio multipiattaforma per la conservazione sicura e relativa gestione di login (usernamame, password e MFA), carte di pagamento e note sicure.

Il focus principale del progetto è cercare di garantire un buon livello di sicurezza all'utente finale, per farlo ci siamo basati sul sistema di crittografia end-to-end utilizzato da Bitwarden Inc., il più celebre password mananger open source[1 Paper Bitwarden].

Le tecnologie utilizzate sono: Node.js per il backend, HTML5, CSS e Javascript per il frontend, MongoDB per la persistenza dei dati e Apache Cordova per l'applicazione Android.

### 1.1 Breve analisi dei requisiti

####1.1.1 Destinatari
Il target di riferimento è rappresentato da chiunque abbia la necessità di organizzare le proprie credenziali di accesso in maniera sicura, centralizzata e accessibile, pertanto la forbice d'età risulta molto ampia, non essendo richieste competenze tecniche avanzate.

L'attuale modello implementativo non si rivolge all'ambito aziendale, in cui è richiesta una gestione gerarchica degli utenti e la possibile condivisione (con regole e vincoli) delle credenziali immagazzinate.

Per facilitare l'esperienza d'uso degli utenti, le funzionalità sono espresse con una interfaccia visiva intuitiva, corredata da messaggi di testo guidati e indicazioni d'uso. Inoltre vi è stata una scelta mirata nei colori e nelle regole d'uso degli stessi (es. bottoni di conferma, eliminazione) per garantire coerenza ed evitare confusione.

####1.1.2 Motivazione

Le motivazioni che possono spingere un utente ad utilizzare l’applicazione possono essere molteplici:

* **organizzative**: considerando la quantità di credenziali che oggi anche un utente base deve avere, l'organizzazione in maniera puntuale e centralizzata nonché accessibile da dispositivi differenti;
* **sicurezza informatica**: un utente con una spiccata sensibilità per la sicurezza online e l'importanza di una corretta gestione delle credenziali personali;
* **psicologiche**: la consapevolezza di demandare la scelta (rispettando i requsiti richiesti) e la conservazione delle password ad un applicativo crittografato e sicuro rende l'utente più tranquillo nell'approcciarsi al web.

Il livello di motivazione è attivo, in quanto l'uso di tale applicazione è dettato da un'esigenza/volontà dell'utente.

Rifacendoci al modello di Bates identifichiamo una tipologia di ricerca mirata delle informazioni (attiva e diretta).

####1.1.3 Modello di valore

L’applicazione e i servizi ad essa collegati sono erogati in modalità gratuita agli utenti.

Diversi modelli di business potranno essere supportati in futuro:

* **Freemium (ambito utente privato)**: l'applicativo potrà prevedere l'introduzione di piani d'uso (uno gratuito e uno a pagamento) con funzionalità differenti. In particolare introducendo, nel piano gratuito, limiti nelle credenziali salvabili nella cassaforte digitale, superati nel piano a pagamento. In più si prevede l'esclusività di alcune funzionalità per il solo piano a pagamento (es. report peridici di verifica di credenziali e carte di pagamento compromesse, condivisione sicura degli elementi ed importazione/esportazione della propria cassaforte);
* **Affiliazione (ambito utente privato)**: l'utente di qualsiasi piano avrà la possibilità di condividere un link di affiliazione personale che potrà essere utilizzato da nuovi utenti in fase di registrazione. Nel caso in cui venga sottoscritto il piano a pagamento tramite il link di affiliazione, entrambi gli utenti coinvolti riceveranno dei benefit. L'utente affiliante con piano gratuito riceve la possibilità di fare l'upgrade al piano a pagamento per un periodo limitato di tempo. L'utente affiliante con piano a pagamento e l'utente affiliato, ricevono uno sconto sul rinnovo del piano;
* **Sottoscrizione (ambito aziendale)**: si prevede l'implementazione delle funzionalità richieste in ambito aziendale (gestione gerarchica degli utenti e la possibile condivisione, con regole e vincoli, delle credenziali immagazzinate) sottoscrivibili tramite vari piani a pagamento dipendenti dal numero di utenti amministrati.

###1.2 Flusso dei dati

Il flusso dei dati risulta generato dagli utenti che ne hanno completa autonomia nella gestione. Per garantire l'accesso da più dispositivi, i dati dell'utente vengono archiviati in modo criptato e inaccessibile se non dall'utente stesso in un database.
Considerato il modello di lavoro dell'applicativo, il valore dello stesso è fatto dal numero di utenti attivi, rispetto ai dati a loro collegati.

Sui dati verranno applicati i concetti di privacy e security by design (solo le informazioni necessarie verranno salvate sul database) e by default (ogni utente ha accesso alle sole informazioni da lui inserite).

###1.3 Aspetti tecnologici

L'applicativo si compone di 3 componenti principali:

* **frontend**: l'interfaccia, condivisa tra sito web, estensione per il browser e applicazione mobile, è scritta in HTML5 e CSS3 con l'ausilio del framework Bootstrap. La logica applicativa è sviluppata in Javascript mediante l'utilizzo di jQuery. 
(A)


* **backend**: le REST API sono sviluppate da un server NodeJS con framework Express. Le API permettono la gestione degli utenti, delle sessioni ad essi associate e della cassaforte personale mediante la messa a disposizione di una serie di endpoint di chiamata. Per gestire le interazioni con il database si fa uso del framework mongoose.
* **database**: database NoSQL MongoDB per l'archiviazione persistente dei dati degli utenti.

###1.4 Infrastruttura

Si descrivono le scelte infrastrutturali messe in opera per la pubbicazione dell'applicativo.

Per ricondurre il progetto ad un prodotto reale abbiamo registrato un dominio (wizardguard.org) così da rendere accessibile il client web. 

Per il frontend web si è provveduto a sfruttare il servizio cloud Render, che mette a disposizione in maniera gratuita la pubblicazione di uno static site tramite un server http NodeJs. Tramite le impostazioni messe a disposizione ds Render si è provveduto a configurare, tramite specifici record DNS, la base uri del dominio di progetto.

Simile soluzione è stata adottata per il backend, il quale è stato reso accessibile su un dominio di terzo livello dedicato (api.wizardguard.com).

Il database è stato pubblicato sul servizio DBaaS Atlas offerto da MongoDB Inc. e risulta accessibile tramite uno specifico indirizzo di host e credenziali di accesso (username e password).

Il codice di frontend e backend è pubblicato su due differenti e dedicati repository Git, ospitati su GitHub, da cui Render acquisisce automaticamente i sorgenti da pubblicare. 

Per l'invio delle mail agli utenti è stato configurato opportunamente un account Zoho, che offre un server SMTP gratuito, associabile al proprio dominio.

###1.5 Funzionamento del sistema di cifratura (A)


##2 Interfacce (A)
(Form di accesso)

(Form di registrazione)

(Cassaforte bloccata)

(Vault lista)

(Generatore password)

(Sessioni)

(Modal creazione password)

(Profilo utente)


##3 Architettura

###3.1 Diagramma dell'ordine gerarchico delle risorse - frontend (A)

###3.2 Diagrammi di flusso - backend (M)

###3.3 Descrizione delle risorse - backend (A M)

###3.4 Autenticazione (M)

###3.5 Database e modelli (M)

###3.6 Diagramma di flusso applicativo mobile (A)

###3.7 Diagramma di flusso estensione web (M)

##4 Codice

###4.1 Struttura del progetto
####4.1.1 Frontend (A)
####4.1.2 Backend (M)
###4.2 Backend (M)
###4.3 Frontend (A)

#5 Conclusione

#6 Bibliografia







