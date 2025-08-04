import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Créer un utilisateur de démonstration
export async function POST(request: NextRequest) {
  try {
    // Créer un utilisateur de démo
    const utilisateurDemo = await prisma.utilisateur.create({
      data: {
        nom: "Utilisateur Démo",
        email: "demo@myflamecompanion.com",
        mot_de_passe: "demo123",
        role: "user"
      }
    })

    // Créer quelques progressions pour cet utilisateur
    const progressions = await Promise.all([
      prisma.progression.create({
        data: {
          utilisateur_id: utilisateurDemo.id,
          histoire_id: 3, // La Fable du Héros et la Fée
          chapitre_lu: 15,
          statut: "en_cours"
        }
      }),
      prisma.progression.create({
        data: {
          utilisateur_id: utilisateurDemo.id,
          histoire_id: 5, // Acte 2
          chapitre_lu: 5,
          statut: "en_cours"
        }
      })
    ])

    // Créer quelques notifications de démo (simplifiées)
    const notifications = []
    try {
      const notif1 = await prisma.notification.create({
        data: {
          utilisateur_id: utilisateurDemo.id,
          type: "nouveau_chapitre",
          message: "Nouveau chapitre disponible pour 'La Fable du Héros et la Fée' !",
          data_extra: { histoire_id: 3, chapitre_id: 50 }
        }
      })
      notifications.push(notif1)
    } catch (error) {
      console.log('Erreur création notification:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        utilisateur: utilisateurDemo,
        progressions: progressions.length,
        notifications: notifications.length
      },
      message: `Utilisateur démo créé avec l'ID ${utilisateurDemo.id}`
    })

  } catch (error) {
    console.error('Erreur création utilisateur démo:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}