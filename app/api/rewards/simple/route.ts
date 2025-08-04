import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - API récompenses simplifiée
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const utilisateurId = searchParams.get('utilisateur_id')

    if (!utilisateurId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID utilisateur requis' 
      }, { status: 400 })
    }

    // Récupérer l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(utilisateurId) }
    })

    if (!utilisateur) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    // Récupérer les progressions de l'utilisateur
    const progressions = await prisma.progression.findMany({
      where: { utilisateur_id: parseInt(utilisateurId) },
      include: {
        histoire: true
      }
    })

    // Calculer les statistiques de base
    const stats = {
      chapitres_lus: progressions.reduce((total, prog) => total + prog.chapitre_lu, 0),
      histoires_en_cours: progressions.filter(p => p.statut === 'en_cours').length,
      histoires_terminees: progressions.filter(p => p.statut === 'termine').length,
      total_histoires: progressions.length
    }

    // Système de points simulé basé sur l'activité
    const pointsParChapitre = 10
    const pointsParHistoireTerminee = 100
    const bonusActivite = 50

    const pointsCalcules = {
      points_lecture: stats.chapitres_lus * pointsParChapitre,
      points_completion: stats.histoires_terminees * pointsParHistoireTerminee,
      bonus_activite: stats.total_histoires > 0 ? bonusActivite : 0
    }

    const pointsTotaux = pointsCalcules.points_lecture + pointsCalcules.points_completion + pointsCalcules.bonus_activite
    const niveau = Math.floor(pointsTotaux / 1000) + 1
    const pointsPourProchainNiveau = (niveau * 1000) - pointsTotaux

    // Niveaux et titres
    const titres = [
      { niveau: 1, nom: "Lecteur Débutant", icone: "📖", couleur: "#3B82F6" },
      { niveau: 5, nom: "Explorateur", icone: "🔍", couleur: "#10B981" },
      { niveau: 10, nom: "Érudit", icone: "🎓", couleur: "#8B5CF6" },
      { niveau: 20, nom: "Maître Lecteur", icone: "👑", couleur: "#F59E0B" },
      { niveau: 50, nom: "Légende Vivante", icone: "⭐", couleur: "#EF4444" }
    ]

    const titreActuel = titres.reverse().find(t => niveau >= t.niveau) || titres[0]

    // Récupérer quelques notifications récentes
    const notifications = await prisma.notification.findMany({
      where: { utilisateur_id: parseInt(utilisateurId) },
      orderBy: { date_creation: 'desc' },
      take: 5
    })

    const recompensesData = {
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email
      },
      points: {
        points_totaux: pointsTotaux,
        points_actuels: pointsTotaux,
        niveau: niveau,
        titre_actuel: titreActuel,
        points_pour_prochain_niveau: pointsPourProchainNiveau,
        progression_niveau: Math.round((pointsTotaux % 1000) / 10)
      },
      statistiques: stats,
      detail_points: pointsCalcules,
      historique_recent: [
        {
          action: "Lecture de chapitre",
          points: pointsParChapitre,
          date: new Date().toISOString(),
          details: "Progression dans une histoire"
        }
      ],
      notifications_recentes: notifications,
      achievements: [
        {
          nom: "Premier Pas",
          description: "Commencer sa première histoire",
          debloque: stats.total_histoires > 0,
          icone: "🚀"
        },
        {
          nom: "Lecteur Assidu",
          description: "Lire plus de 10 chapitres",
          debloque: stats.chapitres_lus >= 10,
          icone: "📚"
        },
        {
          nom: "Finisseur",  
          description: "Terminer une histoire complète",
          debloque: stats.histoires_terminees > 0,
          icone: "🏆"
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: recompensesData,
      message: "Système de récompenses chargé avec succès"
    })

  } catch (error) {
    console.error('Erreur API récompenses simple:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Simuler l'attribution de points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { utilisateur_id, action, histoire_id, chapitre_id } = body

    if (!utilisateur_id || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur ID et action requis' 
      }, { status: 400 })
    }

    // Points selon l'action
    const actionPoints: any = {
      'lecture_chapitre': 10,
      'histoire_terminee': 100,
      'premiere_histoire': 200,
      'wiki_unlock': 5
    }

    const pointsGagnes = actionPoints[action] || 10

    // Créer une notification de récompense (optionnelle)
    try {
      await prisma.$executeRaw`
        INSERT INTO notification (utilisateur_id, type, message, data_extra) 
        VALUES (${parseInt(utilisateur_id)}, 'recompense', 
                ${`Vous avez gagné ${pointsGagnes} points pour "${action}" !`}, 
                ${JSON.stringify({ points: pointsGagnes, action: action })}::jsonb)
      `
    } catch (notifError) {
      console.log('Erreur création notification:', notifError)
      // Continuer même si la notification échoue
    }

    return NextResponse.json({
      success: true,
      data: {
        points_gagnes: pointsGagnes,
        action: action,
        message: `+${pointsGagnes} points !`
      },
      message: `Récompense accordée : +${pointsGagnes} points pour ${action}`
    })

  } catch (error) {
    console.error('Erreur attribution récompense:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}