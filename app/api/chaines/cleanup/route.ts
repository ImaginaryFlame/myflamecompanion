import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Nettoyage des chaînes - Conservation des vraies chaînes Imaginary Flame uniquement...');

    // IDs des vraies chaînes Imaginary Flame à conserver
    const chainesAConserver = [1, 2]; // YouTube Imaginary Flame (ID 1) et Twitch ImaginaryFlame (ID 2)

    // Supprimer toutes les chaînes qui ne sont pas Imaginary Flame
    const chainesSupprimes = await prisma.chaine.deleteMany({
      where: {
        id: {
          notIn: chainesAConserver
        }
      }
    });

    // Supprimer également les vidéos associées aux chaînes supprimées
    const videosSupprimes = await prisma.video.deleteMany({
      where: {
        chaine_id: {
          notIn: chainesAConserver
        }
      }
    });

    // Supprimer les autres entités liées
    const livesSupprimes = await prisma.live.deleteMany({
      where: {
        chaine_id: {
          notIn: chainesAConserver
        }
      }
    });

    const planningsSupprimes = await prisma.planning.deleteMany({
      where: {
        chaine_id: {
          notIn: chainesAConserver
        }
      }
    });

    const abonnementsSupprimes = await prisma.abonnement.deleteMany({
      where: {
        chaine_id: {
          notIn: chainesAConserver
        }
      }
    });

    // Vérifier les chaînes restantes
    const chainesRestantes = await prisma.chaine.findMany({
      orderBy: { id: 'asc' }
    });

    console.log('✅ Nettoyage terminé !');
    console.log(`📊 Résultats:
    • Chaînes supprimées: ${chainesSupprimes.count}
    • Vidéos supprimées: ${videosSupprimes.count}
    • Lives supprimés: ${livesSupprimes.count}
    • Plannings supprimés: ${planningsSupprimes.count}
    • Abonnements supprimés: ${abonnementsSupprimes.count}
    • Chaînes restantes: ${chainesRestantes.length}`);

    return NextResponse.json({
      success: true,
      data: {
        chainesSupprimes: chainesSupprimes.count,
        videosSupprimes: videosSupprimes.count,
        livesSupprimes: livesSupprimes.count,
        planningsSupprimes: planningsSupprimes.count,
        abonnementsSupprimes: abonnementsSupprimes.count,
        chainesRestantes: chainesRestantes.map(c => ({
          id: c.id,
          nom: c.nom_affichage,
          type: c.type,
          abonnes: c.abonnes,
          videos_total: c.videos_total
        }))
      },
      message: `Nettoyage terminé: ${chainesSupprimes.count} chaînes de test supprimées, ${chainesRestantes.length} chaînes Imaginary Flame conservées`
    });

  } catch (error) {
    console.error('Erreur nettoyage chaînes:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du nettoyage des chaînes'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}