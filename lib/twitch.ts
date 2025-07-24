import axios from 'axios';

// Configuration Twitch API
const TWITCH_API_BASE = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_BASE = 'https://id.twitch.tv/oauth2';

export interface TwitchChannel {
  id: string;
  login: string;
  display_name: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  follower_count: number;
  created_at: string;
  broadcaster_type: string;
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: 'live' | '';
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

export interface TwitchVideo {
  id: string;
  stream_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: 'upload' | 'archive' | 'highlight';
  duration: string;
}

/**
 * Récupère un token d'accès Twitch (App Access Token)
 */
async function getTwitchAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post(`${TWITCH_AUTH_BASE}/token`, {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Erreur récupération token Twitch:', error);
    return null;
  }
}

/**
 * Effectue une requête API Twitch avec authentification
 */
async function twitchApiRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const token = await getTwitchAccessToken();
  if (!token) throw new Error('Impossible de récupérer le token Twitch');

  try {
    const response = await axios.get(`${TWITCH_API_BASE}${endpoint}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${token}`
      },
      params
    });

    return response.data;
  } catch (error: any) {
    console.error(`Erreur API Twitch ${endpoint}:`, {
      status: error.response?.status,
      data: error.response?.data,
      params
    });
    throw error;
  }
}

/**
 * Récupère le nombre de followers d'une chaîne Twitch
 */
async function getTwitchFollowers(userId: string): Promise<number> {
  try {
    const data = await twitchApiRequest('/channels/followers', { broadcaster_id: userId });
    return data.total || 0;
  } catch (error) {
    console.log('⚠️ API followers non accessible, retour 0');
    return 0;
  }
}

/**
 * Récupère les informations d'une chaîne Twitch par nom d'utilisateur
 */
export async function getTwitchChannel(username: string): Promise<TwitchChannel | null> {
  try {
    // Nettoyer le nom d'utilisateur (enlever espaces et caractères spéciaux)
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    console.log(`🔍 Recherche utilisateur Twitch: "${cleanUsername}"`);
    
    const data = await twitchApiRequest('/users', { login: cleanUsername });
    const user = data.data?.[0];
    if (!user) {
      console.log(`❌ Utilisateur Twitch non trouvé: ${cleanUsername}`);
      return null;
    }

    console.log(`✅ Utilisateur Twitch trouvé: ${user.display_name}`);
    
    // Essayer de récupérer les followers
    const followerCount = await getTwitchFollowers(user.id);
    
    return {
      id: user.id,
      login: user.login,
      display_name: user.display_name,
      description: user.description || '',
      profile_image_url: user.profile_image_url,
      offline_image_url: user.offline_image_url,
      view_count: user.view_count,
      follower_count: followerCount,
      created_at: user.created_at,
      broadcaster_type: user.broadcaster_type
    };
  } catch (error) {
    console.error('Erreur récupération chaîne Twitch:', error);
    return null;
  }
}

/**
 * Vérifie si une chaîne Twitch est en live
 */
export async function getTwitchStream(username: string): Promise<TwitchStream | null> {
  try {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const data = await twitchApiRequest('/streams', { user_login: cleanUsername });
    const stream = data.data?.[0];
    
    if (!stream) return null;

    return {
      id: stream.id,
      user_id: stream.user_id,
      user_login: stream.user_login,
      user_name: stream.user_name,
      game_id: stream.game_id,
      game_name: stream.game_name,
      type: stream.type,
      title: stream.title,
      viewer_count: stream.viewer_count,
      started_at: stream.started_at,
      language: stream.language,
      thumbnail_url: stream.thumbnail_url,
      tag_ids: stream.tag_ids || [],
      is_mature: stream.is_mature
    };
  } catch (error) {
    console.error('Erreur récupération stream Twitch:', error);
    return null;
  }
}

/**
 * Récupère les dernières vidéos d'une chaîne Twitch
 */
export async function getTwitchVideos(username: string, maxResults: number = 10): Promise<TwitchVideo[]> {
  try {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    // Récupération de l'ID utilisateur
    const userData = await twitchApiRequest('/users', { login: cleanUsername });
    const user = userData.data?.[0];
    if (!user) return [];

    // Récupération des vidéos
    const data = await twitchApiRequest('/videos', { 
      user_id: user.id,
      first: maxResults,
      sort: 'time'
    });

    return data.data?.map((video: any) => ({
      id: video.id,
      stream_id: video.stream_id,
      user_id: video.user_id,
      user_login: video.user_login,
      user_name: video.user_name,
      title: video.title,
      description: video.description,
      created_at: video.created_at,
      published_at: video.published_at,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      viewable: video.viewable,
      view_count: video.view_count,
      language: video.language,
      type: video.type,
      duration: video.duration
    })) || [];
  } catch (error) {
    console.error('Erreur récupération vidéos Twitch:', error);
    return [];
  }
}

/**
 * Recherche des chaînes Twitch par nom
 */
export async function searchTwitchChannels(query: string): Promise<TwitchChannel[]> {
  try {
    const data = await twitchApiRequest('/search/channels', { 
      query,
      first: 10
    });

    if (!data.data) return [];

    return Promise.all(
      data.data.map(async (channel: any) => {
        // Récupération des détails complets de chaque chaîne
        const fullChannel = await getTwitchChannel(channel.broadcaster_login);
        return fullChannel;
      })
    ).then(channels => channels.filter(Boolean) as TwitchChannel[]);
  } catch (error) {
    console.error('Erreur recherche chaînes Twitch:', error);
    return [];
  }
}

/**
 * Récupère les streams en direct par catégorie
 */
export async function getTwitchStreamsByGame(gameName: string, maxResults: number = 10): Promise<TwitchStream[]> {
  try {
    // Récupération de l'ID du jeu
    const gameData = await twitchApiRequest('/games', { name: gameName });
    const game = gameData.data?.[0];
    if (!game) return [];

    // Récupération des streams
    const data = await twitchApiRequest('/streams', {
      game_id: game.id,
      first: maxResults
    });

    return data.data?.map((stream: any) => ({
      id: stream.id,
      user_id: stream.user_id,
      user_login: stream.user_login,
      user_name: stream.user_name,
      game_id: stream.game_id,
      game_name: stream.game_name,
      type: stream.type,
      title: stream.title,
      viewer_count: stream.viewer_count,
      started_at: stream.started_at,
      language: stream.language,
      thumbnail_url: stream.thumbnail_url,
      tag_ids: stream.tag_ids || [],
      is_mature: stream.is_mature
    })) || [];
  } catch (error) {
    console.error('Erreur récupération streams par jeu:', error);
    return [];
  }
}

/**
 * Formate l'URL des miniatures Twitch
 */
export function formatTwitchThumbnail(url: string, width: number = 320, height: number = 180): string {
  return url.replace('{width}', width.toString()).replace('{height}', height.toString());
} 