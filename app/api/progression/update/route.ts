import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Mettre à jour la progression et déclencher les récompenses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { utilisateur_id, histoire_id, chapitre_lu, statut } = body;

    if (!utilisateur_id || !histoire_id || chapitre_lu === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur ID, histoire ID et chapitre lu requis'
      }, { status: 400 });
    }

    // Récupérer la progression actuelle
    let progression = await prisma.progression.findUnique({
      where: {
        utilisateur_id_histoire_id: {
          utilisateur_id: parseInt(utilisateur_id),
          histoire_id: parseInt(histoire_id)
        }
      }
    });

    let nouvelleProgression = false;
    let chapitresPrecedents = 0;

    if (!progression) {
      // Créer une nouvelle progression
      progression = await prisma.progression.create({
        data: {
          utilisateur_id: parseInt(utilisateur_id),
          histoire_id: parseInt(histoire_id),
          chapitre_lu: parseInt(chapitre_lu),
          statut: statut || 'en_cours',
          date_derniere_lecture: new Date()
        }
      });
      nouvelleProgression = true;
    } else {
      chapitresPrecedents = progression.chapitre_lu;
      
      // Mettre à jour seulement si on avance
      if (parseInt(chapitre_lu) > progression.chapitre_lu) {
        progression = await prisma.progression.update({
          where: {
            utilisateur_id_histoire_id: {
              utilisateur_id: parseInt(utilisateur_id),
              histoire_id: parseInt(histoire_id)
            }
          },
          data: {
            chapitre_lu: parseInt(chapitre_lu),
            statut: statut || progression.statut,
            date_derniere_lecture: new Date()
          }
        });
      }
    }

    // Récupérer les informations de l'histoire pour calculer le pourcentage
    const histoire = await prisma.histoire.findUnique({
      where: { id: parseInt(histoire_id) },
      include: {
        chapitres: {
          select: { id: true }
        }
      }
    });

    const totalChapitres = histoire?.chapitres.length || 0;
    const pourcentageProgression = totalChapitres > 0 
      ? Math.round((parseInt(chapitre_lu) / totalChapitres) * 100) 
      : 0;

    // Système de récompenses
    const recompenses = [];
    const nouveauxDebloquages = [];

    // Points pour lecture de chapitre (seulement si nouveau chapitre)
    if (parseInt(chapitre_lu) > chapitresPrecedents) {
      const chapitresLus = parseInt(chapitre_lu) - chapitresPrecedents;
      
      // Points par chapitre lu
      for (let i = 0; i < chapitresLus; i++) {
        try {
          const reponsePoints = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/rewards/points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              utilisateur_id: utilisateur_id,
              action_nom: 'Lecture Chapitre',
              histoire_id: histoire_id,
              chapitre_id: chapitresPrecedents + i + 1
            })
          });
          
          if (reponsePoints.ok) {
            const resultPoints = await reponsePoints.json();
            if (resultPoints.success) {
              recompenses.push({
                type: 'points',
                points: resultPoints.data.points_gagnes,
                action: 'Lecture Chapitre',
                niveau_up: resultPoints.data.niveau_up
              });
            }
          }
        } catch (error) {
          console.error('Erreur attribution points chapitre:', error);
        }
      }
    }

    // Récompenses de progression (25%, 50%, 75%, 100%)
    const jalunsProgression = [25, 50, 75];
    const pourcentagePrecedent = totalChapitres > 0 
      ? Math.round((chapitresPrecedents / totalChapitres) * 100) 
      : 0;

    for (const jalun of jalunsProgression) {
      if (pourcentageProgression >= jalun && pourcentagePrecedent < jalun) {
        try {
          const reponsePoints = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/rewards/points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              utilisateur_id: utilisateur_id,
              action_nom: `Progression ${jalun}%`,
              histoire_id: histoire_id
            })
          });
          
          if (reponsePoints.ok) {
            const resultPoints = await reponsePoints.json();
            if (resultPoints.success) {
              recompenses.push({
                type: 'progression',
                pourcentage: jalun,
                points: resultPoints.data.points_gagnes,
                niveau_up: resultPoints.data.niveau_up
              });
            }
          }
        } catch (error) {
          console.error(`Erreur attribution points progression ${jalun}%:`, error);
        }
      }
    }

    // Histoire terminée
    if (statut === 'termine' && progression.statut !== 'termine') {
      try {
        const reponsePoints = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/rewards/points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utilisateur_id: utilisateur_id,
            action_nom: 'Histoire Terminée',
            histoire_id: histoire_id
          })
        });
        
        if (reponsePoints.ok) {
          const resultPoints = await reponsePoints.json();
          if (resultPoints.success) {
            recompenses.push({
              type: 'completion',
              points: resultPoints.data.points_gagnes,
              niveau_up: resultPoints.data.niveau_up
            });
          }
        }
      } catch (error) {
        console.error('Erreur attribution points histoire terminée:', error);
      }
    }

    // Débloquer du contenu wiki
    try {
      const reponseWiki = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/wiki/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utilisateur_id: utilisateur_id,
          histoire_id: histoire_id
        })
      });
      
      if (reponseWiki.ok) {
        const resultWiki = await reponseWiki.json();
        if (resultWiki.success && resultWiki.data.nouveaux_debloquages.length > 0) {
          nouveauxDebloquages.push(...resultWiki.data.nouveaux_debloquages);
          
          if (resultWiki.data.points_gagnes > 0) {
            recompenses.push({
              type: 'wiki_unlock',
              points: resultWiki.data.points_gagnes,
              debloquages: resultWiki.data.nouveaux_debloquages.length
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur débloquage wiki:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        progression: progression,
        pourcentage_progression: pourcentageProgression,
        total_chapitres: totalChapitres,
        recompenses: recompenses,
        nouveaux_debloquages: nouveauxDebloquages,
        nouvelle_progression: nouvelleProgression
      },
      message: recompenses.length > 0 
        ? `Progression mise à jour ! ${recompenses.length} récompense(s) obtenue(s)` 
        : 'Progression mise à jour'
    });

  } catch (error) {
    console.error('Erreur mise à jour progression:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour de la progression'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}