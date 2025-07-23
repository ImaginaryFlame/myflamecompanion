import { NextResponse } from 'next/server';

// Données temporaires mockées (en attendant que Prisma soit configuré)
const chainesMockees = [
  {
    id: 1,
    nom: 'ImaginaryFlame',
    type: 'youtube',
    channel_id: 'UC_example_youtube',
    nom_affichage: 'ImaginaryFlame - Histoires Imaginaires',
    description: 'Chaîne dédiée aux histoires fantastiques et à l\'écriture créative',
    avatar_url: '/api/placeholder/avatar.jpg',
    url_chaine: 'https://youtube.com/@imaginaryflame',
    abonnes: 1250,
    videos_total: 45,
    vues_total: 125000,
    actif: true,
    date_creation: new Date().toISOString(),
    videos: [
      {
        id: 1,
        titre: 'La Fable du Héros et la Fée - Analyse Chapitre 12',
        vues: 15420,
        likes: 892,
        date_publication: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    lives: [],
    plannings: [
      {
        id: 1,
        type: 'video',
        titre: 'Analyse Littéraire - Chapitre 13',
        date_prevue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 2,
    nom: 'ImaginaryFlame',
    type: 'twitch',
    channel_id: 'imaginaryflame_twitch',
    nom_affichage: 'ImaginaryFlame Live',
    description: 'Lives d\'écriture et discussions sur mes histoires',
    avatar_url: '/api/placeholder/avatar.jpg',
    url_chaine: 'https://twitch.tv/imaginaryflame',
    abonnes: 680,
    videos_total: 0,
    vues_total: 45000,
    actif: true,
    date_creation: new Date().toISOString(),
    videos: [],
    lives: [
      {
        id: 1,
        titre: 'Écriture en direct - Chapitre 15',
        statut: 'en_cours',
        spectateurs_actuel: 247,
        url_live: 'https://twitch.tv/imaginaryflame'
      }
    ],
    plannings: []
  }
];

export async function GET() {
  try {
    // TODO: Remplacer par l'appel Prisma une fois configuré
    /*
    const chaines = await prisma.chaine.findMany({
      orderBy: { date_creation: 'desc' },
      include: {
        videos: {
          take: 5,
          orderBy: { date_publication: 'desc' }
        },
        lives: {
          where: {
            OR: [
              { statut: 'en_cours' },
              { statut: 'programme' }
            ]
          },
          orderBy: { date_debut_prevue: 'asc' }
        },
        plannings: {
          where: {
            date_prevue: {
              gte: new Date()
            }
          },
          orderBy: { date_prevue: 'asc' },
          take: 10
        }
      }
    });
    */

    return NextResponse.json({
      success: true,
      data: chainesMockees,
      count: chainesMockees.length
    });
  } catch (error) {
    console.error('Erreur récupération chaînes:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur de base de données'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: Remplacer par l'appel Prisma une fois configuré
    const nouvelleChaine = {
      id: chainesMockees.length + 1,
      nom: body.nom,
      type: body.type,
      channel_id: body.channel_id,
      nom_affichage: body.nom_affichage,
      description: body.description,
      avatar_url: body.avatar_url,
      banniere_url: body.banniere_url,
      url_chaine: body.url_chaine,
      abonnes: body.abonnes || 0,
      videos_total: body.videos_total || 0,
      vues_total: body.vues_total || 0,
      actif: body.actif !== undefined ? body.actif : true,
      date_creation: new Date().toISOString(),
      videos: [],
      lives: [],
      plannings: []
    };

    chainesMockees.push(nouvelleChaine);

    return NextResponse.json({
      success: true,
      data: nouvelleChaine
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création chaîne:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création'
    }, { status: 500 });
  }
} 