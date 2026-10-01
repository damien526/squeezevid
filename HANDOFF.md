# Où en est le projet

**Dernière mise à jour : 1er octobre 2026 — naissance du projet.**

## 1. La situation en une phrase

4e webtool du portefeuille (après waveform, finance-sim, kiturgence), lancé ce
jour : compresseur vidéo 100 % local visant les requêtes « compress video to
X MB / for Discord / for email », avec le canal ChatGPT de waveform comme
modèle de croissance.

> **Nom** : d'abord « Undersize », renommé **Undercap** le jour même —
> `undersize.vercel.app` était pris par un « Undersize · Local Image Toolkit »
> (collision de marque dans le même espace). « Underlimit » est pris aussi
> (compresseur PDF local). Vérifier les collisions AVANT de nommer.

## 2. Le choix du produit (étude du 1/10/2026)

- Toutes les niches « wrapper facile » (sign PDF, passport photo, teleprompter,
  whisper web, video background removal) sont **déjà colonisées** par des
  micro-outils IA en 2026. L'avantage doit être une barrière technique.
- Les concurrents gratuits de la compression vidéo sont soit **server-side**
  (upload de centaines de Mo avant de travailler : Kapwing, Descript, Media.io,
  8mb.video), soit **ffmpeg.wasm** (lent, plafond mémoire). WebCodecs =
  encodeur matériel = plusieurs fois le temps réel, mesuré ici : 36 Mo/25 s
  compressés en ~4 s.
- WTP prouvée (Clideo, FreeConvert, Veed vendent des abonnements) ; demande
  éternelle (les limites d'upload ne disparaîtront pas).
- Différenciateur de fraîcheur : presets à jour (**Discord = 20 MB depuis
  août 2026** — la moitié des concurrents affichent encore 8/10/25 MB) et
  l'astuce base64 des emails (25 MB Gmail ⇒ cible réelle 18 MB).

## 3. Ce qui est en place

- Moteur testé e2e (headless Chrome) : MP4 36→18,6 Mo ✓, cible 1 Mo avec
  descente 240p + AAC 64k ✓, MOV/HEVC ✓, WebM/VP9 ✓ (bug « inflation d'un
  fichier léger » corrigé par plafond au bitrate source).
- 9 pages d'atterrissage + 3 articles + FAQ JSON-LD + llms.txt + IndexNow.
- Analytics : pageviews + 8 événements funnel (invisibles tant que le compte
  Vercel n'est pas Pro — même situation que waveform).
- Audit security/privacy du 01/10/2026 : CSP stricte (testée e2e en prod),
  X-Frame-Options DENY, Permissions-Policy ; pages `/terms/` et `/privacy/`
  complètes (contrôleur + contact damienyvert.dev@gmail.com, hébergeur Vercel,
  droits RGPD) ; `/.well-known/security.txt` (expire 10/2027 — à renouveler).
  Zéro requête tierce au runtime (fonts auto-hébergées, analytics same-origin).

## 4. Ce qui reste à faire

- [ ] **Domaine custom** : `undercap.app` ou équivalent à acheter, puis mettre
      à jour `lib/site.ts` + `public/llms.txt`, rebuild, `npm run indexnow`.
- [ ] Search Console + Bing Webmaster à inscrire (leçon waveform : Bing/ChatGPT
      d'abord, Google observe les domaines récents).
- [ ] `npm run indexnow` après chaque déploiement de contenu.
- [ ] Cross-link avec waveform (les deux sont des outils vidéo créateur).
- [ ] Monétisation future : pro tier (batch, presets sauvegardés, 4K) ou
      sponsoring — rien tant que le trafic n'est pas là.
- [ ] Veille limites plateformes : si Discord/Gmail bougent, mettre à jour
      `lib/presets.ts`, `lib/content.ts`, `lib/blog.ts` (les textes portent
      leurs dates).

## 5. Garde-fous

- Aucune affirmation de limite plateforme sans date dans le texte.
- Le ton du site : précis, honnête sur ce que l'outil ne fait pas (cf.
  llms.txt « What it does NOT do ») — c'est ce qui a fait marcher waveform
  dans les recommandations ChatGPT.
