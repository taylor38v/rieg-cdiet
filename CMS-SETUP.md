# Setup CMS — étapes restantes côté Netlify

Le code est prêt. Pour activer le CMS et le dashboard leads, il reste **5 actions** à faire dans le dashboard Netlify (10 min max).

## URL du repo
https://github.com/taylor38v/rieg-immobilier (privé, owner: taylor38v)

## URL du site
https://rieg-immobilier-preview.netlify.app
Site ID Netlify : `b7191fea-d6ba-4c21-bc3a-428e62ba26d2`

---

## 1. Connecter le site au repo GitHub

> Aujourd'hui le site se déploie en drag-and-drop CLI. Pour que Decap CMS puisse commiter, il faut connecter le repo.

1. Aller sur https://app.netlify.com/sites/rieg-immobilier-preview/configuration/deploys#continuous-deployment
2. Cliquer **"Link to a Git repository"**
3. Choisir GitHub → `taylor38v/rieg-immobilier` → branche `master`
4. Build command : `npm run build` · Publish directory : `out` · Functions : `netlify/functions` (déjà dans `netlify.toml`)
5. Enregistrer → Netlify déclenche un build auto

---

## 2. Activer Netlify Identity

> Identity est l'auth utilisée par Decap. Elle permet à Romain de se logger sur `/admin/`.

1. https://app.netlify.com/sites/rieg-immobilier-preview/integrations
2. Onglet **"Identity"** → cliquer **"Enable Identity"**
3. Onglet **"Identity / Settings and usage"** :
   - **Registration** → **Invite only** (sinon n'importe qui peut créer un compte)
   - **External providers** → optionnel : Google si tu veux que Romain login en 1 clic via son Gmail
4. Onglet **"Identity / Services"** → activer **"Git Gateway"** → ça génère un token GitHub côté Netlify pour que Decap puisse écrire dans le repo

---

## 3. Inviter Romain (et toi)

1. Onglet **"Identity"** dans Netlify
2. **Invite users** → entrer `romain.rieg@iadfrance.com` (ou son mail réel) + ton mail
3. Romain reçoit un mail "You've been invited to..." → il clique → définit son password → c'est bon

---

## 4. Créer le Personal Access Token pour le dashboard leads

> Le dashboard `/admin/leads.html` appelle l'API Netlify Forms via une Function. Il faut un PAT.

1. https://app.netlify.com/user/applications/personal → **"New access token"**
2. Description : "rieg-immobilier dashboard leads"
3. Copier le token (commence par `nfp_...`)
4. Aller dans https://app.netlify.com/sites/rieg-immobilier-preview/configuration/env
5. **"Add a single variable"** :
   - Key : `NETLIFY_API_TOKEN`
   - Value : le token copié
   - Scopes : Functions (suffisant)
6. Enregistrer → redéployer le site

---

## 5. Vérifier les formulaires Netlify Forms

Tes formulaires doivent avoir l'attribut `data-netlify="true"` (déjà en place dans `app/components/SmartContactForm.tsx`). Une fois le site connecté à GitHub et redéployé, Netlify détectera les forms automatiquement.

Tu peux les voir dans : https://app.netlify.com/sites/rieg-immobilier-preview/forms

---

## Test final

Une fois ces 5 étapes faites :

1. Va sur **https://rieg-immobilier-preview.netlify.app/admin/** → page de login Identity → connecte-toi
2. Tu vois Decap avec 5 collections : **Articles**, **Biens**, **Témoignages**, **Pages libres**, **Réglages globaux**
3. Modifie un article → clique **Publish** → Decap commit dans GitHub → Netlify rebuild → en 2 min le changement est en ligne
4. Va sur **https://rieg-immobilier-preview.netlify.app/admin/leads.html** → tu vois les leads

---

## Comment Romain ajoute une nouvelle page

1. `/admin/` → **Pages libres** → **Nouvelle page**
2. Titre, slug (= URL), contenu en markdown
3. Publier → la page sera live en 2 min sur `/{slug}/`

## Comment Romain ajoute un article de blog

1. `/admin/` → **Articles** → **Nouvel article**
2. Remplir titre, chapô, rubrique, image, contenu
3. Publier → live sous `/actualites/{slug}/`

## Comment éditer les coordonnées globales

1. `/admin/` → **Réglages globaux** → **Coordonnées & infos site**
2. Modifier téléphone, email, RCS, etc.
3. Sauvegarder

> ⚠️ Note : les modifications de **Réglages globaux** (settings) nécessitent que les composants du site lisent depuis `content/settings.json`. C'est pas encore branché partout — actuellement les coordonnées sont hardcodées dans certains composants (Footer, WhatsApp, Header). Si tu modifies dans le CMS, ça commit le fichier mais le site ne change pas tout de suite.
> **Étape suivante recommandée** : remplacer les coords hardcodées par `import { settings } from "@/lib/_generated/settings"`.

---

## Architecture technique

```
content/                        ← édité depuis Decap CMS
├── articles/*.md               (4 articles seed + nouveaux)
├── biens/*.md                  (6 biens seed + nouveaux)
├── temoignages/*.md            (3 témoignages seed + nouveaux)
├── pages/*.md                  (1 exemple + nouveaux)
└── settings.json               (coords, RCS, mentions)

scripts/build-content.mjs       ← convertit content/ en TS au build
app/lib/_generated/             ← regénéré à chaque build (gitignored)

public/admin/
├── index.html                  ← Decap CMS bootstrap
├── config.yml                  ← Schéma des collections
└── leads.html                  ← Dashboard leads custom

netlify/functions/leads.mjs     ← Proxy vers API Netlify Forms (auth Identity)
```

Quand Romain édite un contenu dans Decap :
1. Decap commit le fichier modifié sur la branche `master` via Git Gateway
2. Netlify détecte le push → rebuild auto (`npm run build`)
3. Le rebuild lance `scripts/build-content.mjs` qui regénère `app/lib/_generated/*.ts`
4. Next.js build le site avec les nouveaux contenus
5. Site live en 2-3 min

---

## Limites actuelles (à voir si besoin)

- **Secteurs (7 communes)** : pas dans le CMS, restent codés en TS. Si tu veux que Romain puisse modifier les 8 listes par commune (écoles, restos, assoc...), c'est une v2.
- **Outils calculatrices** : codés en TS, pas modifiables.
- **Settings vraiment branchés** : faut remplacer les coords hardcodées dans Footer/Header/WhatsApp par les valeurs depuis `settings.json` (rapide à faire, mais pas dans ce premier jet).

---

Quand t'as fini les 5 étapes, ping-moi et je teste.
