import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🧪 Création de données de test pour les chaînes...');

    // Données de test pour YouTube
    const chainesTest = [
      {
        nom: 'MrBeast',
        type: 'youtube',
        channel_id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
        nom_affichage: 'MrBeast',
        description: 'Chaîne YouTube de MrBeast',
        avatar_url: 'https://example.com/mrbeast.jpg',
        url_chaine: 'https://www.youtube.com/@MrBeast',
        abonnes: 175000000,
        videos_total: 741,
        vues_total: BigInt(30000000000), // 30 milliards de vues
        actif: true
      },
      {
        nom: 'PewDiePie',
        type: 'youtube',
        channel_id: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
        nom_affichage: 'PewDiePie',
        description: 'Felix Kjellberg channel',
        avatar_url: 'https://example.com/pewdiepie.jpg',
        url_chaine: 'https://www.youtube.com/@pewdiepie',
        abonnes: 111000000,
        videos_total: 4500,
        vues_total: BigInt(29000000000), // 29 milliards de vues
        actif: true
      },
      // Données de test pour Twitch
      {
        nom: 'Ninja',
        type: 'twitch',
        channel_id: 'ninja',
        nom_affichage: 'Ninja',
        description: 'Streamer populaire sur Twitch',
        avatar_url: 'https://example.com/ninja.jpg',
        url_chaine: 'https://www.twitch.tv/ninja',
        abonnes: 18500000, // followers Twitch
        videos_total: 250, // VODs
        vues_total: BigInt(500000000), // 500 millions de vues
        actif: true
      },
      {
        nom: 'Shroud',
        type: 'twitch',
        channel_id: 'shroud',
        nom_affichage: 'Shroud',
        description: 'Ex-pro gamer devenu streamer',
        avatar_url: 'https://example.com/shroud.jpg',
        url_chaine: 'https://www.twitch.tv/shroud',
        abonnes: 9200000,
        videos_total: 180,
        vues_total: BigInt(350000000),
        actif: true
      }
    ];

    // Supprimer les anciennes données de test d'abord
    await prisma.chaine.deleteMany({
      where: {
        OR: [
          { nom: { in: ['MrBeast', 'PewDiePie', 'Ninja', 'Shroud'] } }
        ]
      }
    });

    // Créer les nouvelles chaînes de test
    const chainesCreees = [];
    for (const chaineData of chainesTest) {
      const nouvelleChaîne = await prisma.chaine.create({
        data: {
          ...chaineData,
          date_creation: new Date(),
          derniere_maj: new Date()
        }
      });
      chainesCreees.push(nouvelleChaîne);
    }

    console.log('✅ Données de test créées:', chainesCreees.length, 'chaînes');

    return NextResponse.json({
      success: true,
      message: 'Données de test créées avec succès',
      data: {
        chainesCreees: chainesCreees.length,
        details: chainesCreees.map(c => ({
          nom: c.nom_affichage,
          type: c.type,
          abonnes: c.abonnes,
          vues_total: Number(c.vues_total)
        }))
      }
    });

  } catch (error) {
    console.error('❌ Erreur création données de test:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création des données de test'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}