# 🔑 Configuration des APIs YouTube et Twitch

Ce guide vous explique comment configurer les APIs YouTube Data v3 et Twitch pour votre application MyFlameCompanion.

## 🔴 Configuration YouTube API

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API YouTube Data API v3 :
   - Allez dans "APIs & Services" > "Library"
   - Recherchez "YouTube Data API v3"
   - Cliquez sur "Enable"

### 2. Créer une clé API

1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "API Key"
3. Copiez la clé générée
4. (Optionnel) Restreignez la clé à l'API YouTube Data v3

### 3. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# YouTube API
YOUTUBE_API_KEY="votre_cle_api_youtube_ici"
```

### 4. Trouver l'ID d'une chaîne YouTube

**Méthode 1 - URL personnalisée :**
- URL: `https://youtube.com/@NomDeLaChaine`
- Allez sur la chaîne > Onglet "À propos" > ID de la chaîne

**Méthode 2 - URL classique :**
- URL: `https://youtube.com/channel/UCxxxxxxxxxxxxxxxxxx`
- L'ID est la partie après `/channel/`

**Méthode 3 - API :**
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=NomDeLaChaine&key=VOTRE_CLE_API"
```

## 🟣 Configuration Twitch API

### 1. Créer une application Twitch

1. Allez sur [Twitch Developers Console](https://dev.twitch.tv/console)
2. Connectez-vous avec votre compte Twitch
3. Cliquez sur "Register Your Application"
4. Remplissez les informations :
   - **Name** : MyFlameCompanion
   - **OAuth Redirect URLs** : `http://localhost:3000/api/auth/twitch/callback`
   - **Category** : Website Integration

### 2. Récupérer les identifiants

1. Cliquez sur "Manage" sur votre application
2. Copiez le **Client ID**
3. Générez un **Client Secret** et copiez-le

### 3. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# Twitch API
TWITCH_CLIENT_ID="votre_client_id_twitch_ici"
TWITCH_CLIENT_SECRET="votre_client_secret_twitch_ici"
```

### 4. Trouver le nom d'utilisateur Twitch

- URL: `https://twitch.tv/nomdutilisateur`
- Le nom d'utilisateur est la partie après `/`
- **Important** : Utilisez le nom d'utilisateur, pas l'ID numérique

## ⚙️ Configuration complète .env

Voici un exemple complet de fichier `.env` :

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/myflamecompanion"

# YouTube API
YOUTUBE_API_KEY="AIzaSyC-votre_cle_api_youtube_ici"

# Twitch API
TWITCH_CLIENT_ID="votre_client_id_twitch_ici"
TWITCH_CLIENT_SECRET="votre_client_secret_twitch_ici"

# Configuration Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre_secret_nextauth_ici"

# Scraping
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

## 🧪 Test des APIs

### Test YouTube API

```bash
# Test de récupération d'une chaîne
curl "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=UCxxxxxxxxxxxxxxxxxx&key=VOTRE_CLE_API"
```

### Test Twitch API

```bash
# 1. Récupérer un token d'accès
curl -X POST "https://id.twitch.tv/oauth2/token" \
  -d "client_id=VOTRE_CLIENT_ID" \
  -d "client_secret=VOTRE_CLIENT_SECRET" \
  -d "grant_type=client_credentials"

# 2. Test de récupération d'un utilisateur
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Client-Id: VOTRE_CLIENT_ID" \
  "https://api.twitch.tv/helix/users?login=nomdutilisateur"
```

## 🔄 Utilisation dans l'application

### 1. Ajouter une chaîne

1. Allez sur `/admin/chaines`
2. Cliquez sur "Ajouter Chaîne"
3. Remplissez les informations :
   - **YouTube** : Channel ID (UCxxxxxxxxxxxxxxxxxx)
   - **Twitch** : Nom d'utilisateur (sans @)
4. Cliquez sur "Test API" pour vérifier
5. Sauvegardez

### 2. Synchronisation automatique

- **Manuel** : Bouton "Synchroniser" sur `/chaines` ou `/admin/chaines`
- **Automatique** : Tâche cron toutes les 30 minutes
- **API disponibles** :
  - `POST /api/sync/channels` - Synchronisation complète
  - `GET /api/youtube/channel?id=UCxxx` - Test YouTube
  - `GET /api/twitch/channel?username=user` - Test Twitch

### 3. Données synchronisées

**YouTube :**
- ✅ Informations de la chaîne (nom, description, avatar)
- ✅ Statistiques (abonnés, vues totales, nombre de vidéos)
- ✅ Dernières vidéos (titre, vues, likes, durée)
- ✅ Lives en cours et programmés
- ✅ Miniatures et métadonnées

**Twitch :**
- ✅ Informations de la chaîne (nom, description, avatar)
- ✅ Statistiques (followers, vues totales)
- ✅ Statut du stream (en ligne/hors ligne)
- ✅ Informations du stream actuel (titre, viewers, jeu)
- ✅ Dernières VODs et highlights

## 🚨 Limites et quotas

### YouTube API
- **Quota quotidien** : 10,000 unités par jour (gratuit)
- **Coût par requête** :
  - Channels.list : 1 unité
  - Videos.list : 1 unité
  - Search.list : 100 unités
- **Recommandation** : Limitez les recherches, privilégiez les requêtes directes

### Twitch API
- **Rate Limit** : 800 requêtes par minute
- **Token d'accès** : Expire toutes les heures (renouvelé automatiquement)
- **Pas de quota quotidien** pour les requêtes de base

## 🔧 Dépannage

### Erreurs courantes

**YouTube :**
- `API key not valid` : Vérifiez votre clé API dans .env
- `Channel not found` : Vérifiez l'ID de la chaîne
- `Quota exceeded` : Attendez le lendemain ou activez la facturation

**Twitch :**
- `Invalid client` : Vérifiez Client ID et Secret
- `User not found` : Vérifiez le nom d'utilisateur (sensible à la casse)
- `Token expired` : Le token est renouvelé automatiquement

### Logs de débogage

Les logs sont disponibles dans :
- Console du navigateur (erreurs frontend)
- Terminal du serveur (erreurs API)
- Onglet "Network" des DevTools (requêtes HTTP)

## 📞 Support

En cas de problème :
1. Vérifiez les logs d'erreur
2. Testez les APIs manuellement avec curl
3. Vérifiez les variables d'environnement
4. Consultez la documentation officielle :
   - [YouTube Data API](https://developers.google.com/youtube/v3)
   - [Twitch API](https://dev.twitch.tv/docs/api/) 