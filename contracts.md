# Contrats API - SenMarket Backend

## Architecture

### Collections MongoDB
1. **users** - Utilisateurs de la plateforme
2. **products** - Produits d'occasion à vendre
3. **services** - Services proposés
4. **messages** - Messages entre utilisateurs
5. **reviews** - Avis et notations
6. **conversations** - Fils de conversation

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Inscription utilisateur
- `POST /login` - Connexion utilisateur
- `GET /me` - Récupérer l'utilisateur connecté
- `PUT /me` - Mettre à jour le profil

### Products (`/api/products`)
- `GET /` - Liste des produits (avec filtres: category, search, sort)
- `GET /:id` - Détail d'un produit
- `POST /` - Créer un produit (auth requise)
- `PUT /:id` - Modifier un produit (auth requise, propriétaire uniquement)
- `DELETE /:id` - Supprimer un produit (auth requise, propriétaire uniquement)

### Services (`/api/services`)
- `GET /` - Liste des services (avec filtres: category, search)
- `GET /:id` - Détail d'un service
- `POST /` - Créer un service (auth requise)
- `PUT /:id` - Modifier un service (auth requise, propriétaire uniquement)
- `DELETE /:id` - Supprimer un service (auth requise, propriétaire uniquement)

### Messages (`/api/messages`)
- `GET /conversations` - Liste des conversations de l'utilisateur
- `GET /conversation/:id` - Messages d'une conversation
- `POST /` - Envoyer un message (auth requise)
- `PUT /:id/read` - Marquer comme lu

### Reviews (`/api/reviews`)
- `GET /user/:userId` - Avis d'un utilisateur
- `GET /product/:productId` - Avis d'un produit
- `GET /service/:serviceId` - Avis d'un service
- `POST /` - Créer un avis (auth requise)

### Upload (`/api/upload`)
- `POST /image` - Upload d'une image (auth requise)

## Données mockées à remplacer

### Dans mock/data.js
- `products[]` → API GET /api/products
- `services[]` → API GET /api/services
- `messages[]` → API GET /api/messages/conversations
- `reviews[]` → API GET /api/reviews

### Dans AuthContext.js
- `login()` → API POST /api/auth/login avec JWT
- `signup()` → API POST /api/auth/register avec JWT
- `localStorage` → JWT token storage

## Intégration Frontend-Backend

### Changes nécessaires:
1. Créer un fichier `api.js` pour centraliser les appels API
2. Remplacer les imports de mock/data.js par des appels API
3. Ajouter axios interceptors pour JWT
4. Gérer les états de loading et erreurs
5. Implémenter l'upload d'images réel

## JWT Authentication Flow
1. Login/Register → Backend retourne JWT token
2. Store token dans localStorage
3. Ajouter token dans Authorization header pour chaque requête
4. Backend vérifie le token pour les routes protégées
5. Refresh token si expiré

## Image Upload Flow
1. Frontend: Sélection fichier → FormData
2. POST /api/upload/image avec multipart/form-data
3. Backend: Validation → Sauvegarde dans /app/backend/uploads
4. Retourne URL de l'image
5. Frontend: Utilise l'URL dans le formulaire produit/service

## Payment Integration (Future)
- Wave API integration
- Orange Money API integration
- Transaction tracking in MongoDB
