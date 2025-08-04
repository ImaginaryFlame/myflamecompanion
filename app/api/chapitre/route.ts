import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const chapitres = await prisma.chapitre.findMany({
      include: {
        histoire: true,
        progressions: true
      }
    });
    return NextResponse.json({
      success: true,
      data: chapitres,
      count: chapitres.length
    });
  } catch (error) {
    console.error('Erreur récupération chapitres:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur de base de données' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const nouveauChapitre = await prisma.chapitre.create({
      data: {
        histoire_id: body.histoire_id,
        titre_chapitre: body.titre,
        numero_chapitre: body.numero,
        contenu: body.contenu
      }
    });
    
    return NextResponse.json(nouveauChapitre, { status: 201 });
  } catch (error) {
    console.error('Erreur création chapitre:', error);
    return NextResponse.json({ error: 'Erreur de création' }, { status: 400 });
  }
} 