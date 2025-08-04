import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Vérifier le schéma de la table histoire
export async function GET(request: NextRequest) {
  try {
    // Vérifier les colonnes de la table histoire
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'histoire' 
      ORDER BY ordinal_position;
    `

    return NextResponse.json({
      success: true,
      data: result,
      message: "Schéma de la table histoire"
    })

  } catch (error) {
    console.error('Erreur vérification schéma:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Ajouter le champ wiki_actif à la table histoire
export async function POST(request: NextRequest) {
  try {
    // Ajouter la colonne wiki_actif si elle n'existe pas
    await prisma.$executeRaw`
      ALTER TABLE histoire 
      ADD COLUMN IF NOT EXISTS wiki_actif BOOLEAN NOT NULL DEFAULT FALSE;
    `

    // Activer le wiki pour l'histoire 1
    await prisma.$executeRaw`
      UPDATE histoire SET wiki_actif = TRUE WHERE id = 1;
    `

    return NextResponse.json({
      success: true,
      message: "Colonne wiki_actif ajoutée et activée pour l'histoire 1"
    })

  } catch (error) {
    console.error('Erreur modification schéma:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}