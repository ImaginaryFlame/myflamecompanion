import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
    return NextResponse.json(histoires);
  } catch (error) {
    console.error('Erreur récupération histoires:', error);
    return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
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