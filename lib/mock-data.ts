// Données mockées pour développement quand Supabase est inaccessible

export const mockHistoires = [
  {
    id: 1,
    titre: "La Flamme Imaginaire - Tome 1",
    description: "Une épopée fantastique dans un monde où la magie et la technologie coexistent...",
    auteur: "ImaginaryFlame",
    source: "Wattpad",
    url_source: "https://www.wattpad.com/story/123456789",
    date_publication: new Date('2023-01-15'),
    image_couverture: null,
    urls_multiples: null
  },
  {
    id: 2,
    titre: "Chronicles of Eternity",
    description: "Un voyage à travers les dimensions temporelles...",
    auteur: "ImaginaryFlame", 
    source: "Wattpad",
    url_source: "https://www.wattpad.com/story/987654321",
    date_publication: new Date('2023-06-20'),
    image_couverture: null,
    urls_multiples: null
  },
  {
    id: 3,
    titre: "Digital Dreams",
    description: "Dans un futur cyberpunk, les rêves deviennent réalité...",
    auteur: "ImaginaryFlame",
    source: "Wattpad", 
    url_source: "https://www.wattpad.com/story/555777999",
    date_publication: new Date('2024-02-10'),
    image_couverture: null,
    urls_multiples: null
  }
];

export const mockChapitres = [
  // Chapitres pour "La Flamme Imaginaire"
  { id: 1, histoire_id: 1, numero_chapitre: 1, titre_chapitre: "Le Réveil", contenu: null, date_publication: new Date('2023-01-15'), url_chapitre: "https://www.wattpad.com/chapter1" },
  { id: 2, histoire_id: 1, numero_chapitre: 2, titre_chapitre: "Premiers Pouvoirs", contenu: null, date_publication: new Date('2023-01-22'), url_chapitre: "https://www.wattpad.com/chapter2" },
  { id: 3, histoire_id: 1, numero_chapitre: 3, titre_chapitre: "L'Académie", contenu: null, date_publication: new Date('2023-01-29'), url_chapitre: "https://www.wattpad.com/chapter3" },
  { id: 4, histoire_id: 1, numero_chapitre: 4, titre_chapitre: "Le Premier Combat", contenu: null, date_publication: new Date('2023-02-05'), url_chapitre: "https://www.wattpad.com/chapter4" },
  { id: 5, histoire_id: 1, numero_chapitre: 5, titre_chapitre: "Révélations", contenu: null, date_publication: new Date('2023-02-12'), url_chapitre: "https://www.wattpad.com/chapter5" },
  
  // Chapitres pour "Chronicles of Eternity"  
  { id: 6, histoire_id: 2, numero_chapitre: 1, titre_chapitre: "La Porte Temporelle", contenu: null, date_publication: new Date('2023-06-20'), url_chapitre: "https://www.wattpad.com/chapter6" },
  { id: 7, histoire_id: 2, numero_chapitre: 2, titre_chapitre: "L'Ère Antique", contenu: null, date_publication: new Date('2023-06-27'), url_chapitre: "https://www.wattpad.com/chapter7" },
  { id: 8, histoire_id: 2, numero_chapitre: 3, titre_chapitre: "Paradoxe Temporel", contenu: null, date_publication: new Date('2023-07-04'), url_chapitre: "https://www.wattpad.com/chapter8" },
  
  // Chapitres pour "Digital Dreams"
  { id: 9, histoire_id: 3, numero_chapitre: 1, titre_chapitre: "Neo-Tokyo 2087", contenu: null, date_publication: new Date('2024-02-10'), url_chapitre: "https://www.wattpad.com/chapter9" },
  { id: 10, histoire_id: 3, numero_chapitre: 2, titre_chapitre: "Le Hacker", contenu: null, date_publication: new Date('2024-02-17'), url_chapitre: "https://www.wattpad.com/chapter10" },
  { id: 11, histoire_id: 3, numero_chapitre: 3, titre_chapitre: "Matrix des Rêves", contenu: null, date_publication: new Date('2024-02-24'), url_chapitre: "https://www.wattpad.com/chapter11" },
  { id: 12, histoire_id: 3, numero_chapitre: 4, titre_chapitre: "L'Éveil Numérique", contenu: null, date_publication: new Date('2024-03-03'), url_chapitre: "https://www.wattpad.com/chapter12" }
];

export const mockChaines = [
  {
    id: 1,
    nom: "ImaginaryFlame",
    type: "youtube",
    channel_id: "UC123456789",
    nom_affichage: "ImaginaryFlame - Histoires & Gaming",
    description: "Chaîne dédiée aux histoires fantastiques et au gaming",
    avatar_url: "https://example.com/avatar1.jpg",
    url_chaine: "https://youtube.com/@ImaginaryFlame",
    abonnes: 45200,
    videos_total: 127,
    vues_total: 2840000,
    actif: true,
    date_creation: new Date('2022-03-15'),
    derniere_maj: new Date('2024-01-15')
  },
  {
    id: 2,
    nom: "FlameStream",
    type: "twitch", 
    channel_id: "flamestream_live",
    nom_affichage: "FlameStream - Live Writing",
    description: "Live d'écriture et sessions créatives",
    avatar_url: "https://example.com/avatar2.jpg",
    url_chaine: "https://twitch.tv/flamestream_live",
    abonnes: 8900,
    videos_total: 89,
    vues_total: 456000,
    actif: true,
    date_creation: new Date('2023-01-10'),
    derniere_maj: new Date('2024-01-10')
  },
  {
    id: 3,
    nom: "FlameGaming",
    type: "youtube",
    channel_id: "UC987654321", 
    nom_affichage: "Flame Gaming Corner",
    description: "Gaming, reviews et let's play",
    avatar_url: "https://example.com/avatar3.jpg",
    url_chaine: "https://youtube.com/@FlameGaming",
    abonnes: 23800,
    videos_total: 203,
    vues_total: 1650000,
    actif: true,
    date_creation: new Date('2021-08-20'),
    derniere_maj: new Date('2024-01-08')
  }
];

export const mockVideos = [
  // Vidéos YouTube ImaginaryFlame
  { id: 1, chaine_id: 1, video_id: "ABC123", titre: "La Flamme Imaginaire - Chapitre 1 Audio", description: "Lecture audio du premier chapitre", miniature_url: null, duree: 1200, vues: 15400, likes: 890, commentaires: 56, date_publication: new Date('2024-01-15'), date_creation: new Date('2024-01-15'), tags: null, categorie: "Audio", histoire_liee_id: 1 },
  { id: 2, chaine_id: 1, video_id: "DEF456", titre: "Comment j'écris mes histoires fantastiques", description: "Processus créatif et conseils d'écriture", miniature_url: null, duree: 980, vues: 8200, likes: 420, commentaires: 73, date_publication: new Date('2024-01-10'), date_creation: new Date('2024-01-10'), tags: null, categorie: "Tutorial", histoire_liee_id: null },
  { id: 3, chaine_id: 1, video_id: "GHI789", titre: "Chronicles of Eternity - Bande Annonce", description: "Teaser de ma nouvelle série", miniature_url: null, duree: 180, vues: 12800, likes: 650, commentaires: 89, date_publication: new Date('2023-12-20'), date_creation: new Date('2023-12-20'), tags: null, categorie: "Trailer", histoire_liee_id: 2 },
  
  // Vidéos YouTube FlameGaming  
  { id: 4, chaine_id: 3, video_id: "JKL012", titre: "Elden Ring - Boss Fight Epic", description: "Combat épique contre Malenia", miniature_url: null, duree: 1560, vues: 45200, likes: 2100, commentaires: 340, date_publication: new Date('2024-01-05'), date_creation: new Date('2024-01-05'), tags: null, categorie: "Gaming", histoire_liee_id: null },
  { id: 5, chaine_id: 3, video_id: "MNO345", titre: "Top 10 RPG de 2023", description: "Ma sélection des meilleurs RPG", miniature_url: null, duree: 1800, vues: 32100, likes: 1650, commentaires: 280, date_publication: new Date('2023-12-31'), date_creation: new Date('2023-12-31'), tags: null, categorie: "Review", histoire_liee_id: null },
  
  // VODs Twitch
  { id: 6, chaine_id: 2, video_id: "PQR678", titre: "Session d'écriture - Digital Dreams Ch.5", description: "Écriture en direct du chapitre 5", miniature_url: null, duree: 7200, vues: 1200, likes: 89, commentaires: 45, date_publication: new Date('2024-01-12'), date_creation: new Date('2024-01-12'), tags: null, categorie: "Writing", histoire_liee_id: 3 },
  { id: 7, chaine_id: 2, video_id: "STU901", titre: "Q&A avec les lecteurs", description: "Session questions/réponses", miniature_url: null, duree: 4500, vues: 890, likes: 67, commentaires: 34, date_publication: new Date('2024-01-08'), date_creation: new Date('2024-01-08'), tags: null, categorie: "Q&A", histoire_liee_id: null }
];

export const mockNotifications = [
  { id: 1, utilisateur_id: 1, titre: "Nouveau chapitre disponible", message: "Le chapitre 4 de 'Digital Dreams' est maintenant disponible !", type: "nouveau_chapitre", lu: false, date_creation: new Date('2024-01-20'), data_extra: { histoire_id: 3, chapitre_id: 12 } },
  { id: 2, utilisateur_id: 1, titre: "Nouvelle vidéo YouTube", message: "ImaginaryFlame a publié une nouvelle vidéo", type: "nouvelle_video", lu: false, date_creation: new Date('2024-01-18'), data_extra: { chaine_id: 1, video_id: 1 } },
  { id: 3, utilisateur_id: 1, titre: "Stream en cours", message: "FlameStream est en live pour une session d'écriture", type: "live", lu: true, date_creation: new Date('2024-01-17'), data_extra: { chaine_id: 2 } },
  { id: 4, utilisateur_id: 1, titre: "Mise à jour d'histoire", message: "L'histoire 'La Flamme Imaginaire' a été mise à jour", type: "mise_a_jour", lu: true, date_creation: new Date('2024-01-15'), data_extra: { histoire_id: 1 } }
];