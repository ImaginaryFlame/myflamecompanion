import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Mettre à jour la description d'une histoire
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const histoireId = parseInt(id);

    if (isNaN(histoireId)) {
      return NextResponse.json({
        success: false,
        error: 'ID d\'histoire invalide'
      }, { status: 400 });
    }

    const body = await request.json();
    
    if (!body.description) {
      return NextResponse.json({
        success: false,
        error: 'Description requise'
      }, { status: 400 });
    }

    // Vérifier que l'histoire existe
    const histoireExistante = await prisma.histoire.findUnique({
      where: { id: histoireId }
    });

    if (!histoireExistante) {
      return NextResponse.json({
        success: false,
        error: 'Histoire non trouvée'
      }, { status: 404 });
    }

    // Mettre à jour la description
    const histoireModifiee = await prisma.histoire.update({
      where: { id: histoireId },
      data: {
        description: body.description,
        date_modification: new Date()
      }
    });

    console.log(`✅ Description mise à jour pour: ${histoireModifiee.titre}`);

    return NextResponse.json({
      success: true,
      data: {
        id: histoireModifiee.id,
        titre: histoireModifiee.titre,
        description: histoireModifiee.description,
        date_modification: histoireModifiee.date_modification?.toISOString()
      },
      message: 'Description mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour description:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 