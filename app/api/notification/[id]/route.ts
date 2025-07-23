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

    const notificationModifiee = await prisma.notification.update({
      where: { id },
      data: {
        lu: body.lu,
        message: body.message,
        type: body.type
      }
    });

    return NextResponse.json(notificationModifiee);
  } catch (error) {
    console.error('Erreur mise à jour notification:', error);
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

    await prisma.notification.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    return NextResponse.json({
      error: 'Erreur lors de la suppression'
    }, { status: 500 });
  }
} 