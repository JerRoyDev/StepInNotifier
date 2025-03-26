# Step In Prenumerationsövervakare

## Översikt

Detta projekt övervakar prenumerationer från Step In Back City och skickar e-postaviseringar när ändringar upptäcks. Programmet kontrollerar nya prenumerationer, borttagna prenumerationer och prisändringar.

## Funktioner

- **Automatisk övervakning**: Hämtar prenumerationsdata från Step In API
- **Filtrering**: Fokuserar enbart på Step In Back City's prenumerationer (business unit 2612)
- **Ändringsavkänning**: Identifierar nya, borttagna och prisändrade prenumerationer
- **E-postaviseringar**: Skickar detaljerade e-postmeddelanden med ändringar
- **Felhantering**: Skickar felmeddelanden om API-anrop misslyckas
- **Säkerhetsgräns**: Begränsar e-postutskick till 50 per dag för att förhindra överanvändning
- **Prisformatering**: Visar priser korrekt med två decimaler

## Installation

1. Klona projektet:

   ```
   git clone https://github.com/användare/StepInNotifier.git
   cd StepInNotifier
   ```

2. Installera beroenden:

   ```
   npm install
   ```

3. Konfigurera miljövariabler genom att skapa en `.env`-fil:

   ```
   # Brevo SMTP credentials
   BREVO_SMTP_USER=din-smtp-användare@smtp-brevo.com
   BREVO_SMTP_PASS=din-smtp-nyckel

   # Email settings
   EMAIL_FROM=avsändare@exempel.com
   EMAIL_TO=mottagare1@exempel.com,mottagare2@exempel.com

   # Admin email for error notifications
   EMAIL_ADMIN=admin@exempel.com
   ```

## Konfiguration

Projektet använder följande konfiguration (src/config/config.js):

- **API-endpoint**: Konfiguration för Step In API
- **Query-parametrar**: Filtreringsparametrar för API-anrop
- **E-postkonfiguration**: SMTP-inställningar för Brevo
- **Datalagringsplatser**: Var prenumerationsdata och statistik sparas

## Användning

### Manuell körning

```
node src/index.js
```

### Schemalagd körning (rekommenderat)

Projektet är designat för att köras med Windows Task Scheduler:

1. Öppna "Task Scheduler" och skapa en ny uppgift
2. Namnge uppgiften (t.ex. "Step In Prenumerationsövervakning")
3. Välj ett schema (Dagligt/Veckovis)
4. Ställ in åtgärd:
   - Program/skript: `C:\Program Files\nodejs\node.exe` (sökväg till din Node.js installation)
   - Argument: `path\to\your\project\src\index.js` (path to index.js)
   - Starta i: `path\to\your\project\` (projektmappen)

## Projektstruktur

```
StepInNotifier/
├── src/
│   ├── config/
│   │   └── config.js         # Konfigurationsinställningar
│   ├── services/
│   │   ├── emailService.js   # Hanterar e-post
│   │   ├── emailStats.js     # Håller koll på e-poststatistik
│   │   └── subscriptionService.js # Hanterar prenumerationer
│   ├── utils/
│   │   └── logger.js         # Loggfunktionalitet
│   └── index.js              # Huvudskript
├── data/
│   ├── previousData.json     # Lagrar tidigare prenumerationsdata
│   └── emailStats.json       # Lagrar e-poststatistik
├── logs/
│   ├── info.log              # Informationsloggar
│   └── error.log             # Felloggar
├── .env                      # Miljövariabler
├── package.json
└── README.md
```

## Felhantering

Programmet skickar e-postaviseringar till den konfigurerade administratören (EMAIL_ADMIN) om något går fel med API-anrop. E-postmeddelandet innehåller detaljerad felinformation för felsökning.

## Begränsningar

- Programmet har en gräns på 50 e-postmeddelanden per dag för att skydda mot överanvändning
- Endast prenumerationer från Step In Back City (business unit 2612) övervakas
