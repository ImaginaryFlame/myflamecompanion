import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🧹 Suppression des données de test...');

    // Supprimer les chaînes de test
    const result = await prisma.chaine.deleteMany({
      where: {
        OR: [
          { nom: { in: ['MrBeast', 'PewDiePie', 'Ninja', 'Shroud'] } },
          { nom_affichage: { in: ['MrBeast', 'PewDiePie', 'Ninja', 'Shroud'] } }
        ]
      }
    });

    console.log('✅ Données de test supprimées:', result.count, 'chaînes');

    return NextResponse.json({
      success: true,
      message: 'Données de test supprimées avec succès',
      data: {
        chainesSupprimes: result.count
      }
    });

  } catch (error) {
    console.error('❌ Erreur suppression données de test:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression des données de test'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}