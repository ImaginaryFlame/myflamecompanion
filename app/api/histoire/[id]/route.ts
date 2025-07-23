import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const histoire = await prisma.histoire.findUnique({
      where: { id },
      include: {
        chapitres: true,
        progressions: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    if (!histoire) {
      return NextResponse.json({ 
        success: false, 
        error: 'Histoire non trouvée' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: histoire
    });
  } catch (error) {
    console.error('Erreur récupération histoire:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur de base de données' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
  try {
    const body = await request.json();

    console.log(`🔄 API PUT /histoire/${id} - Données reçues:`, body);

    if (isNaN(id)) {
      console.error(`❌ API PUT /histoire/${idParam} - ID invalide`);
      return NextResponse.json({ 
        success: false,
        error: 'ID invalide' 
      }, { status: 400 });
    }

    // Validation des champs requis
    if (!body.titre || !body.auteur) {
      console.error(`❌ API PUT /histoire/${id} - Champs requis manquants`);
      return NextResponse.json({ 
        success: false,
        error: 'Titre et auteur sont requis' 
      }, { status: 400 });
    }

    const histoireModifiee = await prisma.histoire.update({
      where: { id },
      data: {
        titre: body.titre,
        description: body.description,
        auteur: body.auteur,
        source: body.source,
        url_source: body.url_source,
        image_couverture: body.image_couverture
        // urls_multiples: body.urls_multiples // Temporairement commenté jusqu'à ce que Prisma soit régénéré
      }
    });

    console.log(`✅ API PUT /histoire/${id} - Succès`);

    return NextResponse.json({
      success: true,
      data: histoireModifiee
    });
  } catch (error) {
    console.error(`💥 API PUT /histoire/${idParam} - Erreur:`, error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Supprimer d'abord tous les éléments liés (cascade)
    console.log(`🗑️ Suppression de l'histoire ID ${id} et de ses dépendances...`);

    // Supprimer les notes liées aux chapitres de cette histoire
    await prisma.note.deleteMany({
      where: {
        chapitre: {
          histoire_id: id
        }
      }
    });

    // Supprimer les progressions liées à cette histoire
    await prisma.progression.deleteMany({
      where: {
        histoire_id: id
      }
    });

    // Supprimer tous les chapitres de cette histoire
    await prisma.chapitre.deleteMany({
      where: {
        histoire_id: id
      }
    });

    // Enfin, supprimer l'histoire elle-même
    const histoireSupprimee = await prisma.histoire.delete({
      where: { id }
    });

    console.log(`✅ Histoire "${histoireSupprimee.titre}" supprimée avec succès`);

    return NextResponse.json({ 
      message: 'Histoire supprimée avec succès',
      histoire: {
        id: histoireSupprimee.id,
        titre: histoireSupprimee.titre
      }
    });
  } catch (error) {
    console.error('Erreur suppression histoire:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 