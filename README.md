# 🏋️ StepIn Notifier

> Automated subscription monitoring system with cloud-based scheduling and email notifications

Ett serverless övervakningssystem som automatiskt kollar gymabonnemang från StepIn API och skickar notifieringar vid prisändringar eller nya erbjudanden. Byggd med Node.js och GitHub Actions för 24/7 drift utan lokal infrastruktur.

---

## 🎯 Projektöversikt

StepIn Notifier är ett automatiserat övervakningssystem som:
- 📊 Hämtar och analyserar prenumerationsdata från StepIn API
- 🔍 Upptäcker ändringar i realtid (nya/borttagna prenumerationer, prisändringar)
- 📧 Skickar automatiska e-postaviseringar med strukturerad HTML
- ☁️ Körs serverless via GitHub Actions (ingen egen server behövs)
- 💾 Lagrar state i GitHub Gist för persistent data mellan körningar

**Use case:** Personlig notifieringstjänst för att aldrig missa kampanjer eller prisändringar på gymabonnemang.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 20
- **CI/CD:** GitHub Actions (cron scheduling)
- **Storage:** GitHub Gist API (JSON state persistence)
- **Email:** Brevo/Sendinblue SMTP
- **Hosting:** Serverless (GitHub infrastructure)

### Dependencies
```json
"axios": "^1.6.7",        // HTTP client för API-anrop
"dotenv": "^16.4.7",      // Miljövariabel-hantering
"fs-extra": "^11.2.0",    // Filsystem (lokal utveckling)
"nodemailer": "^6.10.0"   // SMTP email-hantering
```

---

## ✨ Features

### Ändringsdetektering
- ✅ **Nya prenumerationer** - Upptäcker automatiskt nya erbjudanden
- ✅ **Borttagna prenumerationer** - Notifierar när erbjudanden försvinner
- ✅ **Prisändringar** - Spårar och rapporterar prisförändringar

### Automatisering
- ⏰ **Schemalagd körning** - Dagliga automatiska kontroller (kl 08:00)
- 🔄 **State management** - Persistent lagring mellan körningar via Gist
- 📧 **Smart notifiering** - Skickar endast email vid faktiska ändringar

### Felhantering
- 🚨 **API-övervakning** - Automatiska felrapporter vid API-problem
- 📝 **Strukturerad loggning** - Detaljerade loggar för debugging
- 🔒 **Säker konfiguration** - Secrets management via GitHub

## 🚀 Quick Start

### 1. Klona projektet
```bash
git clone https://github.com/Jryolsn/StepInNotifier.git
cd StepInNotifier
npm install
```

### 2. Lokal utveckling
```bash
# Skapa .env-fil med dina credentials
cp .env.example .env

# Kör lokalt
npm start
```

### 3. Production (GitHub Actions)
Projektet körs automatiskt i molnet via GitHub Actions.

📖 **[Fullständig deployment-guide →](GITHUB_ACTIONS_SETUP.md)**

**Setup-översikt:**
1. Pusha kod till GitHub
2. Konfigurera GitHub Secrets (API-nycklar, SMTP-credentials)
3. Aktivera GitHub Actions workflow
4. Systemet körs automatiskt varje dag kl 08:00

---

## 📋 Konfiguration

### Miljövariabler

#### GitHub Secrets (Production)
```yaml
GIST_TOKEN              # GitHub Personal Access Token (gist scope)
GIST_ID                 # Gist ID för state storage
BREVO_SMTP_USER         # SMTP login
BREVO_SMTP_PASS         # SMTP API key
```

#### GitHub Variables (Production)
```yaml
STEPIN_API_ENDPOINT     # StepIn API URL
STEPIN_BUSINESS_UNIT_ID # Business unit filter (2612 = Back City)
EMAIL_FROM              # Avsändaradress
EMAIL_TO                # Mottagare (kommaseparerad för flera)
EMAIL_ADMIN             # Admin email för felrapporter
BREVO_SMTP_HOST         # SMTP server (smtp-relay.brevo.com)
```

#### Lokal utveckling (.env)
```bash
STEPIN_API_ENDPOINT=https://stepin.brpsystems.com/brponline/api/ver3/products/subscriptions
STEPIN_BUSINESS_UNIT_ID=2612
EMAIL_FROM=your@email.com
EMAIL_TO=recipient@email.com
EMAIL_ADMIN=admin@email.com
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_USER=your-smtp-user
BREVO_SMTP_PASS=your-smtp-password
```

---

## 💻 Användning

### Lokal körning
```bash
# Single run
npm start

# Med specifik .env
node src/index.js
```

###📁 Projektstruktur

```
StepInNotifier/
├── .github/workflows/
│   └── daily-check.yml          # GitHub Actions CI/CD workflow
├── src/
│   ├── config/
│   │   └── config.js            # Centraliserad konfiguration
│   ├── services/
│   │   ├── emailService.js      # Email-hantering (Nodemailer)
│   │   └── subscriptionService.js # API-integration & diff-logik
│   ├── storage/
│   │   └── gistStorage.js       # GitHub Gist client (state persistence)
│   ├── utils/
│   │   └── logger.js            # Winston-baserad logging
│   └── index.js                 # Entry point
├── data/                        # Lokal state (dev only)
├── logs/                        # Log-filer (dev only)
├── .env                         # Lokala miljövariabler (gitignored)
├── package.json
├── README.md
└── GITHUB_ACTIONS_SETUP.md      # Deployment-guide
```

---

## 🏗️ Arkitektur

### Dataflöde
```
GitHub Actions (cron trigger)
    ↓
Fetch current data (StepIn API)
    ↓
Load previous data (GitHub Gist)
    ↓
Compare & detect changes
    ↓
Send email notification (if changes)
    ↓
Save current state (GitHub Gist)
```

### State Management
Projektet använder **GitHub Gist** som serverless databas:
- En privat Gist lagrar `previousData.json`
- Uppdateras vid varje körning via GitHub API
- Fungerar som persistent storage mellan workflow-runs

### Email Templates
HTML-baserade email-templates med strukturerad data:
- Nya prenumerationer
- Borttagna prenumerationer
- Prisändringar (före/efter-jämförelse)

---

## 🔒 Säkerhet

- ✅ Secrets hanteras via GitHub Secrets (ingen känslig data i kod)
- ✅ Private Gist för state storage
- ✅ HTTPS för all API-kommunikation
- ✅ `.env` exkluderas från Git

---

## 🚧 Begränsningar & Scope

- Fokuserar på **Step In Back City** (business unit 2612)
- Ett email per körning (sammanfattar alla ändringar)
- Daglig kontroll (kan justeras i workflow-filen)
- Kräver Brevo/Sendinblue för email (gratis tier OK)

---

## 📊 Exempel Email

<details>
<summary>Klicka för att se exempel på notifieringsmail</summary>

```html
Step In Subscription Changes Detected
Generated at: 2026-01-13 08:00:15

New Subscriptions:
• Premium Access 12 months (ID: 12345) - 4999.00 SEK
• Student Pass 6 months (ID: 12346) - 1999.00 SEK

Price Changes:
• Basic Membership (ID: 10001): 399.00 -> 349.00 SEK
```
</details>

---

## 🤝 Bidra

Detta är ett personligt projekt, men förslag är välkomna via Issues!

### Development Setup
```bash
git clone https://github.com/Jryolsn/StepInNotifier.git
cd StepInNotifier
npm install
cp .env.example .env
# Konfigurera .env med dina credentials
npm start
```

---

## 📄 Licens

MIT License - Se [LICENSE](LICENSE) för detaljer.

---

## 👤 Kontakt

**Jerry Ohlson**  
📧 jerry.ohlson@gmail.com  
🔗 [GitHub](https://github.com/Jryolsn)

---

**Built with ❤️ for smarter gym subscription management**

## Felhantering

Programmet skickar e-postaviseringar till den konfigurerade administratören (EMAIL_ADMIN) om något går fel med API-anrop. E-postmeddelandet innehåller detaljerad felinformation för felsökning.

## Begränsningar

- Endast prenumerationer från Step In Back City (business unit 2612) övervakas
- Ett email skickas per körning om ändringar upptäcks
