import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Configuration Sanity depuis les variables d'environnement
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || "yr6w0vww"
const SANITY_DATASET = process.env.SANITY_DATASET || "production"
const SANITY_TOKEN = process.env.SANITY_TOKEN || "VOTRE_NOUVEAU_TOKEN_ICI"

const SANITY_API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}`

// Fonction utilitaire pour faire des requêtes GROQ à Sanity
async function querySanity(query: string) {
  const url = `${SANITY_API_URL}?query=${encodeURIComponent(query)}`
  
  console.log('🔍 Sanity Query URL:', url.substring(0, 100) + '...')
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SANITY_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  console.log('📡 Sanity Response Status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.log('❌ Sanity Error:', errorText)
    throw new Error(`Erreur Sanity API: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('✅ Sanity Data:', data?.result?.length ? `${data.result.length} éléments` : 'Aucun résultat')
  return data.result
}

// POST - Importer les données depuis Sanity vers le système wiki
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { histoire_id = 3, importType = 'all', force_update = false } = body

    console.log(`🔄 Import des données Sanity pour l'histoire ID: ${histoire_id}`)

    // Vérifier que l'histoire existe
    const histoire = await prisma.histoire.findUnique({
      where: { id: parseInt(histoire_id) }
    })

    if (!histoire) {
      return NextResponse.json({
        success: false,
        error: `Histoire avec l'ID ${histoire_id} non trouvée`
      }, { status: 404 })
    }

    // Si force_update, nettoyer les données existantes
    if (force_update) {
      await prisma.$executeRaw`DELETE FROM wiki_personnage WHERE histoire_id = ${parseInt(histoire_id)}`
      await prisma.$executeRaw`DELETE FROM wiki_objet WHERE histoire_id = ${parseInt(histoire_id)}`
      await prisma.$executeRaw`DELETE FROM wiki_lieu WHERE histoire_id = ${parseInt(histoire_id)}`
      console.log('🗑️ Données wiki existantes supprimées')
    }

    const importStats = {
      personnages: 0,
      lieux: 0,
      objets: 0,
      anecdotes: 0,
      illustrations: 0,
      races: 0,
      factions: 0
    };

    // Import des personnages
    if (importType === 'all' || importType === 'personnages') {
      console.log('📥 Import des personnages...')
      
      const personnages = await querySanity(`
        *[_type == "personnage"] {
          _id,
          nom,
          prenom,
          surnoms,
          description,
          histoire,
          apparence {
            taille,
            corpulence,
            cheveux,
            yeux,
            peau,
            particularites
          },
          personnalite {
            traits,
            qualites,
            defauts,
            habitudes
          },
          background {
            origine,
            famille,
            education,
            evenements_marquants
          },
          competences {
            magiques,
            martiales,
            intellectuelles,
            sociales
          },
          relations[] {
            personnage-> {
              nom,
              prenom
            },
            type_relation,
            description
          },
          arcs_narratifs[] {
            titre,
            description,
            statut
          }
        }
      `)

      for (const perso of personnages || []) {
        try {
          const nomComplet = `${perso.prenom || ''} ${perso.nom || ''}`.trim() || 'Personnage Sans Nom'
          
          // Construire la description depuis les données Sanity
          let description = perso.description || ''
          if (typeof description === 'object' && description[0]?.children) {
            description = description[0].children.map(child => child.text).join(' ')
          }

          // Construire l'apparence
          let apparence = ''
          if (perso.apparence) {
            const app = perso.apparence
            const details = [
              app.taille ? `Taille: ${app.taille}` : '',
              app.corpulence ? `Corpulence: ${app.corpulence}` : '',
              app.cheveux ? `Cheveux: ${app.cheveux}` : '',
              app.yeux ? `Yeux: ${app.yeux}` : '',
              app.peau ? `Peau: ${app.peau}` : '',
              app.particularites ? `Particularités: ${app.particularites}` : ''
            ].filter(Boolean)
            apparence = details.join(', ')
          }

          // Construire la personnalité
          let personnalite = ''
          if (perso.personnalite) {
            const pers = perso.personnalite
            const details = [
              pers.traits ? `Traits: ${Array.isArray(pers.traits) ? pers.traits.join(', ') : pers.traits}` : '',
              pers.qualites ? `Qualités: ${Array.isArray(pers.qualites) ? pers.qualites.join(', ') : pers.qualites}` : '',
              pers.defauts ? `Défauts: ${Array.isArray(pers.defauts) ? pers.defauts.join(', ') : pers.defauts}` : ''
            ].filter(Boolean)
            personnalite = details.join('. ')
          }

          await prisma.$executeRaw`
            INSERT INTO wiki_personnage (
              histoire_id, nom, prenom, surnoms, description,
              apparence, personnalite, background, competences, relations,
              arcs_narratifs, niveau_deverrouillage, spoiler_level
            ) VALUES (
              ${parseInt(histoire_id)},
              ${nomComplet},
              ${perso.prenom || ''},
              ${JSON.stringify(perso.surnoms || [])}::jsonb,
              ${description},
              ${apparence},
              ${personnalite},
              ${JSON.stringify(perso.background || {})}::jsonb,
              ${JSON.stringify(perso.competences || {})}::jsonb,
              ${JSON.stringify(perso.relations || [])}::jsonb,
              ${JSON.stringify(perso.arcs_narratifs || [])}::jsonb,
              1,
              'none'
            )
            ON CONFLICT (histoire_id, nom) DO UPDATE SET
              description = EXCLUDED.description,
              apparence = EXCLUDED.apparence,
              personnalite = EXCLUDED.personnalite,
              background = EXCLUDED.background,
              competences = EXCLUDED.competences,
              relations = EXCLUDED.relations,
              arcs_narratifs = EXCLUDED.arcs_narratifs
          `
          importStats.personnages++
        } catch (error) {
          console.log(`Erreur import personnage ${perso.nom}:`, error)
        }
      }
    }

    // Import des régions/lieux
    if (importType === 'all' || importType === 'regions') {
      console.log('📥 Import des régions...')
      
      const regions = await querySanity(`
        *[_type == "region"] {
          _id,
          nom,
          description,
          type,
          climat,
          geographie {
            relief,
            hydrographie,
            faune,
            flore
          },
          population {
            habitants_principaux[] -> {
              nom,
              prenom
            },
            culture,
            politique,
            economie
          },
          lieux_notables[] {
            nom,
            description,
            importance
          },
          histoire {
            fondation,
            evenements_marquants[] {
              date,
              evenement,
              consequences
            }
          }
        }
      `)

      for (const region of regions || []) {
        try {
          // Construire la description
          let description = region.description || ''
          if (typeof description === 'object' && description[0]?.children) {
            description = description[0].children.map(child => child.text).join(' ')
          }

          await prisma.$executeRaw`
            INSERT INTO wiki_lieu (
              histoire_id, nom, description, type_lieu, climat,
              geographie, population, lieux_notables, histoire_lieu,
              niveau_deverrouillage
            ) VALUES (
              ${parseInt(histoire_id)},
              ${region.nom || 'Lieu Inconnu'},
              ${description},
              ${region.type || 'autre'},
              ${region.climat || ''},
              ${JSON.stringify(region.geographie || {})}::jsonb,
              ${JSON.stringify(region.population || {})}::jsonb,
              ${JSON.stringify(region.lieux_notables || [])}::jsonb,
              ${JSON.stringify(region.histoire || {})}::jsonb,
              1
            )
            ON CONFLICT (histoire_id, nom) DO UPDATE SET
              description = EXCLUDED.description,
              type_lieu = EXCLUDED.type_lieu,
              climat = EXCLUDED.climat,
              geographie = EXCLUDED.geographie,
              population = EXCLUDED.population,
              lieux_notables = EXCLUDED.lieux_notables,
              histoire_lieu = EXCLUDED.histoire_lieu
          `
          importStats.lieux++
        } catch (error) {
          console.log(`Erreur import région ${region.nom}:`, error)
        }
      }
    }

    // Import des objets
    if (importType === 'all' || importType === 'objets') {
      console.log('📥 Import des objets...')
      
      const objets = await querySanity(`
        *[_type == "objet"] {
          _id,
          nom,
          description,
          type,
          sous_type,
          rarete,
          proprietes_magiques,
          histoire_origine,
          proprietaire_actuel-> {
            nom,
            prenom
          },
          localisation_actuelle-> {
            nom
          },
          pouvoirs[] {
            nom,
            description,
            conditions_activation
          },
          apparence {
            forme,
            taille,
            couleur,
            materiaux,
            ornements
          }
        }
      `)

      for (const objet of objets || []) {
        try {
          // Construire la description
          let description = objet.description || ''
          if (typeof description === 'object' && description[0]?.children) {
            description = description[0].children.map(child => child.text).join(' ')
          }

          // Déterminer le niveau basé sur la rareté
          let niveauDeverrouillage = 5
          if (objet.rarete === 'commun') niveauDeverrouillage = 2
          else if (objet.rarete === 'rare') niveauDeverrouillage = 7
          else if (objet.rarete === 'legendaire') niveauDeverrouillage = 12

          await prisma.$executeRaw`
            INSERT INTO wiki_objet (
              histoire_id, nom, description, type_objet, sous_type,
              rarete, proprietes_magiques, histoire_origine, proprietaire_actuel,
              localisation_actuelle, pouvoirs, apparence, niveau_deverrouillage
            ) VALUES (
              ${parseInt(histoire_id)},
              ${objet.nom || 'Objet Inconnu'},
              ${description},
              ${objet.type || 'autre'},
              ${objet.sous_type || ''},
              ${objet.rarete || 'commun'},
              ${objet.proprietes_magiques || false},
              ${objet.histoire_origine || ''},
              ${objet.proprietaire_actuel?.nom || ''},
              ${objet.localisation_actuelle?.nom || ''},
              ${JSON.stringify(objet.pouvoirs || [])}::jsonb,
              ${JSON.stringify(objet.apparence || {})}::jsonb,
              ${niveauDeverrouillage}
            )
            ON CONFLICT (histoire_id, nom) DO UPDATE SET
              description = EXCLUDED.description,
              type_objet = EXCLUDED.type_objet,
              proprietes_magiques = EXCLUDED.proprietes_magiques,
              histoire_origine = EXCLUDED.histoire_origine,
              pouvoirs = EXCLUDED.pouvoirs,
              apparence = EXCLUDED.apparence
          `
          importStats.objets++
        } catch (error) {
          console.log(`Erreur import objet ${objet.nom}:`, error)
        }
      }
    }

    // Créer des anecdotes de création basées sur les données Sanity
    if (importType === 'all' || importType === 'anecdotes') {
      console.log('📥 Création d\'anecdotes...');

      const anecdotesCreation = [
        {
          titre: 'Inspiration de l\'univers',
          contenu: 'L\'univers "Héros et la Fée" explore la complexité des relations entre des êtres marginalisés dans un monde fantasy.',
          type: 'creation',
          niveau: 1
        },
        {
          titre: 'Architecture narrative',
          contenu: 'Le système de "versions de personnages" permet de révéler progressivement les secrets et identités cachées.',
          type: 'creation',
          niveau: 5
        },
        {
          titre: 'Worldbuilding approfondi',
          contenu: 'Chaque région possède sa propre culture, ses traditions et son système politique, créant un monde vivant.',
          type: 'creation',
          niveau: 8
        }
      ];

      for (const anecdote of anecdotesCreation) {
        await prisma.wiki_anecdote.create({
          data: {
            histoire_id: histoire.id,
            titre: anecdote.titre,
            contenu: anecdote.contenu,
            type: anecdote.type,
            niveau_deverrouillage: anecdote.niveau,
            chapitres_concernes: [1, 5, 10]
          }
        });

        importStats.anecdotes++;
      }
    }

    importStats.total = importStats.personnages + importStats.objets + importStats.lieux + importStats.anecdotes

    console.log('✅ Import terminé !', importStats)

    return NextResponse.json({
      success: true,
      data: {
        histoire: {
          id: histoire.id,
          titre: histoire.titre
        },
        import_results: importStats,
        sanity_config: {
          project_id: SANITY_PROJECT_ID,
          dataset: SANITY_DATASET,
          connected: true
        }
      },
      message: `Import Sanity terminé: ${importStats.total} éléments importés`
    })

  } catch (error) {
    console.error('Erreur import Sanity:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'import des données Sanity',
      details: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Tester la connexion Sanity et lister les données disponibles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'test'

    if (action === 'test') {
      // Test de la connexion Sanity avec un échantillon de chaque type
      const personnages = await querySanity('*[_type == "personnage"][0..2]{_id, nom, prenom}')
      const regions = await querySanity('*[_type == "region"][0..2]{_id, nom}')
      const objets = await querySanity('*[_type == "objet"][0..2]{_id, nom}')

      return NextResponse.json({
        success: true,
        data: {
          connection: 'OK',
          sanity_config: {
            project_id: SANITY_PROJECT_ID,
            dataset: SANITY_DATASET
          },
          sample_data: {
            personnages: personnages || [],
            regions: regions || [],
            objets: objets || []
          }
        },
        message: 'Connexion Sanity réussie'
      })
    }

    if (action === 'list') {
      // Compter tous les éléments disponibles
      const personnages = await querySanity('*[_type == "personnage"]')
      const regions = await querySanity('*[_type == "region"]')
      const objets = await querySanity('*[_type == "objet"]')

      return NextResponse.json({
        success: true,
        data: {
          available_data: {
            personnages: personnages?.length || 0,
            regions: regions?.length || 0,
            objets: objets?.length || 0,
            total: (personnages?.length || 0) + (regions?.length || 0) + (objets?.length || 0)
          },
          sanity_config: {
            project_id: SANITY_PROJECT_ID,
            dataset: SANITY_DATASET
          }
        },
        message: 'Données Sanity disponibles listées'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Action non reconnue. Utilisez ?action=test ou ?action=list'
    }, { status: 400 })

  } catch (error) {
    console.error('Erreur connexion Sanity:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur de connexion à Sanity',
      details: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}