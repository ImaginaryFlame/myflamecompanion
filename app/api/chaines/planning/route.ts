import { NextRequest, NextResponse } from 'next/server';

// Mock en mémoire (à remplacer par une vraie base de données)
let planning: any[] = [];

export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true, data: planning });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validation simple
    if (!body.titre || !body.date_debut || !body.date_fin || !body.type) {
      return NextResponse.json({ success: false, error: 'Champs obligatoires manquants' }, { status: 400 });
    }
    const item = {
      ...body,
      statut: 'planifie',
      id: Date.now() + Math.floor(Math.random() * 10000),
    };
    planning.push(item);
    return NextResponse.json({ success: true, data: item });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 });
    }
    
    const index = planning.findIndex(item => item.id.toString() === id.toString());
    
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Planning non trouvé' }, { status: 404 });
    }
    
    planning.splice(index, 1);
    return NextResponse.json({ success: true, message: 'Planning supprimé avec succès' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
} 