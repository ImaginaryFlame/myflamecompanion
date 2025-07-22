import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      include: {
        utilisateur: true,
        chapitre: {
          include: {
            histoire: true
          }
        }
      }
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Erreur récupération notes:', error);
    return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const nouvelleNote = await prisma.note.create({
      data: {
        utilisateur_id: body.utilisateur_id,
        chapitre_id: body.chapitre_id,
        note: body.note,
        commentaire: body.commentaire
      }
    });
    
    return NextResponse.json(nouvelleNote, { status: 201 });
  } catch (error) {
    console.error('Erreur création note:', error);
    return NextResponse.json({ error: 'Erreur de création' }, { status: 400 });
  }
} 