# Step In Prenumerationsövervakare

## Översikt

Detta projekt övervakar prenumerationer från Step In Back City och skickar e-postaviseringar när ändringar upptäcks. Programmet kontrollerar nya prenumerationer, borttagna prenumerationer och prisändringar.

## 🚀 Körning

Projektet kan köras på två sätt:

### Option 1: GitHub Actions (Rekommenderat)
Kör automatiskt i molnet utan att din dator behöver vara på.

**📖 [Fullständig GitHub Actions Setup Guide →](GITHUB_ACTIONS_SETUP.md)**

**Fördelar:**
- ✅ Kör 24/7 utan att din dator är på
- ✅ Helt gratis
- ✅ Automatisk schemaläggning
- ✅ Fullständig logg-historik

### Option 2: Lokalt med Windows Task Scheduler
Traditionell lösning som kräver att datorn är på.

Se [Lokal Installation](#lokal-installation) nedan.

---

## Funktioner

- **Automatisk övervakning**: Hämtar prenumerationsdata från Step In API
- **Filtrering**: Fokuserar enbart på Step In Back City's prenumerationer (business unit 2612)
- **Ändringsavkänning**: Identifierar nya, borttagna och prisändrade prenumerationer
- **E-postaviseringar**: Skickar detaljerade e-postmeddelanden med ändringar
- **Felhantering**: Skickar felmeddelanden om API-anrop misslyckas
- **Säkerhetsgräns**: Begränsar e-postutskick till 50 per dag för att förhindra överanvändning
- **Prisformatering**: Visar priser korrekt med två decimaler

## Installation

### GitHub Actions (Rekommenderat)

Se vår kompletta [GitHub Actions Setup Guide](GITHUB_ACTIONS_SETUP.md) för steg-för-steg instruktioner.

### Lokal Installation

1. Klona projektet:

   ```
   git clone https://github.com/användare/StepInNotifier.git
   cd StepInNotifier
   ```

2. Installera beroenden:

   ```
   npm install
   ```

3. Konfigurera miljövariabler:

   - Kopiera `.env.example` till en ny fil `.env`:
     ```
     cp .env.example .env
     ```
   - Öppna `.env` och uppdatera värdena med din faktiska konfiguration:

   ```
   # Brevo SMTP credentials
   BREVO_SMTP_USER=din-smtp-användare@smtp-brevo.com
   BREVO_SMTP_PASS=din-smtp-nyckel
   BREVO_SMTP_HOST=smtp-relay.brevo.com

   # Email settings
   EMAIL_FROM=avsändare@exempel.com
   EMAIL_TO=mottagare1@exempel.com,mottagare2@exempel.com

   # Admin email for error notifications
   EMAIL_ADMIN=admin@exempel.com

   # Step In API settings
   STEPIN_API_ENDPOINT=https://stepin.brpsystems.com/brponline/api/ver3/products/subscriptions
   STEPIN_BUSINESS_UNIT_ID=2612
   ```

   > **OBS!** Kommit aldrig `.env`-filen till versionshanteringen. Den innehåller känslig information.

## Konfiguration

Projektet använder följande konfiguration (src/config/config.js):

- **API-endpoint**: Konfigureras via STEPIN_API_ENDPOINT miljövariabel
- **Business Unit**: Konfigureras via STEPIN_BUSINESS_UNIT_ID miljövariabel (standard: 2612)
- **E-postkonfiguration**: SMTP-inställningar konfigureras via miljövariabler
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
├── .github/
│   └── workflows/
│       └── daily-check.yml   # GitHub Actions workflow
├── src/
│   ├── config/
│   │   └── config.js         # Konfigurationsinställningar
│   ├── services/
│   │   ├── emailService.js   # Hanterar e-post
│   │   └── subscriptionService.js # Hanterar prenumerationer
│   ├── storage/
│   │   └── gistStorage.js    # GitHub Gist storage (för GitHub Actions)
│   ├── utils/
│   │   └── logger.js         # Loggfunktionalitet
│   └── index.js              # Huvudskript
├── data/
│   ├── previousData.json     # Lagrar tidigare prenumerationsdata (lokal körning)
│   └── emailStats.json       # Lagrar e-poststatistik (lokal körning)
├── logs/
│   ├── info.log              # Informationsloggar
│   └── error.log             # Felloggar
├── .env                      # Miljövariabler (lokal körning)
├── package.json
├── README.md
└── GITHUB_ACTIONS_SETUP.md   # Setup guide för GitHub Actions
```

## Felhantering

Programmet skickar e-postaviseringar till den konfigurerade administratören (EMAIL_ADMIN) om något går fel med API-anrop. E-postmeddelandet innehåller detaljerad felinformation för felsökning.

## Begränsningar

- Endast prenumerationer från Step In Back City (business unit 2612) övervakas
- Ett email skickas per körning om ändringar upptäcks
