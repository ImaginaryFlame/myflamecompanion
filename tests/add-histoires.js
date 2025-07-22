// Script pour ajouter les histoires d'ImaginaryFlame via l'API

const API_BASE = 'http://localhost:3000/api';

// Données des histoires à ajouter
const histoires = [
  {
    titre: "La Fable du Héros et la Fée - Acte 1 : Il Etait Une Fois, la Conquête du Trône du Royaume de Sylvania",
    description: `[RÉÉCRITURE/CORRECTION] 

Dans un futur si lointain qu'il pourrait marquer la fin des temps, deux âmes que tout oppose - deux races ennemies par nature et par histoire - vont voir leurs destins se croiser. Ils ne se connaissent ni d'Adam, ni d'Ève, et pourtant, un lien ancestral les unit : une légende vieille de cinq millénaires, gravée dans les étoiles et les cendres du monde.

Face à l'éveil de l'éternel ennemi de l'humanité, une entité si redoutable qu'elle avait autrefois plongé la création entière dans les ténèbres avant d'être scellée, ces deux êtres doivent s'unir malgré leurs différences. Leur quête ne sera pas seulement de repousser les ténèbres, mais de défier un passé qui les divise, pour redéfinir l'avenir d'un monde mourant.

L'espoir de toute existence repose désormais entre leurs mains, liées par un héritage qui pourrait autant les sauver que les détruire.

~~~

Alors qu'il venait de terrasser un énième monstre pour retrouver l'assassin de sa mère, le Héros, par un concours de circonstances, se retrouve, enfermé, dans les geôles d'un royaume hostiles aux êtres humains : Sylvania. 

Il fera la rencontre d'une fée sans ailes et sans nom qui l'aidera à sortir de là et bien plus encore. Pour la remercier, il s'inscrira en tant que représentant de cette fée qui est, l'une des princesses de ce royaume, lors d'un tournoi pour désigner la prochaine reine de Sylvania.

Au cours de celui-ci, il devra faire face à la cruauté des autres participants, à la détresse des nécessiteux et de leur représentante : Malalalivia Grave, et devra se confronter à une secte qui veut ramener à la vie une ancienne reine maléfique de Sylvania qui terrorisait le royaume fut un temps. 

Un spin-off de la Flamme Imaginaire.`,
    auteur: "ImaginaryFlame",
    source: "Wattpad",
    url_source: "https://www.wattpad.com/story/202925290-la-fable-du-h%C3%A9ros-et-la-f%C3%A9e-acte-1-il-%C3%A9tait-une",
    image_couverture: null
  },
  {
    titre: "La Fable du Héros et la Fée - Acte 2 : Puis vint, la Revanche des Parias",
    description: `"Héros usurpateurs ! Consumés par la rage, la haine et le péché, vous pensiez réellement être les élus de cette piteuse prophétie ?! Votre minable vengeance s'arrête ici !"

"Sois tu es avec moi, sois tu mourras comme l'une de tes trop nombreuses ignobles mères, monstrueuse engeance sans nom." 

"Que le royaume de Sylvania soit condamné à la damnation éternelle !" 

Il était une fois, dans un sinistre monde où les étoiles disparurent de la voûte céleste tandis que l'apocalypse se profilait à grands pas, le Héros et la Fée, séparés mais toujours liés à leur destinée, parcouraient le chemin menant à leur objectif respectif.

S'alliant avec Avelilinélia, la Fée espérait tirer d'elle la justesse qui lui manquait pour s'attirer autant la sympathie des Basfonds que des nobles du Sanctuaire. Mais certains secrets inavouables du royaume de la Forêt des Fées referont surface et mettront sens dessus-dessous la paix du royaume.

D'un autre côté, à la suite de sa défaite lors du tournoi, Avelilinélia cherchera à trouver sa place au sein du royaume, ce qui l'amènera à devenir l'un des stratèges du royaume et directrice de campagne de la Fée. Toutefois, sa quête d'un but noble la conduira sur une voie qui lui fera renier toutes ses convictions...

De retour dans l'un des derniers bastions de l'Homme, Vicenti, Nalo se mettra en quête d'un moyen de façonner un appareil lui permettant de retrouver le Némésis. Toutefois, au cours de cette quête, il percevra la voix de sa sœur résonner dans son esprit. Pourrait-il y avoir ne serait-ce qu'une infime possibilité que sa sœur soit encore en vie ?

Quant à la reine Audisélia, elle devra relever le défi le plus monumental de son règne en Sylvania, confrontée aux tromperies de ses sujets et à ses propres mensonges.

C'est dans cet entremêlement de destinées que nos protagonistes découvriront la part la plus noire de leur être qu'ils devront surpasser sinon périront comme ceux qui les ont précédés...`,
    auteur: "ImaginaryFlame",
    source: "Wattpad", 
    url_source: "https://www.wattpad.com/story/287182109-le-h%C3%A9ros-et-la-f%C3%A9e-acte-2-puis-vint-la-revanche",
    image_couverture: null
  }
];

// Fonction pour ajouter une histoire
async function ajouterHistoire(histoire) {
  try {
    const response = await fetch(`${API_BASE}/histoire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(histoire)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Histoire ajoutée: "${data.titre}" (ID: ${data.id})`);
      return data;
    } else {
      const error = await response.json();
      console.error(`❌ Erreur pour "${histoire.titre}":`, error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erreur réseau pour "${histoire.titre}":`, error.message);
    return null;
  }
}

// Fonction principale pour ajouter toutes les histoires
async function ajouterToutesLesHistoires() {
  console.log('🚀 Début de l\'ajout des histoires d\'ImaginaryFlame...\n');
  
  const resultats = [];
  
  for (let i = 0; i < histoires.length; i++) {
    console.log(`📚 Ajout de l'histoire ${i + 1}/${histoires.length}...`);
    const resultat = await ajouterHistoire(histoires[i]);
    resultats.push(resultat);
    
    // Pause entre chaque ajout
    if (i < histoires.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const succes = resultats.filter(r => r !== null).length;
  console.log(`\n📊 Résultat: ${succes}/${histoires.length} histoires ajoutées avec succès`);
  
  if (succes === histoires.length) {
    console.log('🎉 Toutes tes histoires ont été ajoutées !');
    console.log('🔗 Vérifie sur: http://localhost:3000/api/histoire');
  } else {
    console.log('⚠️ Certaines histoires n\'ont pas pu être ajoutées.');
  }
  
  return resultats;
}

// Exporter pour utilisation dans Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ajouterToutesLesHistoires, ajouterHistoire };
} else {
  // Exécuter automatiquement si dans un navigateur
  ajouterToutesLesHistoires();
} 