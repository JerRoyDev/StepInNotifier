# 🚀 GitHub Actions Setup Guide

## Översikt

Denna guide visar hur du sätter upp StepInNotifier att köras automatiskt i GitHub Actions istället för på din lokala dator.

## 📋 Steg-för-Steg Installation

### 1️⃣ Skapa GitHub Repository

Om du inte redan har ett:

1. Gå till [github.com/new](https://github.com/new)
2. Skapa ett nytt **privat** repository (viktigt för att skydda dina secrets!)
3. Namnge det t.ex. "StepInNotifier"
4. **Checka INTE i** "Add README" eller ".gitignore" (vi har redan dessa)

### 2️⃣ Skapa GitHub Personal Access Token (för Gist)

Detta token används för att spara/läsa data från en privat Gist.

1. Gå till: https://github.com/settings/tokens
2. Klicka på **"Generate new token"** → **"Generate new token (classic)"**
3. Ge den ett namn: `StepInNotifier Gist Access`
4. Välj **endast** dessa scopes:
   - ✅ `gist` (Create and modify gists)
5. Sätt expiration till **"No expiration"** (eller 1 år om du föredrar)
6. Klicka **"Generate token"**
7. **KOPIERA TOKENET DIREKT** (du ser det bara en gång!)
   - Det ser ut något såhär: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3️⃣ Pusha Koden till GitHub

Kör dessa kommandon i din projektmapp:

```bash
# Initiera git (om du inte redan gjort det)
git init

# Lägg till remote (byt ut 'dittanvändarnamn' mot ditt GitHub-användarnamn)
git remote add origin https://github.com/dittanvändarnamn/StepInNotifier.git

# Skapa .gitignore om den inte finns
echo "node_modules/
.env
logs/
data/
*.log" > .gitignore

# Commit och pusha
git add .
git commit -m "Initial commit - GitHub Actions setup"
git branch -M main
git push -u origin main
```

### 4️⃣ Konfigurera GitHub Secrets

Nu måste du lägga till dina hemliga nycklar i GitHub:

1. Gå till ditt repository på GitHub
2. Klicka på **Settings** → **Secrets and variables** → **Actions**
3. Klicka på **"New repository secret"** för var och en av dessa:

#### Obligatoriska Secrets:

| Secret Name | Värde | Beskrivning |
|------------|-------|-------------|
| `GIST_TOKEN` | `ghp_xxx...` | Personal Access Token från steg 2 |
| `GIST_ID` | *Lämna tom först* | Skapas automatiskt vid första körningen |
| `STEPIN_API_ENDPOINT` | Din API URL | StepIn API endpoint |
| `STEPIN_BUSINESS_UNIT_ID` | `2612` | Step In Backcity ID |
| `EMAIL_FROM` | Din avsändar-email | T.ex. notifications@dindomain.se |
| `EMAIL_TO` | Din email | Där du vill ta emot notifieringar |
| `EMAIL_ADMIN` | Din email | För felmeddelanden |
| `BREVO_SMTP_HOST` | `smtp-relay.brevo.com` | Brevo SMTP host |
| `BREVO_SMTP_USER` | Din Brevo login | Från Brevo dashboard |
| `BREVO_SMTP_PASS` | Din Brevo API key | Från Brevo dashboard |

**Tips:** Du kan kopiera värdena från din befintliga `.env`-fil!

### 5️⃣ Första Körningen (Generera GIST_ID)

Eftersom vi inte har ett `GIST_ID` än kommer första körningen att skapa en Gist automatiskt.

1. Gå till ditt repo på GitHub
2. Klicka på **Actions**-fliken
3. Välj **"Daily StepIn Check"** workflow
4. Klicka på **"Run workflow"** → **"Run workflow"** (grön knapp)
5. Vänta 30-60 sekunder
6. Klicka på workflow-körningen och expandera **"Run StepIn check"**
7. I loggen ser du: `⚠️ Gist created successfully! GIST_ID: xxxxxxxxxxxxx`
8. **KOPIERA DETTA GIST_ID**

Nu måste du lägga till GIST_ID:

1. Gå tillbaka till **Settings** → **Secrets** → **Actions**
2. Lägg till en ny secret:
   - Name: `GIST_ID`
   - Value: `xxxxxxxxxxxxx` (det ID du kopierade)

### 6️⃣ Testa att det Fungerar

Kör workflow igen manuellt:

1. **Actions** → **Daily StepIn Check** → **Run workflow**
2. Vänta på att den blir klar (bör ta ~10-30 sekunder)
3. ✅ Om allt är grönt - **SUCCESS!**
4. ❌ Om något är rött - kolla loggarna för felmeddelanden

### 7️⃣ Verifiera Gist

Du kan se din sparade data:

1. Gå till https://gist.github.com/
2. Du bör se en privat Gist: **"StepInNotifier Data Storage"**
3. Den innehåller:
   - `previousData.json` - Gym-erbjudanden från föregående körning

## ⏰ Schema

Workflow:en körs automatiskt **varje dag kl 08:00** (svensk tid, vintertid).

### Ändra Körtid

Om du vill ändra tiden, redigera [.github/workflows/daily-check.yml](.github/workflows/daily-check.yml):

```yaml
schedule:
  - cron: '0 7 * * *'  # Format: 'minut timme * * *' (UTC)
```

Exempel:
- `0 6 * * *` = 07:00 svensk tid (06:00 UTC)
- `0 12 * * *` = 13:00 svensk tid (12:00 UTC)
- `0 18 * * *` = 19:00 svensk tid (18:00 UTC)

**OBS:** Cron använder UTC-tid, så:
- Vintertid (standard): UTC +1 timme = svensk tid
- Sommartid: UTC +2 timmar = svensk tid

## 🔍 Felsökning

### Workflow körs inte automatiskt

- Kontrollera att repot är **aktivt** (GitHub pausar inaktiva repos efter 60 dagar)
- Kolla i **Actions**-fliken om workflows är enabled
- Verifiera att cron-syntaxen är korrekt

### "Failed to create/update Gist" fel

- Kontrollera att `GIST_TOKEN` är korrekt
- Verifiera att tokenet har `gist`-scope
- Kontrollera att `GIST_ID` är korrekt (om det är satt)

### Inga emails kommer fram

- Testa att köra lokalt först med `npm start`
- Kontrollera Brevo-credentials i Secrets
- Kolla email-adresserna (FROM och TO)
- Se om det finns felmeddelanden i Actions-loggen

## 📊 Övervaka Körningar

1. Gå till **Actions**-fliken i ditt repo
2. Se historik över alla körningar
3. Klicka på en körning för att se detaljerade loggar
4. Grönt checkmark = lyckad körning ✅
5. Rött kryss = något gick fel ❌

## 🎉 Du är Klar!

Nu körs ditt skript automatiskt varje dag utan att din dator behöver vara på!

**Fördelar:**
- ✅ Kör dygnet runt, alltid tillgänglig
- ✅ Ingen energikostnad för din dator
- ✅ Fullständig logg-historik
- ✅ Kan köras manuellt när du vill
- ✅ Helt gratis med GitHub Free tier

## 🆘 Behöver Hjälp?

- Kolla Actions-loggarna i GitHub
- Verifiera alla Secrets är korrekt konfigurerade
- Testa att köra lokalt först med `.env`-fil
- Kontrollera att Gist-token har rätt permissions
