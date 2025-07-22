import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const progressions = await prisma.progression.findMany({
      include: {
        utilisateur: true,
        histoire: {
          include: {
            chapitres: true
          }
        }
      }
    });
    return NextResponse.json(progressions);
  } catch (error) {
    console.error('Erreur récupération progressions:', error);
    return NextResponse.json({ error: 'Erreur de base de données' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Vérifier si une progression existe déjà pour cet utilisateur et cette histoire
    const progressionExistante = await prisma.progression.findFirst({
      where: {
        utilisateur_id: body.utilisateur_id,
        histoire_id: body.histoire_id
      }
    });

    if (progressionExistante) {
      // Mettre à jour la progression existante
      const progressionMiseAJour = await prisma.progression.update({
        where: { id: progressionExistante.id },
        data: {
          dernier_chapitre_lu: body.dernier_chapitre_lu,
          date_mise_a_jour: new Date()
        }
      });
      return NextResponse.json(progressionMiseAJour);
    } else {
      // Créer une nouvelle progression
      const nouvelleProgression = await prisma.progression.create({
        data: {
          utilisateur_id: body.utilisateur_id,
          histoire_id: body.histoire_id,
          dernier_chapitre_lu: body.dernier_chapitre_lu
        }
      });
      return NextResponse.json(nouvelleProgression, { status: 201 });
    }
  } catch (error) {
    console.error('Erreur création/mise à jour progression:', error);
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 400 });
  }
} 