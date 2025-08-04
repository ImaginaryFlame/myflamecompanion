import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - API wiki simplifiée qui fonctionne avec les systèmes existants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const histoireId = searchParams.get('histoire_id')

    if (!histoireId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de l\'histoire requis' 
      }, { status: 400 })
    }

    // Récupérer l'histoire
    const histoire = await prisma.histoire.findUnique({
      where: { id: parseInt(histoireId) },
      include: {
        chapitres: {
          orderBy: { numero_chapitre: 'asc' },
          take: 10
        }
      }
    })

    if (!histoire) {
      return NextResponse.json({ 
        success: false, 
        error: 'Histoire non trouvée' 
      }, { status: 404 })
    }

    // Données wiki simulées basées sur l'histoire réelle
    const wikiData = {
      histoire: {
        id: histoire.id,
        titre: histoire.titre,
        description: histoire.description,
        auteur: histoire.auteur,
        wiki_actif: true
      },
      personnages: [
        {
          id: 1,
          nom: "Le Héros",
          description: "Protagoniste principal de l'histoire.",
          apparence: "Guerrier déterminé aux yeux perçants.",
          niveau_deverrouillage: 1,
          chapitres_apparition: [1, 2, 3, 5]
        },
        {
          id: 2,
          nom: "La Fée Sans Ailes",
          description: "Mystérieuse princesse fée.",
          apparence: "Élégante jeune femme aux cheveux argentés.",
          niveau_deverrouillage: 2,
          chapitres_apparition: [2, 4, 6]
        }
      ],
      lieux: [
        {
          id: 1,
          nom: "Royaume de Sylvania",
          description: "Le royaume des fées où se déroule l'histoire.",
          type: "royaume",
          niveau_deverrouillage: 1,
          chapitres_apparition: [1, 2, 3, 4, 5]
        },
        {
          id: 2,
          nom: "Les Basfonds",
          description: "Quartier pauvre de Sylvania.",
          type: "quartier",
          niveau_deverrouillage: 3,
          chapitres_apparition: [8, 9, 12]
        }
      ],
      objets: [
        {
          id: 1,
          nom: "Épée du Héros",
          description: "Arme légendaire du protagoniste.",
          type: "arme",
          niveau_deverrouillage: 1,
          chapitres_apparition: [1, 5, 10, 15]
        }
      ],
      anecdotes: [
        {
          id: 1,
          titre: "Le Tournoi des Princesses",
          contenu: "Événement central de l'histoire pour déterminer la prochaine reine.",
          type: "lore",
          niveau_deverrouillage: 2
        },
        {
          id: 2,
          titre: "Les Fées Sans Ailes",
          contenu: "Phénomène rare dans le royaume de Sylvania.",
          type: "secret",
          niveau_deverrouillage: 4
        }
      ],
      chapitres: histoire.chapitres,
      stats: {
        total_chapitres: histoire.chapitres.length,
        personnages_disponibles: 2,
        lieux_disponibles: 2,
        objets_disponibles: 1,
        anecdotes_disponibles: 2
      }
    }

    return NextResponse.json({
      success: true,
      data: wikiData,
      message: "Wiki chargé avec succès (version simplifiée)"
    })

  } catch (error) {
    console.error('Erreur API wiki simple:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}