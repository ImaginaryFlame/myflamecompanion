import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Créer des données de démonstration pour le système de récompenses
export async function POST(request: NextRequest) {
  try {
    console.log('🎮 Création des données de démonstration du système de récompenses...');

    // Vérifier s'il y a des histoires dans la base
    const histoires = await prisma.histoire.findMany({
      take: 1
    });

    if (histoires.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucune histoire trouvée. Créez d\'abord une histoire pour la démonstration.'
      }, { status: 400 });
    }

    const histoire = histoires[0];
    const histoireId = histoire.id;

    // Créer les niveaux/titres
    const niveauxTitres = [
      {
        niveau_requis: 1,
        nom_titre: 'Lecteur Débutant',
        description: 'Vos premiers pas dans l\'univers de la lecture',
        icone: '📖',
        couleur_hexa: '#3B82F6',
        avantages: { debloquage_rapide: true }
      },
      {
        niveau_requis: 5,
        nom_titre: 'Explorateur',
        description: 'Vous commencez à découvrir les secrets',
        icone: '🔍',
        couleur_hexa: '#10B981',
        avantages: { bonus_points: 10 }
      },
      {
        niveau_requis: 10,
        nom_titre: 'Érudit',
        description: 'Votre soif de connaissance est remarquable',
        icone: '🎓',
        couleur_hexa: '#8B5CF6',
        avantages: { bonus_points: 20, acces_exclusif: true }
      },
      {
        niveau_requis: 20,
        nom_titre: 'Maître Lecteur',
        description: 'Vous maîtrisez parfaitement cet univers',
        icone: '👑',
        couleur_hexa: '#F59E0B',
        avantages: { bonus_points: 50, acces_premium: true }
      },
      {
        niveau_requis: 50,
        nom_titre: 'Légende Vivante',
        description: 'Votre dévouement est légendaire',
        icone: '⭐',
        couleur_hexa: '#EF4444',
        avantages: { bonus_points: 100, statut_legendaire: true }
      }
    ];

    console.log('📊 Création des niveaux et titres...');
    for (const niveau of niveauxTitres) {
      await prisma.niveau_titre.upsert({
        where: { niveau_requis: niveau.niveau_requis },
        update: {},
        create: niveau
      });
    }

    // Créer du contenu wiki de démonstration
    console.log('👥 Création des personnages...');
    const personnages = [
      {
        histoire_id: histoireId,
        nom: 'Elena Shadowheart',
        description: 'Héroïne principale de l\'histoire, courageuse et déterminée.',
        apparence: 'Cheveux noirs corbeau, yeux violets perçants, porte toujours son pendentif en argent.',
        personnalite: 'Brave, loyale, parfois impulsive. Ne recule jamais devant le danger.',
        background: 'Orpheline élevée par sa grand-mère, elle découvre ses pouvoirs magiques à 16 ans.',
        image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        niveau_deverrouillage: 1,
        anecdotes: {
          creation: 'Son nom était à l\'origine "Elena Brightblade" mais a été changé pour refléter sa nature mystérieuse.',
          inspiration: 'Inspirée par les héroïnes de fantasy classique avec une touche moderne.'
        },
        chapitres_apparition: [1, 2, 3, 5, 8, 10, 12, 15]
      },
      {
        histoire_id: histoireId,
        nom: 'Marcus le Sage',
        description: 'Mentor d\'Elena, gardien des anciens secrets.',
        apparence: 'Vieil homme à la barbe blanche, yeux bleus perçants, toujours vêtu de robes bleues.',
        personnalite: 'Sage, patient, mystérieux. Cache beaucoup de secrets sur le passé.',
        background: 'Ancien membre du Conseil des Mages, exilé pour avoir protégé un secret dangereux.',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        niveau_deverrouillage: 3,
        anecdotes: {
          secret: 'Il est en réalité le père d\'Elena, mais ne le lui a jamais révélé.',
          pouvoir: 'Maîtrise la magie temporelle, ce qui explique sa longévité.'
        },
        chapitres_apparition: [2, 4, 6, 9, 11, 14]
      },
      {
        histoire_id: histoireId,
        nom: 'Lord Darkness',
        description: 'Antagoniste principal, seigneur des ombres.',
        apparence: 'Silhouette imposante drapée de noir, visage caché par un masque d\'obsidienne.',
        personnalite: 'Calculateur, impitoyable, obsédé par le pouvoir. Ancien héros déchu.',
        background: 'Était autrefois le plus grand héros du royaume avant de sombrer dans les ténèbres.',
        image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
        niveau_deverrouillage: 8,
        anecdotes: {
          revelation: 'Sa véritable identité est révélée au chapitre 18 - c\'est le frère de Marcus.',
          motivation: 'Sa chute est due à la perte de sa famille dans une guerre qu\'il n\'a pas pu empêcher.'
        },
        chapitres_apparition: [7, 10, 13, 16, 18, 20]
      }
    ];

    for (const personnage of personnages) {
      await prisma.wiki_personnage.create({
        data: personnage
      });
    }

    console.log('🏰 Création des lieux...');
    const lieux = [
      {
        histoire_id: histoireId,
        nom: 'Académie de Lumière',
        description: 'École de magie où Elena apprend à maîtriser ses pouvoirs.',
        histoire_lieu: 'Fondée il y a 500 ans par l\'Archimage Luminon, cette académie forme les plus grands mages du royaume.',
        image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
        niveau_deverrouillage: 2,
        anecdotes: {
          architecture: 'Les tours sont construites en cristal magique qui brille selon l\'humeur des occupants.',
          secret: 'Un passage secret mène aux archives interdites sous la bibliothèque principale.'
        },
        chapitres_apparition: [3, 4, 5, 11, 12]
      },
      {
        histoire_id: histoireId,
        nom: 'Forêt des Murmures',
        description: 'Forêt enchantée où les arbres parlent aux âmes pures.',
        histoire_lieu: 'Ancien lieu de pouvoir des druides, maintenant gardé par des esprits bienveillants.',
        image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        niveau_deverrouillage: 5,
        anecdotes: {
          magie: 'Les murmures des arbres révèlent l\'avenir à ceux qui savent les écouter.',
          gardien: 'Un ancien dragon vert protège le cœur de la forêt.'
        },
        chapitres_apparition: [6, 7, 14, 17]
      }
    ];

    for (const lieu of lieux) {
      await prisma.wiki_lieu.create({
        data: lieu
      });
    }

    console.log('⚔️ Création des objets...');
    const objets = [
      {
        histoire_id: histoireId,
        nom: 'Épée de Lumière Éternelle',
        description: 'Arme légendaire forgée dans la lumière pure.',
        proprietes: 'Repousse les ténèbres, brille intensément face au mal, indestructible.',
        histoire_objet: 'Forgée par les premiers mages-forgerons pour lutter contre l\'invasion démoniaque.',
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        niveau_deverrouillage: 10,
        anecdotes: {
          creation: 'Il a fallu 100 mages travaillant ensemble pendant 7 jours pour la créer.',
          pouvoir: 'Elle ne peut être maniée que par quelqu\'un au cœur pur.'
        },
        chapitres_apparition: [12, 15, 19, 20]
      },
      {
        histoire_id: histoireId,
        nom: 'Amulette des Vents',
        description: 'Pendentif magique d\'Elena, héritage de sa grand-mère.',
        proprietes: 'Permet de voler, contrôle des vents, protection contre la magie noire.',
        histoire_objet: 'Créée par la grand-mère d\'Elena qui était une puissante sorcière des vents.',
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        niveau_deverrouillage: 4,
        anecdotes: {
          heritage: 'Elle se transmet de mère en fille depuis 10 générations.',
          evolution: 'L\'amulette devient plus puissante au fur et à mesure qu\'Elena grandit.'
        },
        chapitres_apparition: [1, 3, 8, 11, 16]
      }
    ];

    for (const objet of objets) {
      await prisma.wiki_objet.create({
        data: objet
      });
    }

    console.log('📖 Création des anecdotes...');
    const anecdotes = [
      {
        histoire_id: histoireId,
        titre: 'Le Café Préféré de l\'Auteur',
        contenu: 'Tous les noms de lieux contenant "Lumière" ont été écrits dans un café parisien un dimanche pluvieux.',
        type: 'creation',
        niveau_deverrouillage: 3,
        chapitres_concernes: [3, 11, 12]
      },
      {
        histoire_id: histoireId,
        titre: 'Référence à Tolkien',
        contenu: 'La phrase "Et dans les ténèbres les lier" du chapitre 7 est un hommage direct au Seigneur des Anneaux.',
        type: 'reference',
        image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        niveau_deverrouillage: 7,
        chapitres_concernes: [7]
      },
      {
        histoire_id: histoireId,
        titre: 'Easter Egg Musical',
        contenu: 'Le nom "Elena Shadowheart" contient exactement le même nombre de lettres que "Imagine Dragons", le groupe préféré de l\'auteur.',
        type: 'easter_egg',
        niveau_deverrouillage: 12,
        chapitres_concernes: [1]
      }
    ];

    for (const anecdote of anecdotes) {
      await prisma.wiki_anecdote.create({
        data: anecdote
      });
    }

    console.log('🎨 Création des illustrations...');
    const illustrations = [
      {
        histoire_id: histoireId,
        titre: 'Portrait d\'Elena',
        description: 'Concept art officiel du personnage principal.',
        image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
        type: 'concept_art',
        niveau_deverrouillage: 1
      },
      {
        histoire_id: histoireId,
        titre: 'La Grande Bataille',
        description: 'Illustration de la bataille finale entre Elena et Lord Darkness.',
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        type: 'scene',
        niveau_deverrouillage: 15
      },
      {
        histoire_id: histoireId,
        titre: 'Plan de l\'Académie',
        description: 'Carte détaillée de l\'Académie de Lumière avec tous ses secrets.',
        image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        type: 'lieu',
        niveau_deverrouillage: 6
      }
    ];

    for (const illustration of illustrations) {
      await prisma.wiki_illustration.create({
        data: illustration
      });
    }

    // Statistiques finales
    const stats = {
      niveauxTitres: niveauxTitres.length,
      personnages: personnages.length,
      lieux: lieux.length,
      objets: objets.length,
      anecdotes: anecdotes.length,
      illustrations: illustrations.length
    };

    console.log('✅ Données de démonstration créées avec succès !');

    return NextResponse.json({
      success: true,
      data: {
        histoire_utilisee: {
          id: histoire.id,
          titre: histoire.titre
        },
        contenu_cree: stats,
        total_elements: Object.values(stats).reduce((acc, val) => acc + val, 0)
      },
      message: `Données de démonstration créées ! ${Object.values(stats).reduce((acc, val) => acc + val, 0)} éléments ajoutés au wiki.`
    });

  } catch (error) {
    console.error('Erreur création données démo:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création des données de démonstration'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}