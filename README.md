# Ziachstund

Übungstagebuch für die Steirische Harmonika. Wochenziel setzen, Übungszeit
aufzeichnen, Verlauf ansehen, Ränge und Abzeichen sammeln.

Alle Daten bleiben am Gerät. Es gibt keinen Server, keine Anmeldung und keine
Übertragung nach außen.

---

## Was hier liegt

| Pfad | Zweck |
|---|---|
| `docs/index.html` | Die gesamte App in einer Datei, Schriften eingebettet |
| `docs/manifest.json` | Macht die Seite installierbar |
| `docs/sw.js` | Sorgt für den Betrieb ohne Internet |
| `docs/icon-*.png` | App-Symbole |
| `capacitor.config.json` | Verpackung als Android-App |
| `assets/` | Vorlagen, aus denen die App-Symbole erzeugt werden |
| `.github/workflows/apk.yml` | Baut die APK automatisch |
| `.github/workflows/ios.yml` | Baut die iOS-App und schickt sie an TestFlight |

---

## Schritt 1: Als Web-App veröffentlichen

1. Repository auf GitHub anlegen und diese Dateien hochladen.
2. **Settings → Pages** öffnen.
3. Unter *Source* **Deploy from a branch** wählen,
   Branch `main` und Ordner **`/docs`** einstellen, speichern.
4. Nach ein bis zwei Minuten ist die App erreichbar unter
   `https://DEINNAME.github.io/ziachstund/`

### Auf dem Handy ablegen

**Android:** Adresse in Chrome öffnen → Menü → *App installieren*.

**iPhone:** Adresse in Safari öffnen → *Teilen* → *Zum Home-Bildschirm*.
Chrome auf dem iPhone kann das nicht, es muss Safari sein.

In beiden Fällen bekommt die App ein eigenes Symbol, startet ohne Browserleiste
und läuft danach auch ohne Internet.

---

## Schritt 2: APK für Android bauen

Der Ablauf in `.github/workflows/apk.yml` erledigt das auf GitHubs Rechnern.
Du brauchst weder Android Studio noch das Android-SDK auf deinem Gerät.

### Einmalig: Schlüssel erzeugen

Eine Android-App muss signiert sein. Der Schlüssel bleibt für die gesamte
Lebensdauer der App derselbe — **geh sorgsam damit um und sichere ihn.**
Ohne ihn kannst du später keine Aktualisierung mehr veröffentlichen.

```bash
keytool -genkeypair -v \
  -keystore schluessel.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias ziachstund
```

Danach in Base64 umwandeln:

```bash
base64 -w0 schluessel.jks > schluessel.txt      # Linux
base64 -i schluessel.jks | tr -d '\n' > schluessel.txt   # macOS
```

### Einmalig: Geheimnisse hinterlegen

**Settings → Secrets and variables → Actions → New repository secret**

| Name | Inhalt |
|---|---|
| `KEYSTORE_BASE64` | Inhalt von `schluessel.txt` |
| `KEYSTORE_PASSWORT` | Passwort des Schlüsselspeichers |
| `SCHLUESSEL_ALIAS` | `ziachstund` |
| `SCHLUESSEL_PASSWORT` | Passwort des Schlüssels |

Fehlen die Geheimnisse, läuft der Bau trotzdem durch und liefert eine
unsignierte Datei — die lässt sich aber nicht installieren.

### Veröffentlichen

```bash
git tag v1.0.0
git push origin v1.0.0
```

Nach etwa fünf Minuten hängt unter *Releases* eine `ziachstund.apk`.
Die Versionsnummer wird automatisch aus dem Schlagwort übernommen.

Zum Ausprobieren ohne Veröffentlichung: **Actions → APK bauen → Run workflow**.
Die Datei liegt dann unter *Artifacts*.

### Installieren

Die APK am Handy herunterladen und antippen. Android fragt einmalig nach der
Erlaubnis, Apps aus dieser Quelle zu installieren.

---

## Schritt 3: iPhone über TestFlight

TestFlight ist Apples offizieller Weg, eine App vor der Veröffentlichung an
Testpersonen zu geben. Die App landet nicht im App Store, ist aber vollwertig
installiert.

### Wer was braucht

| | Kosten | Aufwand |
|---|---|---|
| **Du** | Apple Developer Program, 99 € im Jahr | Einmalig einrichten |
| **Deine Tester** | nichts | TestFlight-App laden, Einladungslink antippen |

Ein Tester braucht **kein** Entwicklerkonto. Er lädt die kostenlose
TestFlight-App aus dem App Store, öffnet deinen Link und hat Ziachstund am
Gerät — mit Symbol, Vollbild und Aktualisierungen wie eine normale App.

### Was du wissen musst

- **Fassungen laufen nach 90 Tagen ab.** Danach muss eine neue hochgeladen werden.
- **Bis zu 100 interne Tester** ohne Prüfung durch Apple. Sie brauchen einen
  Zugang in App Store Connect.
- **Bis zu 10.000 externe Tester** über einen öffentlichen Link. Dafür prüft
  Apple die erste Fassung jeder Version kurz, meist innerhalb eines Tages.
- Der Bau läuft auf einem macOS-Rechner. GitHub stellt den bereit — bei
  öffentlichen Repositories kostenlos, bei privaten zählt die Zeit zehnfach.

### Einmalig: Zugang für App Store Connect

1. Im Apple Developer Program anmelden.
2. In **App Store Connect → Users and Access → Integrations → App Store Connect API**
   einen Schlüssel mit der Rolle *App Manager* erzeugen. Die `.p8`-Datei lässt
   sich nur einmal herunterladen.
3. Dort notieren: **Key ID**, **Issuer ID**. Die **Team ID** steht im
   Entwicklerportal unter *Membership*.
4. Eine App mit der Kennung `at.ziachstund.app` anlegen — oder den ersten Bau
   laufen lassen, `-allowProvisioningUpdates` legt sie selbst an.

`.p8` in Base64 umwandeln:

```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | tr -d '\n' > schluessel.txt
```

### Einmalig: Geheimnisse hinterlegen

| Name | Inhalt |
|---|---|
| `APPLE_API_KEY_P8` | Inhalt von `schluessel.txt` |
| `APPLE_API_KEY_ID` | Key ID, zehn Zeichen |
| `APPLE_API_ISSUER_ID` | Issuer ID, eine lange Kennung mit Bindestrichen |
| `APPLE_TEAM_ID` | Team ID, zehn Zeichen |

### Veröffentlichen

Dasselbe Schlagwort wie bei Android löst beide Abläufe aus:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Nach etwa fünfzehn Minuten liegt die Fassung in App Store Connect. Dort unter
*TestFlight* die Tester einladen oder den öffentlichen Link erzeugen.

Ohne hinterlegte Geheimnisse läuft der Ablauf trotzdem und prüft nur, ob sich
das Projekt bauen lässt. So siehst du Fehler, bevor du Geld ausgibst.

### Wenn du die 99 € nicht ausgeben willst

Dann bleibt für das iPhone der Weg aus Schritt 1: Seite in Safari öffnen,
*Teilen → Zum Home-Bildschirm*. Kostenlos, unbegrenzt haltbar, mit eigenem
Symbol und ohne Browserleiste. Der Unterschied zur TestFlight-Fassung ist für
diese App gering — sie speichert ohnehin alles lokal und braucht keine
Systemfunktionen.

Eine `.ipa`-Datei einfach auf GitHub anzubieten, funktioniert dagegen nicht.
Apple lässt das Installieren fremder Dateien nicht zu. Der Umweg über AltStore
verlangt vom Nutzer, die App alle sieben Tage mit der eigenen Apple-ID neu zu
signieren.

---

## Aktualisieren

1. `docs/index.html` ändern.
2. In `docs/sw.js` die Zahl in `const STAND = 'ziachstund-1'` erhöhen.
   Ohne das behalten bereits installierte Geräte die alte Fassung.
3. Änderungen hochladen. Die Web-App aktualisiert sich beim nächsten Start.
4. Für neue Fassungen ein neues Schlagwort setzen — das baut APK und
   iOS-Fassung in einem Zug.

---

## Daten sichern

Unter *Optionen → Sicherung → Sichern* entsteht eine JSON-Datei mit allen
Einheiten, Zielen und Jokern. Diese Datei ist die einzige Sicherung — sie liegt
weder auf GitHub noch sonst irgendwo.

Zusätzlich legt die Android-App ihre Daten in den nativen Einstellungen ab,
damit sie erhalten bleiben, wenn das System den Browserspeicher räumt.
