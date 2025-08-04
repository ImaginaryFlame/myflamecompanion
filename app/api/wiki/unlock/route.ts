import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Vérifier et débloquer du contenu wiki basé sur la progression
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { utilisateur_id, histoire_id } = body;

    if (!utilisateur_id || !histoire_id) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur et histoire requis'
      }, { status: 400 });
    }

    // Récupérer la progression de l'utilisateur pour cette histoire
    const progression = await prisma.progression.findUnique({
      where: {
        utilisateur_id_histoire_id: {
          utilisateur_id: parseInt(utilisateur_id),
          histoire_id: parseInt(histoire_id)
        }
      }
    });

    if (!progression) {
      return NextResponse.json({
        success: false,
        error: 'Aucune progression trouvée pour cette histoire'
      }, { status: 404 });
    }

    const chapitresLus = progression.chapitre_lu;
    const nouveauxDebloquages = [];

    // Types de contenu à vérifier
    const typesContenu = ['personnage', 'lieu', 'objet', 'anecdote', 'illustration'];

    for (const typeContenu of typesContenu) {
      let contenuTable = '';
      
      switch (typeContenu) {
        case 'personnage':
          contenuTable = 'wiki_personnage';
          break;
        case 'lieu':
          contenuTable = 'wiki_lieu';
          break;
        case 'objet':
          contenuTable = 'wiki_objet';
          break;
        case 'anecdote':
          contenuTable = 'wiki_anecdote';
          break;
        case 'illustration':
          contenuTable = 'wiki_illustration';
          break;
      }

      // Récupérer le contenu débloquable pour ce type
      const contenuDebloquable = await prisma.$queryRawUnsafe(`
        SELECT id, nom AS titre, niveau_deverrouillage, image_url
        FROM ${contenuTable}
        WHERE histoire_id = $1 
        AND niveau_deverrouillage <= $2 
        AND actif = true
        AND id NOT IN (
          SELECT contenu_id 
          FROM wiki_debloquage 
          WHERE utilisateur_id = $3 
          AND histoire_id = $1 
          AND type_contenu = $4
        )
      `, parseInt(histoire_id), chapitresLus, parseInt(utilisateur_id), typeContenu);

      // Débloquer le nouveau contenu
      for (const contenu of contenuDebloquable as any[]) {
        await prisma.wiki_debloquage.create({
          data: {
            utilisateur_id: parseInt(utilisateur_id),
            histoire_id: parseInt(histoire_id),
            type_contenu: typeContenu,
            contenu_id: contenu.id
          }
        });

        nouveauxDebloquages.push({
          type: typeContenu,
          id: contenu.id,
          titre: contenu.titre,
          image_url: contenu.image_url,
          niveau_requis: contenu.niveau_deverrouillage
        });
      }
    }

    // Attribuer des points pour les débloquages
    if (nouveauxDebloquages.length > 0) {
      // Points par débloquage
      const pointsParDebloquage = 5;
      const pointsTotaux = nouveauxDebloquages.length * pointsParDebloquage;

      // Récupérer ou créer les points de l'utilisateur
      let pointsUtilisateur = await prisma.points_utilisateur.findUnique({
        where: { utilisateur_id: parseInt(utilisateur_id) }
      });

      if (!pointsUtilisateur) {
        pointsUtilisateur = await prisma.points_utilisateur.create({
          data: {
            utilisateur_id: parseInt(utilisateur_id),
            points_totaux: 0,
            points_actuels: 0,
            niveau: 1
          }
        });
      }

      // Mettre à jour les points
      const nouveauxPointsTotaux = pointsUtilisateur.points_totaux + pointsTotaux;
      const nouveauxPointsActuels = pointsUtilisateur.points_actuels + pointsTotaux;
      const nouveauNiveau = Math.floor(nouveauxPointsTotaux / 1000) + 1;

      await prisma.points_utilisateur.update({
        where: { utilisateur_id: parseInt(utilisateur_id) },
        data: {
          points_totaux: nouveauxPointsTotaux,
          points_actuels: nouveauxPointsActuels,
          niveau: nouveauNiveau,
          derniere_maj: new Date()
        }
      });

      // Créer l'action si elle n'existe pas
      let actionDebloquage = await prisma.action_points.findFirst({
        where: { nom: 'Débloquage Wiki' }
      });

      if (!actionDebloquage) {
        actionDebloquage = await prisma.action_points.create({
          data: {
            nom: 'Débloquage Wiki',
            description: 'Débloquer du contenu wiki',
            points_accordes: pointsParDebloquage,
            type_action: 'achievement'
          }
        });
      }

      // Enregistrer dans l'historique
      await prisma.historique_points.create({
        data: {
          utilisateur_id: parseInt(utilisateur_id),
          action_id: actionDebloquage.id,
          points_gagnes: pointsTotaux,
          histoire_id: parseInt(histoire_id),
          details: {
            debloquages: nouveauxDebloquages.length,
            types: nouveauxDebloquages.map(d => d.type)
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        nouveaux_debloquages: nouveauxDebloquages,
        points_gagnes: nouveauxDebloquages.length * 5,
        chapitres_lus: chapitresLus
      },
      message: nouveauxDebloquages.length > 0 
        ? `${nouveauxDebloquages.length} nouveau(x) élément(s) wiki débloqué(s) !`
        : 'Aucun nouveau contenu à débloquer'
    });

  } catch (error) {
    console.error('Erreur débloquage wiki:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du débloquage du contenu wiki'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Récupérer le contenu wiki débloqué pour un utilisateur et une histoire
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const utilisateurId = searchParams.get('utilisateur_id');
    const histoireId = searchParams.get('histoire_id');
    const typeContenu = searchParams.get('type_contenu'); // optionnel

    if (!utilisateurId || !histoireId) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur et histoire requis'
      }, { status: 400 });
    }

    // Construire la requête de base
    let whereClause: any = {
      utilisateur_id: parseInt(utilisateurId),
      histoire_id: parseInt(histoireId)
    };

    if (typeContenu) {
      whereClause.type_contenu = typeContenu;
    }

    // Récupérer les débloquages
    const debloquages = await prisma.wiki_debloquage.findMany({
      where: whereClause,
      orderBy: { date_debloquage: 'desc' }
    });

    // Récupérer les détails de chaque contenu débloqué
    const contenuDetaille = [];

    for (const debloquage of debloquages) {
      let contenu = null;
      
      switch (debloquage.type_contenu) {
        case 'personnage':
          contenu = await prisma.wiki_personnage.findUnique({
            where: { id: debloquage.contenu_id }
          });
          break;
        case 'lieu':
          contenu = await prisma.wiki_lieu.findUnique({
            where: { id: debloquage.contenu_id }
          });
          break;
        case 'objet':
          contenu = await prisma.wiki_objet.findUnique({
            where: { id: debloquage.contenu_id }
          });
          break;
        case 'anecdote':
          contenu = await prisma.wiki_anecdote.findUnique({
            where: { id: debloquage.contenu_id }
          });
          break;
        case 'illustration':
          contenu = await prisma.wiki_illustration.findUnique({
            where: { id: debloquage.contenu_id }
          });
          break;
      }

      if (contenu) {
        contenuDetaille.push({
          ...debloquage,
          contenu: contenu
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        debloquages: contenuDetaille,
        total: contenuDetaille.length
      }
    });

  } catch (error) {
    console.error('Erreur récupération wiki débloqué:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération du contenu wiki'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}