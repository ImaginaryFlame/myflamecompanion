import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Données demo inspirées de la structure Sanity du portfolio
const DEMO_PERSONNAGES = [
  {
    nom: "Lyralei",
    prenom: "Princesse",
    surnoms: ["La Fée Sans Ailes", "L'Héritière Déchue"],
    description: "Princesse héritière du royaume de Sylvania, elle a mystérieusement perdu ses ailes lors d'un événement traumatisant. Déterminée et courageuse, elle cache sa véritable identité derrière le masque d'une simple citoyenne.",
    apparence: {
      taille: "Moyenne",
      corpulence: "Élancée",
      cheveux: "Argentés, longs et ondulés",
      yeux: "Violet profond avec des reflets dorés",
      peau: "Pâle avec une légère luminescence",
      particularites: "Marques en forme d'ailes sur les omoplates"
    },
    personnalite: {
      traits: ["Déterminée", "Empathique", "Secrète"],
      qualites: ["Leadership naturel", "Courage", "Intelligence tactique"],
      defauts: ["Tendance à s'isoler", "Perfectionnisme", "Méfiance"]
    },
    background: {
      origine: "Palais Royal de Sylvania",
      famille: "Famille royale des Aethermoor",
      education: "Formation diplomatique et martiale",
      evenements_marquants: ["Perte de ses ailes", "Exil volontaire", "Découverte des Basfonds"]
    },
    competences: {
      magiques: ["Guérison mineure", "Communication avec la nature"],
      martiales: ["Escrime", "Combat rapproché"],
      intellectuelles: ["Stratégie", "Diplomatie", "Langues anciennes"],
      sociales: ["Charisme", "Négociation", "Lecture des émotions"]
    }
  },
  {
    nom: "Marcus",
    prenom: "Le Héros",
    surnoms: ["Épée du Peuple", "Le Gardien"],
    description: "Guerrier originaire du monde humain, il s'est retrouvé propulsé dans le royaume féerique. Sa détermination à protéger les innocents en fait un allié précieux, même s'il peine parfois à comprendre les subtilités de ce nouveau monde.",
    apparence: {
      taille: "Grande",
      corpulence: "Musclée",
      cheveux: "Châtains, courts",
      yeux: "Verts, perçants",
      peau: "Hâlée par les combats",
      particularites: "Cicatrice en travers du visage"
    },
    personnalite: {
      traits: ["Protecteur", "Loyal", "Impulsif"],
      qualites: ["Bravoure", "Sens de la justice", "Persévérance"],
      defauts: ["Impatience", "Méfiance envers la magie", "Entêtement"]
    },
    background: {
      origine: "Monde humain - Village de pêcheurs",
      famille: "Parents disparus, sœur à retrouver",
      education: "Auto-formation au combat",
      evenements_marquants: ["Traverse vers le monde féerique", "Premier combat contre les forces obscures"]
    },
    competences: {
      magiques: ["Résistance naturelle", "Connexion aux armes enchantées"],
      martiales: ["Maîtrise de l'épée", "Combat à mains nues", "Tactiques militaires"],
      intellectuelles: ["Stratégie de combat", "Sens de l'orientation"],
      sociales: ["Leadership inspirant", "Loyauté contagieuse"]
    }
  },
  {
    nom: "Vex'ahlia",
    prenom: "Dame",
    surnoms: ["L'Ombre Royale", "La Conspiratrice"],
    description: "Noble influente de la cour de Sylvania, elle manie l'intrigue avec autant d'habileté que sa dague empoisonnée. Ses véritables motivations restent mystérieuses.",
    apparence: {
      taille: "Petite",
      corpulence: "Fine",
      cheveux: "Noirs comme l'ébène",
      yeux: "Ambrés, calculateurs",
      peau: "Olivâtre",
      particularites: "Tatouages magiques sur les bras"
    },
    personnalite: {
      traits: ["Manipulatrice", "Ambitieuse", "Charismatique"],
      qualites: ["Intelligence exceptionnelle", "Adaptabilité", "Éloquence"],
      defauts: ["Manque d'empathie", "Soif de pouvoir", "Paranoïa"]
    }
  }
]

const DEMO_REGIONS = [
  {
    nom: "Royaume de Sylvania",
    description: "Le royaume principal où se déroule l'histoire, terre de fusion entre le monde humain et féerique.",
    type: "royaume",
    climat: "Tempéré avec des zones magiques",
    geographie: {
      relief: "Plaines centrales avec des collines boisées au nord",
      hydrographie: "Rivière Aethermoor traversant le royaume",
      faune: "Créatures magiques et animaux ordinaires coexistent",
      flore: "Arbres luminescents et plantes à propriétés magiques"
    },
    population: {
      culture: "Mélange harmonieux des traditions humaines et féeriques",
      politique: "Monarchie constitutionnelle avec un conseil des races",
      economie: "Commerce basé sur la magie et l'artisanat"
    },
    lieux_notables: [
      {
        nom: "Palais Royal",
        description: "Siège du pouvoir, construit en cristaux vivants",
        importance: "Haute"
      },
      {
        nom: "Les Basfonds",
        description: "Quartier pauvre où se cachent les marginaux",
        importance: "Moyenne"
      }
    ]
  },
  {
    nom: "Forêt des Murmures",
    description: "Ancienne forêt où les arbres conservent la mémoire du passé.",
    type: "forêt_magique",
    climat: "Humide et mystique",
    geographie: {
      relief: "Terrain vallonné avec des clairières sacrées",
      hydrographie: "Sources magiques et ruisseaux chantants",
      faune: "Esprits de la nature et créatures anciennes",
      flore: "Arbres millénaires aux propriétés oraculaires"
    }
  }
]

const DEMO_OBJETS = [
  {
    nom: "Épée de l'Aube",
    description: "Lame forgée dans les flammes du premier soleil de Sylvania, elle brille d'une lumière dorée.",
    type: "arme",
    sous_type: "épée_longue",
    rarete: "legendaire",
    proprietes_magiques: true,
    histoire_origine: "Forgée par les premiers forgerons fées pour combattre les ténèbres primordiales",
    proprietaire_actuel: "Marcus le Héros",
    pouvoirs: [
      {
        nom: "Lame de Lumière",
        description: "La lame émet une lumière capable de dissiper les illusions",
        conditions_activation: "Volonté pure du porteur"
      },
      {
        nom: "Frappe Sacrée",
        description: "Double les dégâts contre les créatures des ténèbres",
        conditions_activation: "Combat contre le mal"
      }
    ],
    apparence: {
      forme: "Épée longue élégante",
      taille: "120 cm",
      couleur: "Acier doré avec des reflets blancs",
      materiaux: "Acier stellaire et cristal de lumière",
      ornements: "Runes anciennes gravées sur la lame"
    }
  },
  {
    nom: "Couronne des Vents",
    description: "Ancien diadème royal permettant de commander aux éléments aériens.",
    type: "accessoire",
    sous_type: "couronne",
    rarete: "rare",
    proprietes_magiques: true,
    histoire_origine: "Héritage de la première reine de Sylvania",
    proprietaire_actuel: "Perdue depuis la chute de Lyralei",
    pouvoirs: [
      {
        nom: "Maîtrise des Vents",
        description: "Permet de contrôler les courants aériens",
        conditions_activation: "Sang royal de Sylvania"
      }
    ]
  }
]

// POST - Créer des données demo basées sur la structure Sanity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { histoire_id = 3, importType = 'all', force_update = false } = body

    console.log(`🔄 Import des données demo Sanity pour l'histoire ID: ${histoire_id}`)

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
      total: 0
    }

    // Import des personnages demo
    if (importType === 'all' || importType === 'personnages') {
      console.log('📥 Import des personnages demo...')
      
      for (const perso of DEMO_PERSONNAGES) {
        try {
          const nomComplet = `${perso.prenom || ''} ${perso.nom || ''}`.trim()
          
          // Construire les chaînes d'apparence et personnalité
          const apparence = perso.apparence ? 
            Object.entries(perso.apparence)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ') : ''

          const personnalite = perso.personnalite ?
            `Traits: ${perso.personnalite.traits?.join(', ') || ''}. Qualités: ${perso.personnalite.qualites?.join(', ') || ''}. Défauts: ${perso.personnalite.defauts?.join(', ') || ''}` : ''

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
              ${perso.description},
              ${apparence},
              ${personnalite},
              ${JSON.stringify(perso.background || {})}::jsonb,
              ${JSON.stringify(perso.competences || {})}::jsonb,
              ${JSON.stringify([])}::jsonb,
              ${JSON.stringify([])}::jsonb,
              1,
              'none'
            )
            ON CONFLICT (histoire_id, nom) DO UPDATE SET
              description = EXCLUDED.description,
              apparence = EXCLUDED.apparence,
              personnalite = EXCLUDED.personnalite,
              background = EXCLUDED.background,
              competences = EXCLUDED.competences
          `
          importStats.personnages++
        } catch (error) {
          console.log(`Erreur import personnage ${perso.nom}:`, error)
        }
      }
    }

    // Import des régions demo
    if (importType === 'all' || importType === 'regions') {
      console.log('📥 Import des régions demo...')
      
      for (const region of DEMO_REGIONS) {
        try {
          await prisma.$executeRaw`
            INSERT INTO wiki_lieu (
              histoire_id, nom, description, type_lieu, climat,
              geographie, population, lieux_notables, histoire_lieu,
              niveau_deverrouillage
            ) VALUES (
              ${parseInt(histoire_id)},
              ${region.nom},
              ${region.description},
              ${region.type || 'autre'},
              ${region.climat || ''},
              ${JSON.stringify(region.geographie || {})}::jsonb,
              ${JSON.stringify(region.population || {})}::jsonb,
              ${JSON.stringify(region.lieux_notables || [])}::jsonb,
              ${JSON.stringify({})}::jsonb,
              1
            )
            ON CONFLICT (histoire_id, nom) DO UPDATE SET
              description = EXCLUDED.description,
              type_lieu = EXCLUDED.type_lieu,
              climat = EXCLUDED.climat,
              geographie = EXCLUDED.geographie,
              population = EXCLUDED.population,
              lieux_notables = EXCLUDED.lieux_notables
          `
          importStats.lieux++
        } catch (error) {
          console.log(`Erreur import région ${region.nom}:`, error)
        }
      }
    }

    // Import des objets demo
    if (importType === 'all' || importType === 'objets') {
      console.log('📥 Import des objets demo...')
      
      for (const objet of DEMO_OBJETS) {
        try {
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
              ${objet.nom},
              ${objet.description},
              ${objet.type || 'autre'},
              ${objet.sous_type || ''},
              ${objet.rarete || 'commun'},
              ${objet.proprietes_magiques || false},
              ${objet.histoire_origine || ''},
              ${objet.proprietaire_actuel || ''},
              ${objet.localisation_actuelle || ''},
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

    importStats.total = importStats.personnages + importStats.objets + importStats.lieux + importStats.anecdotes

    console.log('✅ Import demo terminé !', importStats)

    return NextResponse.json({
      success: true,
      data: {
        histoire: {
          id: histoire.id,
          titre: histoire.titre
        },
        import_results: importStats,
        demo_config: {
          type: 'demo_sanity_structure',
          source: 'Portfolio Sanity Schema'
        }
      },
      message: `Import demo Sanity terminé: ${importStats.total} éléments importés`
    })

  } catch (error) {
    console.error('Erreur import demo Sanity:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'import des données demo',
      details: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Informations sur les données demo disponibles
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        demo_data_available: {
          personnages: DEMO_PERSONNAGES.length,
          regions: DEMO_REGIONS.length,
          objets: DEMO_OBJETS.length,
          total: DEMO_PERSONNAGES.length + DEMO_REGIONS.length + DEMO_OBJETS.length
        },
        sample_personnages: DEMO_PERSONNAGES.map(p => ({ nom: p.nom, prenom: p.prenom })),
        sample_regions: DEMO_REGIONS.map(r => ({ nom: r.nom, type: r.type })),
        sample_objets: DEMO_OBJETS.map(o => ({ nom: o.nom, type: o.type, rarete: o.rarete }))
      },
      message: 'Données demo Sanity disponibles (basées sur la structure du portfolio)'
    })

  } catch (error) {
    console.error('Erreur listing demo Sanity:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du listing des données demo'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}