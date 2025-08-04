import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Actions prédéfinies pour attribuer des points
const DEFAULT_ACTIONS = [
  { nom: 'Lecture Chapitre', description: 'Terminer la lecture d\'un chapitre', points_accordes: 10, type_action: 'lecture' },
  { nom: 'Progression 25%', description: 'Atteindre 25% de progression dans une histoire', points_accordes: 50, type_action: 'progression' },
  { nom: 'Progression 50%', description: 'Atteindre 50% de progression dans une histoire', points_accordes: 100, type_action: 'progression' },
  { nom: 'Progression 75%', description: 'Atteindre 75% de progression dans une histoire', points_accordes: 150, type_action: 'progression' },
  { nom: 'Histoire Terminée', description: 'Terminer complètement une histoire', points_accordes: 300, type_action: 'completion' },
  { nom: 'Première Histoire', description: 'Terminer sa première histoire', points_accordes: 500, type_action: 'achievement' },
  { nom: 'Lecteur Assidu', description: 'Lire pendant 7 jours consécutifs', points_accordes: 200, type_action: 'achievement' },
  { nom: 'Marathon Lecture', description: 'Lire 10 chapitres en une journée', points_accordes: 150, type_action: 'achievement' },
  { nom: 'Explorateur Wiki', description: 'Débloquer 10 éléments wiki', points_accordes: 100, type_action: 'achievement' },
  { nom: 'Maître Lecteur', description: 'Atteindre 10000 points totaux', points_accordes: 1000, type_action: 'achievement' }
];

// Initialiser les actions par défaut
async function initializeDefaultActions() {
  try {
    for (const action of DEFAULT_ACTIONS) {
      await prisma.action_points.upsert({
        where: { nom: action.nom },
        update: {},
        create: action
      });
    }
  } catch (error) {
    console.error('Erreur initialisation actions par défaut:', error);
  }
}

// GET - Récupérer les points d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const utilisateurId = searchParams.get('utilisateur_id');

    if (!utilisateurId) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur requis'
      }, { status: 400 });
    }

    // Récupérer ou créer les points de l'utilisateur
    let pointsUtilisateur = await prisma.points_utilisateur.findUnique({
      where: { utilisateur_id: parseInt(utilisateurId) },
      include: {
        utilisateur: {
          select: { nom: true, email: true }
        }
      }
    });

    if (!pointsUtilisateur) {
      pointsUtilisateur = await prisma.points_utilisateur.create({
        data: {
          utilisateur_id: parseInt(utilisateurId),
          points_totaux: 0,
          points_actuels: 0,
          niveau: 1
        },
        include: {
          utilisateur: {
            select: { nom: true, email: true }
          }
        }
      });
    }

    // Récupérer l'historique récent des points
    const historiqueRecent = await prisma.historique_points.findMany({
      where: { utilisateur_id: parseInt(utilisateurId) },
      orderBy: { date_gain: 'desc' },
      take: 10,
      include: {
        action: true
      }
    });

    // Calculer le niveau basé sur les points totaux
    const niveau = Math.floor(pointsUtilisateur.points_totaux / 1000) + 1;
    const pointsPourProchainNiveau = (niveau * 1000) - pointsUtilisateur.points_totaux;

    // Récupérer le titre correspondant au niveau
    const titreNiveau = await prisma.niveau_titre.findFirst({
      where: {
        niveau_requis: { lte: niveau },
        actif: true
      },
      orderBy: { niveau_requis: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        points: pointsUtilisateur,
        niveau_calcule: niveau,
        points_pour_prochain_niveau: pointsPourProchainNiveau,
        titre_niveau: titreNiveau,
        historique_recent: historiqueRecent
      }
    });

  } catch (error) {
    console.error('Erreur récupération points:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des points'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Attribuer des points à un utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { utilisateur_id, action_nom, histoire_id, chapitre_id, details } = body;

    if (!utilisateur_id || !action_nom) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur et nom d\'action requis'
      }, { status: 400 });
    }

    // Initialiser les actions par défaut si nécessaire
    await initializeDefaultActions();

    // Récupérer l'action
    const action = await prisma.action_points.findFirst({
      where: { nom: action_nom, actif: true }
    });

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action non trouvée'
      }, { status: 404 });
    }

    // Vérifier si l'action a déjà été effectuée (pour certains types)
    if (['completion', 'achievement'].includes(action.type_action)) {
      const dejaFait = await prisma.historique_points.findFirst({
        where: {
          utilisateur_id: parseInt(utilisateur_id),
          action_id: action.id,
          histoire_id: histoire_id ? parseInt(histoire_id) : undefined
        }
      });

      if (dejaFait) {
        return NextResponse.json({
          success: false,
          error: 'Cette récompense a déjà été obtenue'
        }, { status: 400 });
      }
    }

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

    // Ajouter les points
    const nouveauxPointsTotaux = pointsUtilisateur.points_totaux + action.points_accordes;
    const nouveauxPointsActuels = pointsUtilisateur.points_actuels + action.points_accordes;
    const nouveauNiveau = Math.floor(nouveauxPointsTotaux / 1000) + 1;

    // Mise à jour des points
    const pointsMisAJour = await prisma.points_utilisateur.update({
      where: { utilisateur_id: parseInt(utilisateur_id) },
      data: {
        points_totaux: nouveauxPointsTotaux,
        points_actuels: nouveauxPointsActuels,
        niveau: nouveauNiveau,
        derniere_maj: new Date()
      }
    });

    // Enregistrer dans l'historique
    const historiqueEntry = await prisma.historique_points.create({
      data: {
        utilisateur_id: parseInt(utilisateur_id),
        action_id: action.id,
        points_gagnes: action.points_accordes,
        histoire_id: histoire_id ? parseInt(histoire_id) : null,
        chapitre_id: chapitre_id ? parseInt(chapitre_id) : null,
        details: details || null
      },
      include: {
        action: true
      }
    });

    // Vérifier si nouveau niveau atteint
    const niveauPrecedent = Math.floor(pointsUtilisateur.points_totaux / 1000) + 1;
    const niveauUp = nouveauNiveau > niveauPrecedent;

    return NextResponse.json({
      success: true,
      data: {
        points_mis_a_jour: pointsMisAJour,
        historique_entry: historiqueEntry,
        points_gagnes: action.points_accordes,
        niveau_up: niveauUp,
        nouveau_niveau: nouveauNiveau
      },
      message: `+${action.points_accordes} points pour "${action.nom}" !`
    });

  } catch (error) {
    console.error('Erreur attribution points:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'attribution des points'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}