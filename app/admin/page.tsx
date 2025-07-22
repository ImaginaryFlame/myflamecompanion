'use client';

import { useState } from 'react';

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
    url_source: "https://www.wattpad.com/story/202925290-la-fable-du-h%C3%A9ros-et-la-f%C3%A9e-acte-1-il-%C3%A9tait-une"
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
    url_source: "https://www.wattpad.com/story/287182109-le-h%C3%A9ros-et-la-f%C3%A9e-acte-2-puis-vint-la-revanche"
  }
];

export default function AdminPage() {
  const [logs, setLogs] = useState<string[]>(['Prêt à ajouter tes histoires ! 🎉']);
  const [isLoading, setIsLoading] = useState(false);

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLog = () => {
    setLogs([]);
  };

  const verifierAPI = async () => {
    log('🔍 Vérification de l\'API...');
    try {
      const response = await fetch('/api/histoire');
      if (response.ok) {
        const data = await response.json();
        log(`✅ API accessible - ${data.length} histoires trouvées`);
      } else {
        log(`❌ Erreur API: ${response.status}`);
      }
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const ajouterHistoire = async (histoire: any, index: number) => {
    log(`📚 Ajout de l'histoire ${index + 1}/2: "${histoire.titre.substring(0, 50)}..."`);
    
    try {
      const response = await fetch('/api/histoire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(histoire)
      });
      
      if (response.ok) {
        const data = await response.json();
        log(`✅ Histoire ajoutée avec succès (ID: ${data.id})`);
        return data;
      } else {
        const error = await response.json();
        log(`❌ Erreur lors de l'ajout: ${JSON.stringify(error)}`);
        return null;
      }
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return null;
    }
  };

  const ajouterToutesLesHistoires = async () => {
    setIsLoading(true);
    log('🚀 Début de l\'ajout des histoires d\'ImaginaryFlame...');
    
    const resultats = [];
    
    for (let i = 0; i < histoires.length; i++) {
      const resultat = await ajouterHistoire(histoires[i], i);
      resultats.push(resultat);
      
      // Pause entre chaque ajout
      if (i < histoires.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const succes = resultats.filter(r => r !== null).length;
    log(`📊 Résultat final: ${succes}/${histoires.length} histoires ajoutées`);
    
    if (succes === histoires.length) {
      log('🎉 Toutes tes histoires ont été ajoutées avec succès !');
      log('🔗 Vérifie sur: /api/histoire');
    } else {
      log('⚠️ Certaines histoires n\'ont pas pu être ajoutées.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🚀 Administration - Ajouter les histoires
          </h1>
          
          <div className="text-center space-x-4 mb-8">
            <button
              onClick={ajouterToutesLesHistoires}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {isLoading ? '⏳ Ajout en cours...' : '📚 Ajouter mes 2 histoires'}
            </button>
            
            <button
              onClick={verifierAPI}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              🔍 Vérifier l'API
            </button>
            
            <button
              onClick={clearLog}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              🧹 Effacer le log
            </button>
          </div>
          
          <div className="bg-gray-50 border rounded-lg p-4 h-96 overflow-y-auto">
            <div className="font-mono text-sm whitespace-pre-wrap">
              {logs.map((log, index) => (
                <div key={index} className={
                  log.includes('✅') ? 'text-green-600' :
                  log.includes('❌') ? 'text-red-600' :
                  log.includes('🔍') || log.includes('📚') ? 'text-blue-600' :
                  'text-gray-700'
                }>
                  {log}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <a 
              href="/api/histoire" 
              target="_blank"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              🔗 Voir toutes les histoires (API)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 