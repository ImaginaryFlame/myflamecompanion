import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Activer le wiki pour une histoire
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { histoire_id } = body

    if (!histoire_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de l\'histoire requis' 
      }, { status: 400 })
    }

    // Activer le wiki pour cette histoire
    const histoireMiseAJour = await prisma.histoire.update({
      where: { id: parseInt(histoire_id) },
      data: { wiki_actif: true }
    })

    return NextResponse.json({
      success: true,
      data: histoireMiseAJour,
      message: `Wiki activé pour l'histoire "${histoireMiseAJour.titre}"`
    })

  } catch (error) {
    console.error('Erreur activation wiki:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}