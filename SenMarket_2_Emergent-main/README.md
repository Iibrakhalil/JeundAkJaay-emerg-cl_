# SenMarket — Déploiement local

Ce dépôt contient une application full-stack :
- `backend/` : API FastAPI avec MongoDB
- `frontend/` : application React buildée et servie par Nginx
- `docker-compose.yml` : orchestre `frontend`, `backend` et `mongodb`

## Préparation

1. Copie l’exemple d’environnement :

```bash
copy .env.example .env
```

2. Modifie les valeurs dans `.env` si nécessaire.

## Lancer en local

```bash
docker compose up --build
```

- Frontend : http://localhost
- Backend : http://localhost:8000/api/

## Notes

- Le backend utilise `MONGO_URL`, `DB_NAME`, `JWT_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS` et `REACT_APP_BACKEND_URL`.
- Un service MongoDB local est ajouté au `docker-compose.yml` pour un démarrage direct.
- Le fichier `.env` est ignoré par Git.

## Déploiement Railway

Le fichier `RAILWAY_DEPLOY.md` contient les étapes pour déployer backend et frontend sur Railway.
