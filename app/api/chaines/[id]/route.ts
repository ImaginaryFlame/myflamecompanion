import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer une chaîne par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chaineId = parseInt(id);

    if (isNaN(chaineId)) {
      return NextResponse.json({
        success: false,
        error: 'ID de chaîne invalide'
      }, { status: 400 });
    }

    const chaine = await prisma.chaine.findUnique({
      where: { id: chaineId }
    });

    if (!chaine) {
      return NextResponse.json({
        success: false,
        error: 'Chaîne non trouvée'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: chaine
    });

  } catch (error) {
    console.error('Erreur récupération chaîne:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Modifier une chaîne
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chaineId = parseInt(id);

    if (isNaN(chaineId)) {
      return NextResponse.json({
        success: false,
        error: 'ID de chaîne invalide'
      }, { status: 400 });
    }

    const body = await request.json();
    
    // Vérifier que la chaîne existe
    const chaineExistante = await prisma.chaine.findUnique({
      where: { id: chaineId }
    });

    if (!chaineExistante) {
      return NextResponse.json({
        success: false,
        error: 'Chaîne non trouvée'
      }, { status: 404 });
    }

    // Mise à jour de la chaîne
    const chaineModifiee = await prisma.chaine.update({
      where: { id: chaineId },
      data: {
        nom: body.nom || chaineExistante.nom,
        type: body.type || chaineExistante.type,
        channel_id: body.channel_id || chaineExistante.channel_id,
        nom_affichage: body.nom_affichage || chaineExistante.nom_affichage,
        description: body.description !== undefined ? body.description : chaineExistante.description,
        avatar_url: body.avatar_url !== undefined ? body.avatar_url : chaineExistante.avatar_url,
        url_chaine: body.url_chaine || chaineExistante.url_chaine,
        abonnes: body.abonnes !== undefined ? body.abonnes : chaineExistante.abonnes,
        videos_total: body.videos_total !== undefined ? body.videos_total : chaineExistante.videos_total,
        vues_total: body.vues_total !== undefined ? body.vues_total : chaineExistante.vues_total,
        actif: body.actif !== undefined ? body.actif : chaineExistante.actif,
        derniere_maj: new Date()
      }
    });

    console.log(`✅ Chaîne modifiée: ${chaineModifiee.nom_affichage}`);

    return NextResponse.json({
      success: true,
      data: chaineModifiee,
      message: 'Chaîne modifiée avec succès'
    });

  } catch (error) {
    console.error('Erreur modification chaîne:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la modification'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Supprimer une chaîne
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chaineId = parseInt(id);

    if (isNaN(chaineId)) {
      return NextResponse.json({
        success: false,
        error: 'ID de chaîne invalide'
      }, { status: 400 });
    }

    // Vérifier que la chaîne existe
    const chaineExistante = await prisma.chaine.findUnique({
      where: { id: chaineId }
    });

    if (!chaineExistante) {
      return NextResponse.json({
        success: false,
        error: 'Chaîne non trouvée'
      }, { status: 404 });
    }

    // Supprimer d'abord les données liées
    console.log(`🗑️ Suppression des données liées pour la chaîne: ${chaineExistante.nom_affichage}`);

    // Supprimer les vidéos
    const videosSupprimes = await prisma.video.deleteMany({
      where: { chaine_id: chaineId }
    });
    console.log(`📹 ${videosSupprimes.count} vidéos supprimées`);

    // Supprimer les lives
    const livesSupprimes = await prisma.live.deleteMany({
      where: { chaine_id: chaineId }
    });
    console.log(`🔴 ${livesSupprimes.count} lives supprimés`);

    // Supprimer les plannings
    const planningsSupprimes = await prisma.planning.deleteMany({
      where: { chaine_id: chaineId }
    });
    console.log(`📅 ${planningsSupprimes.count} plannings supprimés`);

    // Supprimer les abonnements
    const abonnementsSupprimes = await prisma.abonnement.deleteMany({
      where: { chaine_id: chaineId }
    });
    console.log(`🔔 ${abonnementsSupprimes.count} abonnements supprimés`);

    // Enfin, supprimer la chaîne
    await prisma.chaine.delete({
      where: { id: chaineId }
    });

    console.log(`✅ Chaîne supprimée: ${chaineExistante.nom_affichage}`);

    return NextResponse.json({
      success: true,
      message: `Chaîne "${chaineExistante.nom_affichage}" supprimée avec succès`,
      data: {
        chaine_supprimee: chaineExistante.nom_affichage,
        videos_supprimees: videosSupprimes.count,
        lives_supprimes: livesSupprimes.count,
        plannings_supprimes: planningsSupprimes.count,
        abonnements_supprimes: abonnementsSupprimes.count
      }
    });

  } catch (error) {
    console.error('Erreur suppression chaîne:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 