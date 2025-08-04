import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer les données wiki d'une histoire
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const histoireId = searchParams.get('histoire_id')
    const type = searchParams.get('type') // "personnage", "lieu", "objet", "anecdote", "race", "faction", "evenement"
    const utilisateurId = searchParams.get('utilisateur_id')

    if (!histoireId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de l\'histoire requis' 
      }, { status: 400 })
    }

    // Vérifier si le wiki est actif pour cette histoire
    const histoire = await prisma.histoire.findUnique({
      where: { id: parseInt(histoireId) },
      select: { wiki_actif: true, titre: true }
    })

    if (!histoire) {
      return NextResponse.json({ 
        success: false, 
        error: 'Histoire non trouvée' 
      }, { status: 404 })
    }

    if (!histoire.wiki_actif) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wiki non activé pour cette histoire' 
      }, { status: 403 })
    }

    // Si un utilisateur est spécifié, récupérer ses débloquages
    let debloquages: any[] = []
    if (utilisateurId) {
      debloquages = await prisma.wiki_debloquage.findMany({
        where: {
          utilisateur_id: parseInt(utilisateurId),
          histoire_id: parseInt(histoireId)
        }
      })
    }

    // Fonction pour filtrer le contenu selon les débloquages
    const filtrerContenu = (contenu: any[], typeContenu: string) => {
      if (!utilisateurId) return contenu

      return contenu.filter(item => {
        // Vérifier si l'utilisateur a débloqué ce contenu
        const estDebloque = debloquages.some(d => 
          d.type_contenu === typeContenu && d.contenu_id === item.id
        )
        
        // Ou si le niveau de déverrouillage est 1 (toujours accessible)
        return estDebloque || item.niveau_deverrouillage <= 1
      })
    }

    // Récupérer le contenu selon le type
    let data: any = {}

    if (!type || type === 'all') {
      // Récupérer tout le contenu wiki disponible
      try {
        const [personnages, lieux, objets, anecdotes, illustrations] = await Promise.all([
          prisma.wiki_personnage.findMany({
            where: { histoire_id: parseInt(histoireId), actif: true },
            orderBy: { niveau_deverrouillage: 'asc' }
          }).catch(() => []),
          prisma.wiki_lieu.findMany({
            where: { histoire_id: parseInt(histoireId), actif: true },
            orderBy: { niveau_deverrouillage: 'asc' }
          }).catch(() => []),
          prisma.wiki_objet.findMany({
            where: { histoire_id: parseInt(histoireId), actif: true },
            orderBy: { niveau_deverrouillage: 'asc' }
          }).catch(() => []),
          prisma.wiki_anecdote.findMany({
            where: { histoire_id: parseInt(histoireId), actif: true },
            orderBy: { niveau_deverrouillage: 'asc' }
          }).catch(() => []),
          prisma.wiki_illustration.findMany({
            where: { histoire_id: parseInt(histoireId), actif: true },
            orderBy: { niveau_deverrouillage: 'asc' }
          }).catch(() => [])
        ])

        data = {
          personnages: filtrerContenu(personnages, 'personnage'),
          lieux: filtrerContenu(lieux, 'lieu'),
          objets: filtrerContenu(objets, 'objet'),
          anecdotes: filtrerContenu(anecdotes, 'anecdote'),
          illustrations: filtrerContenu(illustrations, 'illustration')
        }
      } catch (error) {
        console.error('Erreur récupération contenu wiki:', error)
        data = {
          personnages: [],
          lieux: [],
          objets: [],
          anecdotes: [],
          illustrations: []
        }
      }
    } else {
      // Récupérer un type spécifique
      const tableMap: any = {
        'personnage': 'wiki_personnage',
        'lieu': 'wiki_lieu',
        'objet': 'wiki_objet',
        'anecdote': 'wiki_anecdote',
        'race': 'wiki_race',
        'faction': 'wiki_faction',
        'evenement': 'wiki_evenement',
        'illustration': 'wiki_illustration'
      }

      const tableName = tableMap[type]
      if (!tableName) {
        return NextResponse.json({ 
          success: false, 
          error: 'Type de contenu invalide' 
        }, { status: 400 })
      }

      const contenu = await (prisma as any)[tableName].findMany({
        where: { histoire_id: parseInt(histoireId), actif: true },
        orderBy: { niveau_deverrouillage: 'asc' }
      })

      data = filtrerContenu(contenu, type)
    }

    return NextResponse.json({
      success: true,
      data: data,
      histoire: {
        titre: histoire.titre,
        wiki_actif: histoire.wiki_actif
      },
      utilisateur_connecte: !!utilisateurId,
      total_debloquages: debloquages.length
    })

  } catch (error) {
    console.error('Erreur API wiki:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Ajouter du contenu au wiki (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      histoire_id, 
      type, 
      data: contenuData,
      admin_key 
    } = body

    // Vérification admin simple (tu peux améliorer ça)
    if (admin_key !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        success: false, 
        error: 'Accès non autorisé' 
      }, { status: 403 })
    }

    if (!histoire_id || !type || !contenuData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Données manquantes' 
      }, { status: 400 })
    }

    // Vérifier que l'histoire existe et activer le wiki si nécessaire
    const histoire = await prisma.histoire.findUnique({
      where: { id: histoire_id }
    })

    if (!histoire) {
      return NextResponse.json({ 
        success: false, 
        error: 'Histoire non trouvée' 
      }, { status: 404 })
    }

    // Activer le wiki pour cette histoire si pas déjà fait
    if (!histoire.wiki_actif) {
      await prisma.histoire.update({
        where: { id: histoire_id },
        data: { wiki_actif: true }
      })
    }

    // Ajouter le contenu selon le type
    const tableMap: any = {
      'personnage': 'wiki_personnage',
      'lieu': 'wiki_lieu',
      'objet': 'wiki_objet',
      'anecdote': 'wiki_anecdote',
      'race': 'wiki_race',
      'faction': 'wiki_faction',
      'evenement': 'wiki_evenement',
      'illustration': 'wiki_illustration'
    }

    const tableName = tableMap[type]
    if (!tableName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Type de contenu invalide' 
      }, { status: 400 })
    }

    const nouveauContenu = await (prisma as any)[tableName].create({
      data: {
        histoire_id,
        ...contenuData
      }
    })

    return NextResponse.json({
      success: true,
      data: nouveauContenu,
      message: `${type} ajouté avec succès au wiki`
    })

  } catch (error) {
    console.error('Erreur création contenu wiki:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}