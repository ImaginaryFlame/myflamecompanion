import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        utilisateur: true
      },
      orderBy: {
        date_creation: 'desc'
      }
    });
    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur de base de données' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nouvelleNotification = await prisma.notification.create({
      data: {
        utilisateur_id: body.utilisateur_id || 1, // Par défaut utilisateur 1
        type: body.type,
        message: body.message,
        lu: body.lu || false
      }
    });

    return NextResponse.json(nouvelleNotification, { status: 201 });
  } catch (error) {
    console.error('Erreur création notification:', error);
    return NextResponse.json({ error: 'Erreur de création' }, { status: 400 });
  }
} 