import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    console.log('🤖 Début de la vérification automatique de toutes les histoires...');

    // Récupérer toutes les histoires avec leur URL source
    const histoires = await prisma.histoire.findMany({
      where: {
        url_source: {
          not: null
        }
      },
      include: {
        chapitres: {
          orderBy: { numero: 'asc' }
        }
      }
    });

    console.log(`📚 ${histoires.length} histoires trouvées à vérifier`);

    let totalNouveauxChapitres = 0;
    const resultats = [];

    for (const histoire of histoires) {
      try {
        console.log(`🔍 Vérification: ${histoire.titre}...`);

        // Appeler l'API de scraping intelligent en mode vérification
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scraping/wattpad-smart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: histoire.url_source,
            verificationMaj: true
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.chapitres.nouveaux > 0) {
            console.log(`🎉 ${data.chapitres.nouveaux} nouveaux chapitres pour "${histoire.titre}"`);
            
            // Créer une notification pour l'utilisateur
            await creerNotification(
              histoire.id,
              `🆕 ${data.chapitres.nouveaux} nouveau${data.chapitres.nouveaux > 1 ? 'x' : ''} chapitre${data.chapitres.nouveaux > 1 ? 's' : ''} disponible${data.chapitres.nouveaux > 1 ? 's' : ''} pour "${histoire.titre}" !`,
              'nouveau_chapitre'
            );

            totalNouveauxChapitres += data.chapitres.nouveaux;
          }

          resultats.push({
            histoire: histoire.titre,
            nouveaux: data.chapitres.nouveaux,
            total: data.chapitres.total,
            statut: 'success'
          });

        } else {
          console.log(`❌ Erreur pour "${histoire.titre}"`);
          resultats.push({
            histoire: histoire.titre,
            nouveaux: 0,
            statut: 'error'
          });
        }

        // Pause entre les vérifications pour éviter de surcharger les serveurs
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Erreur pour ${histoire.titre}:`, error);
        resultats.push({
          histoire: histoire.titre,
          nouveaux: 0,
          statut: 'error'
        });
      }
    }

    // Créer une notification de résumé si des nouveautés ont été trouvées
    if (totalNouveauxChapitres > 0) {
      await creerNotificationGlobale(
        `🎊 Vérification terminée ! ${totalNouveauxChapitres} nouveaux chapitres détectés au total !`,
        'verification_complete'
      );
    }

    console.log(`✅ Vérification automatique terminée - ${totalNouveauxChapitres} nouveaux chapitres au total`);

    return NextResponse.json({
      success: true,
      message: `Vérification automatique terminée`,
      totalHistoires: histoires.length,
      totalNouveauxChapitres,
      resultats
    });

  } catch (error) {
    console.error('Erreur vérification automatique:', error);
    return NextResponse.json({
      error: 'Erreur lors de la vérification automatique',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Fonction pour créer une notification spécifique à une histoire
async function creerNotification(histoireId: number, message: string, type: string) {
  try {
    // Pour l'instant, on crée une notification générale
    // Plus tard on pourra l'associer à des utilisateurs spécifiques
    await prisma.notification.create({
      data: {
        utilisateur_id: 1, // TODO: Gérer les utilisateurs multiples
        type: type,
        message: message,
        lu: false
      }
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
  }
}

// Fonction pour créer une notification globale
async function creerNotificationGlobale(message: string, type: string) {
  try {
    await prisma.notification.create({
      data: {
        utilisateur_id: 1, // TODO: Gérer les utilisateurs multiples
        type: type,
        message: message,
        lu: false
      }
    });
  } catch (error) {
    console.error('Erreur création notification globale:', error);
  }
}

// Endpoint GET pour déclencher manuellement
export async function GET() {
  return POST(new Request('http://localhost:3000/api/auto-check', { method: 'POST' }));
} 