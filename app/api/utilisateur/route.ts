import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      include: {
        progressions: true,
        notes: true,
        notifications: true
      }
    });
    return NextResponse.json({
      success: true,
      data: utilisateurs,
      count: utilisateurs.length
    });
  } catch (error) {
    console.error('Erreur Prisma:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur de base de données' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const nouvelUtilisateur = await prisma.utilisateur.create({
      data: {
        pseudo: body.pseudo,
        email: body.email,
        mot_de_passe: body.mot_de_passe || 'default_password'
      }
    });
    
    return NextResponse.json(nouvelUtilisateur, { status: 201 });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    return NextResponse.json({ error: 'Erreur de création' }, { status: 400 });
  }
}
