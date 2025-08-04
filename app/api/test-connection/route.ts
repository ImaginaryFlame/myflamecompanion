import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    // Test de connexion simple
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      data: {
        connection: 'OK',
        test_result: result,
        env_check: {
          database_url_present: !!process.env.DATABASE_URL,
          database_url_preview: process.env.DATABASE_URL?.substring(0, 50) + '...',
        }
      },
      message: 'Connexion base de données réussie'
    })

  } catch (error) {
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de connexion à la base de données',
      details: error.message,
      env_debug: {
        database_url_present: !!process.env.DATABASE_URL,
        database_url_preview: process.env.DATABASE_URL?.substring(0, 50) + '...',
      }
    }, { status: 500 })
  }
}