import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mockHistoires, mockChapitres } from '@/lib/mock-data';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const histoires = await prisma.histoire.findMany({
      include: {
        chapitres: true,
        progressions: {
          include: {
            utilisateur: true
          }
        }
      }
    });
    return NextResponse.json({
      success: true,
      data: histoires,
      count: histoires.length
    });
  } catch (error) {
    console.error('Erreur récupération histoires:', error);
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
    
    const nouvelleHistoire = await prisma.histoire.create({
      data: {
        titre: body.titre,
        description: body.description,
        auteur: body.auteur,
        source: body.source,
        url_source: body.url_source,
        image_couverture: body.image_couverture
      }
    });
    
    return NextResponse.json(nouvelleHistoire, { status: 201 });
  } catch (error) {
    console.error('Erreur création histoire:', error);
    return NextResponse.json({ error: 'Erreur de création' }, { status: 400 });
  }
} 