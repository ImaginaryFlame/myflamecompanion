import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer tout le contenu wiki pour une histoire
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const histoireId = searchParams.get('histoire_id');
    const utilisateurId = searchParams.get('utilisateur_id'); // pour savoir ce qui est débloqué
    const typeContenu = searchParams.get('type_contenu'); // optionnel

    if (!histoireId) {
      return NextResponse.json({
        success: false,
        error: 'ID histoire requis'
      }, { status: 400 });
    }

    const contenuWiki: any = {};

    // Types de contenu à récupérer
    const types = typeContenu ? [typeContenu] : ['personnage', 'lieu', 'objet', 'anecdote', 'illustration'];

    for (const type of types) {
      switch (type) {
        case 'personnage':
          contenuWiki.personnages = await prisma.wiki_personnage.findMany({
            where: { 
              histoire_id: parseInt(histoireId),
              actif: true
            },
            orderBy: { niveau_deverrouillage: 'asc' }
          });
          break;

        case 'lieu':
          contenuWiki.lieux = await prisma.wiki_lieu.findMany({
            where: { 
              histoire_id: parseInt(histoireId),
              actif: true
            },
            orderBy: { niveau_deverrouillage: 'asc' }
          });
          break;

        case 'objet':
          contenuWiki.objets = await prisma.wiki_objet.findMany({
            where: { 
              histoire_id: parseInt(histoireId),
              actif: true
            },
            orderBy: { niveau_deverrouillage: 'asc' }
          });
          break;

        case 'anecdote':
          contenuWiki.anecdotes = await prisma.wiki_anecdote.findMany({
            where: { 
              histoire_id: parseInt(histoireId),
              actif: true
            },
            orderBy: { niveau_deverrouillage: 'asc' }
          });
          break;

        case 'illustration':
          contenuWiki.illustrations = await prisma.wiki_illustration.findMany({
            where: { 
              histoire_id: parseInt(histoireId),
              actif: true
            },
            orderBy: { niveau_deverrouillage: 'asc' }
          });
          break;
      }
    }

    // Si un utilisateur est spécifié, marquer ce qui est débloqué
    if (utilisateurId) {
      const debloquages = await prisma.wiki_debloquage.findMany({
        where: {
          utilisateur_id: parseInt(utilisateurId),
          histoire_id: parseInt(histoireId)
        }
      });

      const debloquagesMap = new Map();
      debloquages.forEach(d => {
        const key = `${d.type_contenu}_${d.contenu_id}`;
        debloquagesMap.set(key, d.date_debloquage);
      });

      // Marquer le contenu comme débloqué ou non
      Object.keys(contenuWiki).forEach(typeKey => {
        contenuWiki[typeKey] = contenuWiki[typeKey].map((item: any) => {
          const typeSimple = typeKey === 'personnages' ? 'personnage' :
                            typeKey === 'lieux' ? 'lieu' :
                            typeKey === 'objets' ? 'objet' :
                            typeKey === 'anecdotes' ? 'anecdote' :
                            'illustration';
          
          const key = `${typeSimple}_${item.id}`;
          const dateDebloquage = debloquagesMap.get(key);
          
          return {
            ...item,
            debloque: !!dateDebloquage,
            date_debloquage: dateDebloquage || null
          };
        });
      });
    }

    // Statistiques du wiki
    const stats = {
      total_personnages: contenuWiki.personnages?.length || 0,
      total_lieux: contenuWiki.lieux?.length || 0,
      total_objets: contenuWiki.objets?.length || 0,
      total_anecdotes: contenuWiki.anecdotes?.length || 0,
      total_illustrations: contenuWiki.illustrations?.length || 0
    };

    if (utilisateurId) {
      const totalDebloque = Object.values(contenuWiki).flat().filter((item: any) => item.debloque).length;
      const totalDisponible = Object.values(contenuWiki).flat().length;
      
      stats.total_debloque = totalDebloque;
      stats.total_disponible = totalDisponible;
      stats.pourcentage_debloque = totalDisponible > 0 ? Math.round((totalDebloque / totalDisponible) * 100) : 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        wiki: contenuWiki,
        stats: stats
      }
    });

  } catch (error) {
    console.error('Erreur récupération contenu wiki:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération du contenu wiki'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Créer du nouveau contenu wiki
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      histoire_id, 
      type_contenu, 
      nom, 
      titre, 
      description, 
      niveau_deverrouillage,
      image_url,
      ...autresChamps 
    } = body;

    if (!histoire_id || !type_contenu || (!nom && !titre)) {
      return NextResponse.json({
        success: false,
        error: 'Histoire ID, type de contenu et nom/titre requis'
      }, { status: 400 });
    }

    let nouveauContenu = null;

    switch (type_contenu) {
      case 'personnage':
        nouveauContenu = await prisma.wiki_personnage.create({
          data: {
            histoire_id: parseInt(histoire_id),
            nom: nom || titre,
            description,
            niveau_deverrouillage: niveau_deverrouillage || 1,
            image_url,
            apparence: autresChamps.apparence,
            personnalite: autresChamps.personnalite,
            background: autresChamps.background,
            anecdotes: autresChamps.anecdotes,
            chapitres_apparition: autresChamps.chapitres_apparition
          }
        });
        break;

      case 'lieu':
        nouveauContenu = await prisma.wiki_lieu.create({
          data: {
            histoire_id: parseInt(histoire_id),
            nom: nom || titre,
            description,
            niveau_deverrouillage: niveau_deverrouillage || 1,
            image_url,
            histoire_lieu: autresChamps.histoire_lieu,
            anecdotes: autresChamps.anecdotes,
            chapitres_apparition: autresChamps.chapitres_apparition
          }
        });
        break;

      case 'objet':
        nouveauContenu = await prisma.wiki_objet.create({
          data: {
            histoire_id: parseInt(histoire_id),
            nom: nom || titre,
            description,
            niveau_deverrouillage: niveau_deverrouillage || 1,
            image_url,
            proprietes: autresChamps.proprietes,
            histoire_objet: autresChamps.histoire_objet,
            anecdotes: autresChamps.anecdotes,
            chapitres_apparition: autresChamps.chapitres_apparition
          }
        });
        break;

      case 'anecdote':
        nouveauContenu = await prisma.wiki_anecdote.create({
          data: {
            histoire_id: parseInt(histoire_id),
            titre: titre || nom,
            contenu: description || autresChamps.contenu,
            niveau_deverrouillage: niveau_deverrouillage || 1,
            image_url,
            type: autresChamps.type || 'trivia',
            chapitres_concernes: autresChamps.chapitres_concernes
          }
        });
        break;

      case 'illustration':
        nouveauContenu = await prisma.wiki_illustration.create({
          data: {
            histoire_id: parseInt(histoire_id),
            titre: titre || nom,
            description,
            image_url: image_url || '', // requis pour les illustrations
            niveau_deverrouillage: niveau_deverrouillage || 1,
            type: autresChamps.type || 'concept_art',
            chapitre_id: autresChamps.chapitre_id ? parseInt(autresChamps.chapitre_id) : null
          }
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Type de contenu non supporté'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: nouveauContenu,
      message: `${type_contenu} "${nom || titre}" créé avec succès`
    });

  } catch (error) {
    console.error('Erreur création contenu wiki:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création du contenu wiki'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}