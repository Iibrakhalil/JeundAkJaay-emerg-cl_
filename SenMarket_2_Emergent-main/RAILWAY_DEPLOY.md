# 🚀 Déploiement Railway — Jënd-Ak-Jaay (SenMarket)

## Prérequis
- Compte Railway (railway.app)
- Repo GitHub avec ce code pushé
- URI MongoDB Atlas (ex: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/`)

---

## Étape 1 — Créer la base MongoDB Atlas

1. Va sur [mongodb.com/atlas](https://mongodb.com/atlas) → New Project → "SenMarket"
2. Crée un cluster **M0 Free** (région AWS eu-west-1 recommandée)
3. **Database Access** → Add user → username + password (note-les !)
4. **Network Access** → Add IP → `0.0.0.0/0` (pour Railway)
5. **Connect** → Drivers → copie l'URI :
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/
   ```

---

## Étape 2 — Déployer le Backend sur Railway

1. Railway → **New Project** → **Deploy from GitHub repo**
2. Sélectionne ton repo → dossier racine : `backend/`
   - Railway → Settings → **Root Directory** : `backend`
3. **Variables d'environnement** à ajouter dans Railway (onglet Variables) :

| Variable | Valeur |
|---|---|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/` |
| `DB_NAME` | `senmarket` |
| `JWT_SECRET_KEY` | une clé aléatoire longue (ex: `openssl rand -hex 32`) |
| `ADMIN_EMAIL` | ton email admin |
| `ADMIN_PASSWORD` | ton mot de passe admin |
| `CORS_ORIGINS` | `https://ton-frontend.railway.app` (à mettre après avoir déployé le frontend) |
| `PORT` | `8000` |

4. Railway va auto-détecter le Dockerfile et lancer le build.
5. Une fois déployé, note l'URL : `https://xxx.railway.app` → c'est ton **BACKEND_URL**

---

## Étape 3 — Déployer le Frontend sur Railway

1. Dans le même projet Railway → **New Service** → **GitHub repo**
2. Même repo → Settings → **Root Directory** : `frontend`
3. **Variables d'environnement** :

| Variable | Valeur |
|---|---|
| `REACT_APP_BACKEND_URL` | `https://xxx.railway.app` (URL du backend Railway) |

4. **Build Arguments** (Settings → Build) :
   ```
   REACT_APP_BACKEND_URL=https://xxx.railway.app
   ```
5. Lance le déploiement → note l'URL frontend.

---

## Étape 4 — Mettre à jour le CORS du backend

Une fois que tu as l'URL du frontend, retourne dans le service backend sur Railway et mets à jour :

```
CORS_ORIGINS=https://ton-frontend.railway.app
```

Redéploie le backend.

---

## Vérification

- **Backend** : `https://ton-backend.railway.app/api/` → doit retourner `{"message": "Jënd-Ak-Jaay API is running"}`
- **Frontend** : `https://ton-frontend.railway.app` → la page d'accueil s'affiche

---

## 🔑 Générer une JWT_SECRET_KEY sécurisée

Sur ton terminal local :
```bash
openssl rand -hex 32
# ou
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## ⚠️ Notes importantes

- Les images uploadées sur Railway sont **éphémères** (perdues au redéploiement). Les images sont stockées dans MongoDB GridFS, elles sont donc persistées dans Atlas.
- Le plan **Hobby** Railway ($5/mois) est recommandé pour un usage continu — le plan Trial met les services en veille.
- MongoDB Atlas M0 est gratuit et suffisant pour tester (512MB de stockage).
