import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Informations de démonstration
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les utilisateurs
    const utilisateurs = await prisma.utilisateur.findMany({
      take: 5,
      include: {
        progressions: {
          include: {
            histoire: {
              select: { titre: true }
            }
          }
        }
      }
    })

    // Récupérer quelques histoires
    const histoires = await prisma.histoire.findMany({
      take: 5,
      include: {
        _count: {
          select: { chapitres: true }
        }
      }
    })

    // Notifications récentes
    const notifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { date_creation: 'desc' },
      include: {
        utilisateur: { select: { nom: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        utilisateurs: utilisateurs,
        histoires: histoires,
        notifications: notifications,
        suggestions: {
          utilisateur_demo_id: utilisateurs.length > 0 ? utilisateurs[0].id : null,
          histoire_wiki_id: histoires.find(h => h.titre.includes("Fable"))?.id || histoires[0]?.id
        }
      },
      message: "Informations de démonstration récupérées"
    })

  } catch (error) {
    console.error('Erreur récupération infos démo:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}