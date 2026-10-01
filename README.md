# Undercap

Compresse n'importe quelle vidéo **sous une taille cible exacte** (20 MB Discord,
18 MB email, 8 MB webhook, ou n'importe quel nombre), **entièrement dans le
navigateur**. Aucun upload, aucun watermark, aucun compte — le fichier ne quitte
jamais la machine.

> **Où en est le site ?** `HANDOFF.md` tient l'état du projet : positionnement,
> ce qui a été fait, ce qui reste à faire. Ce README décrit le produit et ses
> contraintes techniques.

## Comment ça marche

- **Moteur** : [Mediabunny](https://mediabunny.dev) (WebCodecs) — demux
  MP4/MOV/WebM/MKV, décodage/encodage matériels, mux MP4. Sortie : H.264 + AAC.
- **Ciblage de taille** (`lib/plan.ts`) : budget = cible × 0,93 (marge conteneur),
  moins l'audio (copié si ≤ 20 % du budget, sinon ré-encodé AAC 96/64 kbps,
  sinon refus honnête), le reste au bitrate vidéo. Si bits/pixel < 0,045,
  descente d'échelle (2160→1440→1080→720→540→480→360→240). Bitrate plafonné près
  de celui de la source (×1,05 si AVC, ×1,8 sinon) pour ne jamais gonfler un
  fichier léger.
- **Vérification** (`lib/compress.ts`) : la taille réelle est mesurée après
  encodage ; en cas de dépassement, re-encodage resserré (max 3 passes). Le
  bouton de téléchargement ne propose qu'un fichier qui tient vraiment.
- **Navigateurs** : Chrome/Edge/Brave/Opera/Firefox récents. Sur Firefox, pas
  d'encodeur AAC → l'audio est copié ou retiré, jamais perdu en silence.

## Lancer

```bash
npm install
npm run dev        # dev Next.js
npm run build      # export statique dans out/
npm run typecheck
npm run indexnow   # après déploiement : soumet le sitemap à IndexNow
```

## SEO

Export statique (`output: 'export'`), pages d'atterrissage par limite
(`lib/content.ts`), 3 articles (`lib/blog.ts`), JSON-LD (WebApplication,
FAQPage, Article), `public/llms.txt` (capacités ET limites explicites),
sitemap/robots/manifest/OG générés au build. Toute affirmation datée (limites
Discord/Gmail) porte sa date dans le texte.
