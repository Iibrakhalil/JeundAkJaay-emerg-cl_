# Jënd-Ak-Jaay (ex-SenMarket) 3.0 - PRD

## Problem Statement
Marketplace Senegalaise (style Vinted/Leboncoin). Diagnostic et corrections pour la rendre plus professionnelle, securisee et fluide.

## Architecture
- **Backend**: FastAPI + MongoDB (motor) + GridFS pour les medias
- **Frontend**: React + Tailwind CSS + shadcn/ui + Craco
- **Auth**: JWT (python-jose) + bcrypt (passlib)
- **Upload**: GridFS + endpoint /api/media/{id}
- **Paiement**: Wave / Orange Money (interface UI - non connecte aux APIs)

## What's Been Implemented

### Session 1 (2026-04-16) - Diagnostic & Corrections securite
1. Fix `datetime.utcnow()` deprecated → `datetime.now(timezone.utc)` partout
2. Fix JWT_SECRET_KEY crash → fallback gracieux
3. Fix `HTTPBearer(auto_error=False)` + support Request header fallback
4. Email normalise en lowercase dans signup ET login
5. Protection brute force (5 tentatives → lockout 15min)
6. `.dict()` → `.model_dump()` (Pydantic V2)
7. Admin check coherent avec `.lower()`
8. Fix crash `sellerWhatsapp` (champ inexistant)
9. Whitelist champs dans update product/service (securite)
10. CORS regex elargi pour preview.emergentagent.com
11. Seed admin automatique au demarrage
12. Seed demo data si DB vide
13. Fix `api.js` baseURL `/api` → `${REACT_APP_BACKEND_URL}/api`

### Session 2 (2026-04-16) - Upload + Renommage
14. Renommage SenMarket → Jënd-Ak-Jaay (navbar, pages, backend, title HTML, toasts, messages)
15. Fix media.js: REACT_APP_BACKEND_API_URL → REACT_APP_BACKEND_URL
16. Upload images fonctionnel end-to-end: frontend → GridFS → affichage

## Test Results
- Iteration 1: Backend 86.7%, Frontend 100%, Overall 93%
- Iteration 2: Backend 100%, Frontend 95%, Overall 97%

## Prioritized Backlog
### P1 (Important)
- [ ] Wave / Orange Money integration reelle (necessite cles API)
- [ ] Google Auth (connexion sociale)
- [ ] Rate limiting global sur l'API

### P2 (Nice to have)
- [ ] Notifications push
- [ ] Mode sombre
- [ ] PWA (Progressive Web App)
- [ ] SMS OTP via Twilio/Orange API
- [ ] Systeme de boost d'annonces payant
