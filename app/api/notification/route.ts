import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mockNotifications } from '@/lib/mock-data';

const prisma = new PrismaClient();

export async function GET() {
  try {
    let notifications = [];
    
    try {
      notifications = await prisma.notification.findMany({
        orderBy: {
          date_creation: 'desc'
        }
      });
    } catch (dbError) {
      throw dbError; // Remonter l'erreur pour traitement global
    }
    
    // Formater les notifications pour correspondre à l'interface frontend
    const notificationsFormatees = notifications.map(notif => ({
      id: notif.id,
      type: notif.type,
      message: notif.message,
      lu: notif.lu,
      date: notif.date_creation.toISOString(),
      titre: notif.titre
    }));
    
    return NextResponse.json({
      success: true,
      data: notificationsFormatees,
      count: notificationsFormatees.length
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur de connexion à la base de données',
      data: [],
      count: 0
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