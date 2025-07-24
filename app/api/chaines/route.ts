import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer toutes les chaînes
export async function GET() {
  try {
    const chaines = await prisma.chaine.findMany({
      orderBy: { date_creation: 'desc' },
      include: {
        _count: {
          select: {
            videos: true,
            lives: true,
            plannings: true,
            abonnements: true
          }
        }
      }
    });

    // Transformation des données pour l'interface avec conversion BigInt
    const chainesFormatees = chaines.map(chaine => ({
      id: chaine.id,
      nom: chaine.nom,
      type: chaine.type,
      channel_id: chaine.channel_id,
      nom_affichage: chaine.nom_affichage,
      description: chaine.description,
      avatar_url: chaine.avatar_url,
      url_chaine: chaine.url_chaine,
      abonnes: chaine.abonnes,
      videos_total: chaine.videos_total,
      vues_total: Number(chaine.vues_total), // Conversion BigInt -> Number
      actif: chaine.actif,
      date_creation: chaine.date_creation.toISOString(),
      derniere_maj: chaine.derniere_maj?.toISOString(),
      // Compteurs depuis la base
      videos_count: chaine._count.videos,
      lives_count: chaine._count.lives,
      plannings_count: chaine._count.plannings,
      abonnements_count: chaine._count.abonnements
    }));

    return NextResponse.json({
      success: true,
      data: chainesFormatees
    });

  } catch (error) {
    console.error('Erreur récupération chaînes:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des chaînes'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Créer une nouvelle chaîne
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    if (!body.nom || !body.type || !body.channel_id || !body.url_chaine) {
      return NextResponse.json({
        success: false,
        error: 'Données manquantes: nom, type, channel_id et url_chaine sont requis'
      }, { status: 400 });
    }

    // Vérifier que la chaîne n'existe pas déjà
    const chaineExistante = await prisma.chaine.findFirst({
      where: {
        OR: [
          { channel_id: body.channel_id },
          { 
            nom: body.nom,
            type: body.type
          }
        ]
      }
    });

    if (chaineExistante) {
      return NextResponse.json({
        success: false,
        error: 'Une chaîne avec ce nom ou cet ID existe déjà'
      }, { status: 409 });
    }

    // Créer la nouvelle chaîne
    const nouvelleChaine = await prisma.chaine.create({
      data: {
        nom: body.nom,
        type: body.type,
        channel_id: body.channel_id,
        nom_affichage: body.nom_affichage || body.nom,
        description: body.description || null,
        avatar_url: body.avatar_url || null,
        url_chaine: body.url_chaine,
        abonnes: body.abonnes || 0,
        videos_total: body.videos_total || 0,
        vues_total: BigInt(body.vues_total || 0), // Conversion explicite en BigInt
        actif: body.actif !== undefined ? body.actif : true,
        date_creation: new Date(),
        derniere_maj: new Date()
      }
    });

    console.log(`✅ Nouvelle chaîne créée: ${nouvelleChaine.nom_affichage} (${nouvelleChaine.type})`);

    return NextResponse.json({
      success: true,
      data: {
        id: nouvelleChaine.id,
        nom: nouvelleChaine.nom,
        type: nouvelleChaine.type,
        channel_id: nouvelleChaine.channel_id,
        nom_affichage: nouvelleChaine.nom_affichage,
        description: nouvelleChaine.description,
        avatar_url: nouvelleChaine.avatar_url,
        url_chaine: nouvelleChaine.url_chaine,
        abonnes: nouvelleChaine.abonnes,
        videos_total: nouvelleChaine.videos_total,
        vues_total: Number(nouvelleChaine.vues_total), // Conversion BigInt -> Number
        actif: nouvelleChaine.actif,
        date_creation: nouvelleChaine.date_creation.toISOString(),
        derniere_maj: nouvelleChaine.derniere_maj?.toISOString()
      },
      message: 'Chaîne créée avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création chaîne:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de la chaîne'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 