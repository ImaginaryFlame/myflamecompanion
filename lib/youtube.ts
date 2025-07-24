import { google } from 'googleapis';

// Configuration YouTube API avec vérification de la clé
if (!process.env.YOUTUBE_API_KEY) {
  console.error('❌ YOUTUBE_API_KEY manquante dans .env');
}

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
    maxres?: string;
  };
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  channelId: string;
  channelTitle: string;
}

export interface YouTubeLiveStream {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  scheduledStartTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  concurrentViewers?: number;
  liveChatId?: string;
  channelId: string;
  channelTitle: string;
}

/**
 * Récupère les informations d'une chaîne YouTube
 */
export async function getYouTubeChannel(channelId: string): Promise<YouTubeChannel | null> {
  try {
    console.log(`🔍 Recherche chaîne YouTube: ${channelId}`);
    console.log(`🔑 API Key disponible: ${process.env.YOUTUBE_API_KEY ? 'Oui' : 'Non'}`);
    
    const response = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      id: [channelId]
    });

    const channel = response.data.items?.[0];
    if (!channel) {
      console.log(`❌ Chaîne YouTube non trouvée: ${channelId}`);
      return null;
    }

    console.log(`✅ Chaîne YouTube trouvée: ${channel.snippet?.title}`);

    return {
      id: channel.id!,
      title: channel.snippet?.title || '',
      description: channel.snippet?.description || '',
      customUrl: channel.snippet?.customUrl,
      thumbnails: {
        default: channel.snippet?.thumbnails?.default?.url || '',
        medium: channel.snippet?.thumbnails?.medium?.url || '',
        high: channel.snippet?.thumbnails?.high?.url || ''
      },
      subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
      videoCount: parseInt(channel.statistics?.videoCount || '0'),
      viewCount: parseInt(channel.statistics?.viewCount || '0'),
      publishedAt: channel.snippet?.publishedAt || ''
    };
  } catch (error: any) {
    console.error('Erreur récupération chaîne YouTube:', {
      message: error.message,
      status: error.status,
      code: error.code
    });
    return null;
  }
}

/**
 * Récupère les dernières vidéos d'une chaîne YouTube
 */
export async function getYouTubeVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  try {
    // Récupération des uploads de la chaîne
    const channelResponse = await youtube.channels.list({
      part: ['contentDetails'],
      id: [channelId]
    });

    const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) return [];

    // Récupération des vidéos de la playlist uploads
    const playlistResponse = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: uploadsPlaylistId,
      maxResults
    });

    const videoIds = playlistResponse.data.items?.map(item => item.snippet?.resourceId?.videoId).filter(Boolean) || [];
    if (videoIds.length === 0) return [];

    // Récupération des détails des vidéos
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds as string[]
    });

    return videosResponse.data.items?.map(video => ({
      id: video.id!,
      title: video.snippet?.title || '',
      description: video.snippet?.description || '',
      thumbnails: {
        default: video.snippet?.thumbnails?.default?.url || '',
        medium: video.snippet?.thumbnails?.medium?.url || '',
        high: video.snippet?.thumbnails?.high?.url || '',
        maxres: video.snippet?.thumbnails?.maxres?.url
      },
      publishedAt: video.snippet?.publishedAt || '',
      duration: video.contentDetails?.duration || '',
      viewCount: parseInt(video.statistics?.viewCount || '0'),
      likeCount: parseInt(video.statistics?.likeCount || '0'),
      commentCount: parseInt(video.statistics?.commentCount || '0'),
      channelId: video.snippet?.channelId || '',
      channelTitle: video.snippet?.channelTitle || ''
    })) || [];
  } catch (error) {
    console.error('Erreur récupération vidéos YouTube:', error);
    return [];
  }
}

/**
 * Récupère les lives en cours et programmés d'une chaîne
 */
export async function getYouTubeLiveStreams(channelId: string): Promise<YouTubeLiveStream[]> {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      channelId,
      eventType: 'live',
      type: ['video'],
      maxResults: 5
    });

    if (!response.data.items || response.data.items.length === 0) {
      // Vérifier les lives programmés
      const upcomingResponse = await youtube.search.list({
        part: ['snippet'],
        channelId,
        eventType: 'upcoming',
        type: ['video'],
        maxResults: 5
      });

      if (!upcomingResponse.data.items) return [];
      response.data.items = upcomingResponse.data.items;
    }

    const videoIds = response.data.items.map(item => item.id?.videoId).filter(Boolean);
    if (videoIds.length === 0) return [];

    // Récupération des détails des lives
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'liveStreamingDetails'],
      id: videoIds as string[]
    });

    return videosResponse.data.items?.map(video => ({
      id: video.id!,
      title: video.snippet?.title || '',
      description: video.snippet?.description || '',
      thumbnails: {
        default: video.snippet?.thumbnails?.default?.url || '',
        medium: video.snippet?.thumbnails?.medium?.url || '',
        high: video.snippet?.thumbnails?.high?.url || ''
      },
      scheduledStartTime: video.liveStreamingDetails?.scheduledStartTime,
      actualStartTime: video.liveStreamingDetails?.actualStartTime,
      actualEndTime: video.liveStreamingDetails?.actualEndTime,
      concurrentViewers: video.liveStreamingDetails?.concurrentViewers ? 
        parseInt(video.liveStreamingDetails.concurrentViewers) : undefined,
      liveChatId: video.liveStreamingDetails?.activeLiveChatId,
      channelId: video.snippet?.channelId || '',
      channelTitle: video.snippet?.channelTitle || ''
    })) || [];
  } catch (error) {
    console.error('Erreur récupération lives YouTube:', error);
    return [];
  }
}

/**
 * Recherche une chaîne YouTube par nom
 */
export async function searchYouTubeChannel(query: string): Promise<YouTubeChannel[]> {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['channel'],
      maxResults: 10
    });

    if (!response.data.items) return [];

    const channelIds = response.data.items.map(item => item.id?.channelId).filter(Boolean);
    const channels = await Promise.all(
      channelIds.map(id => getYouTubeChannel(id!))
    );

    return channels.filter(Boolean) as YouTubeChannel[];
  } catch (error) {
    console.error('Erreur recherche chaîne YouTube:', error);
    return [];
  }
} 