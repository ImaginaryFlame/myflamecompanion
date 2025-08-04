import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const chapitreModifie = await prisma.chapitre.update({
      where: { id },
      data: {
        titre_chapitre: body.titre,
        contenu: body.contenu,
        numero_chapitre: body.numero
      }
    });

    return NextResponse.json(chapitreModifie);
  } catch (error) {
    console.error('Erreur mise à jour chapitre:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour' 
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

    await prisma.chapitre.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Chapitre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression chapitre:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression' 
    }, { status: 500 });
  }
} 