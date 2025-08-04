import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Données de l'univers "Héros et la Fée" basées sur l'analyse du portfolio
const UNIVERS_DATA = {
  titre: 'La Fable du Héros et la Fée',
  description: 'Dans un monde déchiré par la fusion ancienne entre l\'univers humain et le royaume féérique, les cendres de la guerre, du rejet et de l\'injustice continuent d\'alimenter les rêves brisés de ceux qu\'on a toujours laissés de côté.',
  auteur: 'Imaginary Flame',
  genres: ['fantasy', 'dark_fantasy', 'heroic_fantasy'],
  themes: ['amitie', 'identite', 'justice', 'pouvoir'],
  tonalite: 'epique'
};

const PERSONNAGES_DATA = [
  {
    nom: 'La Fée Sans Ailes',
    description: 'Une jeune Fée née sans ailes, méprisée de tous, vivant dans les Basfonds de Sylvania. Malgré son handicap, elle possède une détermination farouche et des pouvoirs cachés.',
    apparence: 'Jeune fée dépourvue d\'ailes, aux traits délicats mais marqués par les épreuves. Porte des vêtements simples adaptés à la vie dans les Basfonds.',
    personnalite: 'Courageuse malgré le rejet social, déterminée à prouver sa valeur. Cache sa vulnérabilité derrière une façade de force.',
    background: 'Née dans une société féérique qui valorise le vol, elle a grandi dans le mépris et l\'exclusion. A développé des capacités uniques pour compenser son handicap.',
    role: 'protagoniste',
    niveau: 1,
    chapitres: [1, 2, 3, 5, 8, 10, 12, 15, 18, 20]
  },
  {
    nom: 'Le Héros',
    description: 'Un humain errant, survivant d\'un massacre oublié, porteur d\'un pouvoir dévastateur et d\'un nom effacé. Surnommé avec crainte par ceux qui connaissent sa légende.',
    apparence: 'Homme aux traits marqués par les épreuves, porte les cicatrices de batailles passées. Son regard trahit une grande lassitude mêlée à une force intérieure.',
    personnalite: 'Hanté par son passé, réticent à utiliser ses pouvoirs destructeurs. Cherche la rédemption mais doute de la mériter.',
    background: 'Unique survivant d\'un massacre qui a détruit sa communauté. Porte le fardeau d\'un pouvoir qu\'il ne contrôle pas entièrement.',
    role: 'protagoniste',
    niveau: 1,
    chapitres: [1, 2, 4, 6, 8, 11, 14, 16, 19, 20]
  },
  {
    nom: 'Monarque de Sylvania',
    description: 'Dirigeant du dernier bastion d\'une monarchie aussi brillante que pourrie de l\'intérieur. Incarne les contradictions d\'un système en décadence.',
    apparence: 'Figure majestueuse aux atours royaux somptueux, mais dont le regard révèle la corruption et la lassitude du pouvoir.',
    personnalite: 'Calculateur et manipulateur, mais pas dénué d\'une certaine grandeur. Conscient de la pourriture de son système mais incapable de le changer.',
    background: 'Héritier d\'un royaume en déclin, pris entre les nécessités politiques et ses propres ambitions. Manipule les événements depuis l\'ombre.',
    role: 'antagoniste',
    niveau: 8,
    chapitres: [7, 9, 12, 15, 17, 20]
  },
  {
    nom: 'Champion du Tournoi',
    description: 'Guerrier redoutable participant aux tournois meurtriers organisés par la monarchie. Représente la violence institutionnalisée du système.',
    apparence: 'Physique impressionnant, armure de combat ornée de trophées. Porte les marques de nombreux combats victorieux.',
    personnalite: 'Brutal mais honorable selon son propre code. Respecte la force mais méprise la faiblesse.',
    background: 'Issu des classes populaires, a gravi les échelons par la violence. Devient progressivement conscient de son rôle dans l\'oppression.',
    role: 'rival',
    niveau: 5,
    chapitres: [4, 8, 11, 14, 18]
  },
  {
    nom: 'Sage des Basfonds',
    description: 'Ancien conseiller royal déchu, maintenant guide spirituel dans les quartiers pauvres. Détient les secrets de l\'ancienne fusion des mondes.',
    apparence: 'Vieil homme aux traits nobles malgré ses habits simples. Ses yeux brillent d\'une sagesse ancienne.',
    personnalite: 'Sage et patient, mais amer envers le système qui l\'a rejeté. Cherche à transmettre son savoir à la nouvelle génération.',
    background: 'Ancien membre de l\'élite, banni pour avoir révélé des vérités dérangeantes. Connaît l\'histoire secrète de la fusion des mondes.',
    role: 'mentor',
    niveau: 3,
    chapitres: [2, 5, 9, 13, 16]
  }
];

const LIEUX_DATA = [
  {
    nom: 'Sylvania',
    description: 'Dernier bastion d\'une monarchie brillante en apparence mais rongée par la corruption. Cité divisée entre quartiers nobles et Basfonds misérables.',
    histoire: 'Ancienne capitale née de la fusion entre le monde humain and féérique. Témoigne de la grandeur passée et de la décadence présente.',
    niveau: 1,
    chapitres: [1, 2, 3, 4, 5, 8, 10, 12, 15, 18, 20]
  },
  {
    nom: 'Les Basfonds',
    description: 'Quartiers pauvres de Sylvania où vivent les exclus et les marginaux. Lieu de survie et de solidarité dans l\'adversité.',
    histoire: 'Formés autour des anciens sites de bataille de la fusion. Abritent ceux que la société officielle a rejetés.',
    niveau: 1,
    chapitres: [1, 3, 5, 7, 9, 11, 13, 15]
  },
  {
    nom: 'Palais Royal',
    description: 'Somptueux palais au cœur de Sylvania, symbole du pouvoir monarchique. Magnifique façade cachant intrigues et corruption.',
    histoire: 'Construit sur les ruines du premier point de contact entre les deux mondes. Architecture mêlant styles humain et féérique.',
    niveau: 6,
    chapitres: [7, 12, 15, 18, 20]
  },
  {
    nom: 'Arènes des Tournois',
    description: 'Complexe gigantesque où se déroulent les tournois meurtriers. Spectacle de violence pour divertir les masses.',
    histoire: 'Ancien site rituel féérique transformé en lieu de spectacle sanglant. Les gradins résonnent des cris de la foule assoiffée de sang.',
    niveau: 4,
    chapitres: [4, 8, 11, 14, 18]
  },
  {
    nom: 'Frontières Oubliées',
    description: 'Terres désolées aux limites du royaume, où subsistent les cicatrices de l\'ancienne guerre. Lieu de pèlerinage pour les survivants.',
    histoire: 'Champs de bataille de la grande fusion, maintenant terres de désolation. Certains lieux conservent encore des traces de magie ancienne.',
    niveau: 10,
    chapitres: [13, 16, 19]
  }
];

const OBJETS_DATA = [
  {
    nom: 'Lame du Héros Déchu',
    description: 'Épée légendaire portée par le Héros, forgée dans les larmes des deux mondes. Sa lame change de couleur selon les émotions de son porteur.',
    proprietes: 'Indestructible, amplifie les pouvoirs de son porteur, révèle les intentions cachées des ennemis.',
    histoire: 'Forgée lors de la fusion des mondes, elle a été témoin de tous les massacres. Ne peut être maniée que par celui qui accepte son fardeau.',
    niveau: 8,
    chapitres: [6, 8, 11, 16, 19, 20]
  },
  {
    nom: 'Cristal des Basfonds',
    description: 'Gemme mystérieuse trouvée dans les profondeurs de Sylvania. Pulse d\'une lumière douce qui réconforte les âmes blessées.',
    proprietes: 'Amplifie les pouvoirs magiques, soigne les blessures spirituelles, révèle la véritable nature des êtres.',
    histoire: 'Fragment du cœur magique qui liait les deux mondes. Sa découverte par la Fée change le cours de son destin.',
    niveau: 5,
    chapitres: [3, 7, 10, 14, 17]
  },
  {
    nom: 'Couronne de Sylvania',
    description: 'Symbole du pouvoir royal, forgée dans l\'or des deux mondes. Porte les gemmes des anciennes lignées féérique et humaine.',
    proprietes: 'Confère l\'autorité royale, permet de commander aux esprits ancestraux, révèle les trahisons.',
    histoire: 'Créée pour sceller l\'alliance entre les deux peuples. Maintenant symbole d\'un pouvoir corrompu qui a trahi ses idéaux.',
    niveau: 12,
    chapitres: [12, 15, 18, 20]
  }
];

const ANECDOTES_DATA = [
  {
    titre: 'La Fusion des Mondes',
    contenu: 'L\'événement fondateur de cet univers est la fusion mystérieuse entre le monde humain et le royaume féérique, créant un monde hybride aux règles nouvelles.',
    type: 'creation',
    niveau: 3
  },
  {
    titre: 'Symbolisme des Ailes',
    contenu: 'L\'absence d\'ailes de la fée protagoniste symbolise l\'exclusion sociale et la différence, mais aussi le potentiel de transcender les limitations imposées.',
    type: 'creation',
    niveau: 5
  },
  {
    titre: 'Architecture Narrative',
    contenu: 'Le système Sanity complexe développé pour cet univers permet de gérer les spoilers et révélations progressives, reflétant la profondeur de l\'intrigue.',
    type: 'creation',
    niveau: 8
  },
  {
    titre: 'Inspiration Tolkienienne',
    contenu: 'L\'idée de fusion entre mondes s\'inspire des concepts de Tolkien sur la séparation entre le monde des Elfes et celui des Hommes.',
    type: 'reference',
    niveau: 10
  },
  {
    titre: 'Easter Egg: Les Basfonds',
    contenu: 'Le nom "Basfonds" fait écho aux quartiers populaires de Paris du 19ème siècle, créant un parallèle entre fantasy et réalisme social.',
    type: 'easter_egg',
    niveau: 12
  }
];

// POST - Créer le contenu wiki pour "Héros et la Fée"
export async function POST(request: NextRequest) {
  try {
    console.log('🎭 Création du wiki pour "La Fable du Héros et la Fée"...');

    // Créer ou récupérer l'histoire
    let histoire = await prisma.histoire.findFirst({
      where: { titre: { contains: 'Héros et la Fée' } }
    });

    if (!histoire) {
      histoire = await prisma.histoire.create({
        data: {
          titre: UNIVERS_DATA.titre,
          description: UNIVERS_DATA.description,
          auteur: UNIVERS_DATA.auteur,
          source: 'Portfolio Sanity - Héros et la Fée',
          url_source: 'https://votre-portfolio.com/univers/herosfee',
          date_publication: new Date(),
          urls_multiples: {
            genres: UNIVERS_DATA.genres,
            themes: UNIVERS_DATA.themes,
            tonalite: UNIVERS_DATA.tonalite,
            sanity_id: 'herosfee'
          }
        }
      });
      console.log(`✅ Histoire créée: ${histoire.titre}`);
    }

    const stats = {
      personnages: 0,
      lieux: 0,
      objets: 0,
      anecdotes: 0
    };

    // Créer les personnages
    console.log('👥 Création des personnages...');
    for (const perso of PERSONNAGES_DATA) {
      await prisma.wiki_personnage.create({
        data: {
          histoire_id: histoire.id,
          nom: perso.nom,
          description: perso.description,
          apparence: perso.apparence,
          personnalite: perso.personnalite,
          background: perso.background,
          niveau_deverrouillage: perso.niveau,
          anecdotes: {
            role: `Rôle narratif: ${perso.role}`,
            importance: perso.niveau <= 3 ? 'Personnage central' : perso.niveau <= 8 ? 'Personnage important' : 'Personnage secondaire'
          },
          chapitres_apparition: perso.chapitres
        }
      });
      stats.personnages++;
    }

    // Créer les lieux
    console.log('🏰 Création des lieux...');
    for (const lieu of LIEUX_DATA) {
      await prisma.wiki_lieu.create({
        data: {
          histoire_id: histoire.id,
          nom: lieu.nom,
          description: lieu.description,
          histoire_lieu: lieu.histoire,
          niveau_deverrouillage: lieu.niveau,
          anecdotes: {
            importance: lieu.niveau <= 3 ? 'Lieu central' : lieu.niveau <= 8 ? 'Lieu important' : 'Lieu secret',
            apparitions: `Apparaît dans ${lieu.chapitres.length} chapitres`
          },
          chapitres_apparition: lieu.chapitres
        }
      });
      stats.lieux++;
    }

    // Créer les objets
    console.log('⚔️ Création des objets...');
    for (const objet of OBJETS_DATA) {
      await prisma.wiki_objet.create({
        data: {
          histoire_id: histoire.id,
          nom: objet.nom,
          description: objet.description,
          proprietes: objet.proprietes,
          histoire_objet: objet.histoire,
          niveau_deverrouillage: objet.niveau,
          anecdotes: {
            importance: objet.niveau <= 5 ? 'Objet majeur' : objet.niveau <= 10 ? 'Objet important' : 'Artefact légendaire',
            pouvoir: 'Objet magique aux propriétés uniques'
          },
          chapitres_apparition: objet.chapitres
        }
      });
      stats.objets++;
    }

    // Créer les anecdotes
    console.log('📖 Création des anecdotes...');
    for (const anecdote of ANECDOTES_DATA) {
      await prisma.wiki_anecdote.create({
        data: {
          histoire_id: histoire.id,
          titre: anecdote.titre,
          contenu: anecdote.contenu,
          type: anecdote.type,
          niveau_deverrouillage: anecdote.niveau,
          chapitres_concernes: [1, 5, 10, 15, 20] // Chapitres clés
        }
      });
      stats.anecdotes++;
    }

    // Créer quelques illustrations conceptuelles
    console.log('🎨 Création des illustrations...');
    const illustrations = [
      {
        titre: 'Portrait de la Fée Sans Ailes',
        description: 'Concept art du personnage principal féminin',
        type: 'personnage',
        niveau: 1
      },
      {
        titre: 'Le Héros dans les Basfonds',
        description: 'Illustration dramatique du héros dans son environnement',
        type: 'scene',
        niveau: 2
      },
      {
        titre: 'Vue panoramique de Sylvania',
        description: 'Architecture grandiose de la capitale royale',
        type: 'lieu',
        niveau: 3
      },
      {
        titre: 'La Fusion des Mondes',
        description: 'Représentation artistique de l\'événement fondateur',
        type: 'concept_art',
        niveau: 8
      }
    ];

    for (const illus of illustrations) {
      await prisma.wiki_illustration.create({
        data: {
          histoire_id: histoire.id,
          titre: illus.titre,
          description: illus.description,
          image_url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=800`, // URL placeholder
          type: illus.type,
          niveau_deverrouillage: illus.niveau
        }
      });
      stats.illustrations = (stats.illustrations || 0) + 1;
    }

    const totalElements = Object.values(stats).reduce((acc, val) => acc + val, 0);

    console.log('✅ Wiki "Héros et la Fée" créé avec succès !');

    return NextResponse.json({
      success: true,
      data: {
        histoire: {
          id: histoire.id,
          titre: histoire.titre
        },
        stats: stats,
        total_elements: totalElements,
        wiki_url: `/wiki/${histoire.id}`
      },
      message: `Wiki "Héros et la Fée" créé ! ${totalElements} éléments ajoutés.`
    });

  } catch (error) {
    console.error('Erreur création wiki Héros et la Fée:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création du wiki',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Informations sur l'univers "Héros et la Fée"
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        univers: UNIVERS_DATA,
        statistiques: {
          personnages: PERSONNAGES_DATA.length,
          lieux: LIEUX_DATA.length,
          objets: OBJETS_DATA.length,
          anecdotes: ANECDOTES_DATA.length,
          total: PERSONNAGES_DATA.length + LIEUX_DATA.length + OBJETS_DATA.length + ANECDOTES_DATA.length
        },
        aperçu: {
          personnages: PERSONNAGES_DATA.map(p => ({ nom: p.nom, role: p.role, niveau: p.niveau })),
          lieux: LIEUX_DATA.map(l => ({ nom: l.nom, niveau: l.niveau })),
          objets: OBJETS_DATA.map(o => ({ nom: o.nom, niveau: o.niveau }))
        }
      },
      message: 'Données prêtes pour l\'import'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des données'
    }, { status: 500 });
  }
}

// DELETE - Supprimer le wiki "Héros et la Fée"
export async function DELETE() {
  try {
    const histoire = await prisma.histoire.findFirst({
      where: { titre: { contains: 'Héros et la Fée' } }
    });

    if (!histoire) {
      return NextResponse.json({
        success: false,
        error: 'Wiki "Héros et la Fée" non trouvé'
      }, { status: 404 });
    }

    // Supprimer tous les éléments wiki liés
    await prisma.wiki_personnage.deleteMany({ where: { histoire_id: histoire.id } });
    await prisma.wiki_lieu.deleteMany({ where: { histoire_id: histoire.id } });
    await prisma.wiki_objet.deleteMany({ where: { histoire_id: histoire.id } });
    await prisma.wiki_anecdote.deleteMany({ where: { histoire_id: histoire.id } });
    await prisma.wiki_illustration.deleteMany({ where: { histoire_id: histoire.id } });
    await prisma.wiki_debloquage.deleteMany({ where: { histoire_id: histoire.id } });

    // Supprimer l'histoire
    await prisma.histoire.delete({ where: { id: histoire.id } });

    return NextResponse.json({
      success: true,
      message: 'Wiki "Héros et la Fée" supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression wiki:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression du wiki'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}