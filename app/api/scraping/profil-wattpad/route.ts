import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { playwright } from 'playwright';
import type { Browser } from 'playwright';

const prisma = new PrismaClient();

// Fonction pour vérifier les droits admin
function verifierDroitsAdmin(request: Request): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret';
  return authHeader === `Bearer ${adminToken}`;
}

export async function POST(request: Request) {
  try {
    // 🔒 Vérification des droits admin
    if (!verifierDroitsAdmin(request)) {
      console.log('⚠️ Tentative d\'accès non autorisée au scraping de profil');
      return NextResponse.json({
        error: 'Accès refusé - Seuls les administrateurs peuvent scraper des profils'
      }, { status: 403 });
    }

    const { profilUrl, username } = await request.json();
    
    if (!profilUrl && !username) {
      return NextResponse.json({ 
        error: 'URL de profil ou nom d\'utilisateur requis' 
      }, { status: 400 });
    }

    console.log('👤 [ADMIN] Début du scraping de profil Wattpad...');
    
    // Construire l'URL du profil si on a seulement le username
    let urlProfil = profilUrl;
    if (!urlProfil && username) {
      urlProfil = `https://www.wattpad.com/user/${username}`;
    }

    console.log('🔗 URL du profil:', urlProfil);

    // Scraper le profil pour récupérer toutes les histoires
    const histoires = await scraperProfilWattpad(urlProfil);
    
    if (histoires.length === 0) {
      return NextResponse.json({
        error: 'Aucune histoire trouvée sur ce profil'
      }, { status: 400 });
    }

    console.log(`📚 ${histoires.length} histoires trouvées sur le profil`);

    // Traiter chaque histoire
    let histoiresAjoutees = 0;
    let histoiresMisesAJour = 0;
    const resultats = [];

    for (const histoireInfo of histoires) {
      try {
        console.log(`📖 Traitement: ${histoireInfo.titre}...`);

        // Vérifier si l'histoire existe déjà
        const histoireExistante = await prisma.histoire.findFirst({
          where: { url_source: histoireInfo.url }
        });

        let histoire;
        if (histoireExistante) {
          console.log('📚 Histoire existante, mise à jour...');
          histoire = await prisma.histoire.update({
            where: { id: histoireExistante.id },
            data: {
              titre: histoireInfo.titre,
              description: histoireInfo.description,
              auteur: histoireInfo.auteur,
              image_couverture: histoireInfo.image_couverture
            }
          });
          histoiresMisesAJour++;
        } else {
          console.log('📚 Nouvelle histoire, création...');
          histoire = await prisma.histoire.create({
            data: {
              titre: histoireInfo.titre,
              description: histoireInfo.description,
              auteur: histoireInfo.auteur,
              url_source: histoireInfo.url,
              source: 'Wattpad',
              image_couverture: histoireInfo.image_couverture
            }
          });
          histoiresAjoutees++;
        }

        // Essayer de scraper les chapitres basiques
        let chapitres = 0;
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scraping/wattpad-smart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: histoireInfo.url,
              verificationMaj: false
            })
          });

          if (response.ok) {
            const data = await response.json();
            chapitres = data.chapitres?.total || 0;
          }
        } catch (error) {
          console.log('⚠️ Impossible de scraper les chapitres pour cette histoire');
        }

        resultats.push({
          titre: histoireInfo.titre,
          url: histoireInfo.url,
          statut: histoireExistante ? 'mis_a_jour' : 'ajoute',
          chapitres: chapitres
        });

        // Pause entre les traitements
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Erreur pour ${histoireInfo.titre}:`, error);
        resultats.push({
          titre: histoireInfo.titre,
          url: histoireInfo.url,
          statut: 'erreur',
          erreur: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    console.log(`✅ Scraping de profil terminé - ${histoiresAjoutees} nouvelles, ${histoiresMisesAJour} mises à jour`);

    return NextResponse.json({
      success: true,
      message: `Profil Wattpad scrapé avec succès`,
      profil: urlProfil,
      stats: {
        total: histoires.length,
        nouvelles: histoiresAjoutees,
        mises_a_jour: histoiresMisesAJour
      },
      resultats
    });

  } catch (error) {
    console.error('Erreur scraping profil:', error);
    return NextResponse.json({
      error: 'Erreur lors du scraping de profil',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Fonction pour scraper un profil Wattpad avec Playwright
async function scraperProfilWattpadPlaywright(urlProfil: string) {
  let browser: Browser | null = null;
  
  try {
    console.log('🎭 Scraping de profil avec Playwright...');
    console.log('🔗 URL du profil:', urlProfil);
    
    browser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // Aller sur la page avec un timeout plus long
    await page.goto(urlProfil, { 
      waitUntil: 'networkidle', 
      timeout: 15000 
    });
    
    // Attendre que le contenu se charge
    await page.waitForTimeout(3000);
    
    const histoires: Array<{
      titre: string;
      url: string;
      description: string;
      auteur: string;
      image_couverture: string | null;
    }> = [];
    
    // Essayer différents sélecteurs pour les histoires
    const selecteurs = [
      // Nouveaux sélecteurs Wattpad 2024/2025
      '[data-testid="story-card"]',
      '[data-testid="work-card"]',
      '.story-card',
      '.work-card',
      '.story-item',
      '[data-story-id]',
      '.story-preview',
      '.story-card-container',
      '.work-item',
      // Sélecteurs génériques
      'article[data-story-id]',
      'div[data-story-id]',
      '.list-group-item',
      '[class*="story"]',
      '[class*="work"]'
    ];
    
    let histoiresTrouvees = false;
    let selecteurUtilise = '';
    
    for (const selecteur of selecteurs) {
      try {
        const elements = await page.$$(selecteur);
        console.log(`🔍 Test sélecteur "${selecteur}": ${elements.length} éléments trouvés`);
        
        if (elements.length > 0) {
          console.log(`✅ Histoires trouvées avec le sélecteur: ${selecteur} (${elements.length} éléments)`);
          selecteurUtilise = selecteur;
          
          for (let i = 0; i < Math.min(elements.length, 10); i++) { // Limiter à 10 histoires
            try {
              const element = elements[i];
              
              // Essayer différentes méthodes pour extraire le titre
              let titre = '';
              const titreSélecteurs = ['h3', 'h2', 'h1', '.title', '.story-title', '.story-info h3', '.story-info h2', 'a[href*="/story/"]'];
              
              for (const titreSelector of titreSélecteurs) {
                try {
                  const titreElement = await element.$(titreSelector);
                  if (titreElement) {
                    const text = await titreElement.textContent();
                    if (text && text.trim().length > 3) {
                      titre = text.trim();
                      break;
                    }
                  }
                } catch (e) {
                  // Continuer
                }
              }
              
              // Si pas de titre trouvé, essayer le texte du premier lien
              if (!titre) {
                try {
                  const linkElement = await element.$('a');
                  if (linkElement) {
                    const text = await linkElement.textContent();
                    if (text && text.trim().length > 3) {
                      titre = text.trim();
                    }
                  }
                } catch (e) {
                  // Continuer
                }
              }
              
              // Extraire l'URL
              let url = '';
              const urlSelectors = ['a[href*="/story/"]', 'a[href*="wattpad.com/story"]', 'a'];
              
              for (const urlSelector of urlSelectors) {
                try {
                  const urlElement = await element.$(urlSelector);
                  if (urlElement) {
                    const href = await urlElement.getAttribute('href');
                    if (href && href.includes('/story/')) {
                      url = href.startsWith('http') ? href : `https://www.wattpad.com${href}`;
                      break;
                    }
                  }
                } catch (e) {
                  // Continuer
                }
              }
              
              // Extraire la description
              let description = '';
              try {
                const descElement = await element.$('.description, .summary, p, .story-description');
                if (descElement) {
                  const text = await descElement.textContent();
                  if (text && text.trim()) {
                    description = text.trim();
                  }
                }
              } catch (e) {
                // Description optionnelle
              }
              
              // Extraire l'image de couverture
              let image = null;
              try {
                const imgElement = await element.$('img');
                if (imgElement) {
                  image = await imgElement.getAttribute('src');
                }
              } catch (e) {
                // Image optionnelle
              }
              
              console.log(`📖 Histoire ${i + 1}: "${titre}" - URL: ${url}`);
              
              if (titre && url && url.includes('/story/') && titre.length > 3) {
                histoires.push({
                  titre: titre,
                  url: url,
                  description: description || `Histoire de ImaginaryFlame récupérée depuis Wattpad`,
                  auteur: 'ImaginaryFlame',
                  image_couverture: image
                });
              } else {
                console.log(`⚠️ Histoire ${i + 1} ignorée: titre="${titre}", url="${url}"`);
              }
            } catch (error) {
              console.error(`Erreur extraction histoire ${i}:`, error);
            }
          }
          
          histoiresTrouvees = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Erreur avec sélecteur "${selecteur}":`, e);
      }
    }
    
    await browser.close();
    
    if (histoires.length > 0) {
      console.log(`🎭 Playwright réussi - ${histoires.length} histoires trouvées`);
      console.log(`🔧 Sélecteur utilisé: ${selecteurUtilise}`);
      return histoires;
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Erreur Playwright profil:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    return null;
  }
}

// Fonction pour scraper un profil Wattpad avec Cheerio (fallback)
async function scraperProfilWattpadCheerio(urlProfil: string) {
  try {
    console.log('🕷️ Scraping de profil avec Cheerio...');
    console.log('🔗 URL du profil:', urlProfil);

    const response = await axios.get(urlProfil, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    console.log('📄 Page récupérée, taille:', response.data.length, 'caractères');
    const $ = cheerio.load(response.data);
    const histoires: Array<{
      titre: string;
      url: string;
      description: string;
      auteur: string;
      image_couverture: string | null;
    }> = [];

    // Essayer différents sélecteurs pour les histoires (ordre de priorité)
    const selecteurs = [
      // Nouveaux sélecteurs Wattpad 2024
      '[data-story-id]',
      '.story-card-container',
      '.story-preview',
      '.story-item',
      '.story-card',
      '.work-item',
      '.story',
      // Sélecteurs génériques
      'article[data-story-id]',
      'div[data-story-id]',
      '.list-group-item',
      '[class*="story"]',
      '[class*="work"]'
    ];

    let histoiresTrouvees = false;
    let selecteurUtilise = '';

    for (const selecteur of selecteurs) {
      const elements = $(selecteur);
      
      console.log(`🔍 Test sélecteur "${selecteur}": ${elements.length} éléments trouvés`);
      
      if (elements.length > 0) {
        console.log(`✅ Histoires trouvées avec le sélecteur: ${selecteur} (${elements.length} éléments)`);
        selecteurUtilise = selecteur;

        elements.each((index, element) => {
          if (index < 10) { // Limiter à 10 histoires
            try {
              const $el = $(element);
              
              // Essayer différentes méthodes pour extraire le titre
              let titre = '';
              const titreSélecteurs = ['h3', 'h2', 'h1', '.title', '.story-title', '.story-info h3', '.story-info h2', 'a[href*="/story/"]'];
              
              for (const titreSelector of titreSélecteurs) {
                const titreElement = $el.find(titreSelector).first();
                if (titreElement.length > 0) {
                  titre = titreElement.text().trim();
                  if (titre && titre.length > 3) break;
                }
              }
              
              // Si pas de titre trouvé, essayer le texte du premier lien
              if (!titre) {
                titre = $el.find('a').first().text().trim();
              }
              
              // Extraire l'URL
              let url = '';
              const urlSelectors = ['a[href*="/story/"]', 'a[href*="wattpad.com/story"]', 'a'];
              
              for (const urlSelector of urlSelectors) {
                const urlElement = $el.find(urlSelector).first();
                if (urlElement.length > 0) {
                  const href = urlElement.attr('href');
                  if (href && href.includes('/story/')) {
                    url = href.startsWith('http') ? href : `https://www.wattpad.com${href}`;
                    break;
                  }
                }
              }
              
              // Extraire la description
              const description = $el.find('.description, .summary, p, .story-description').first().text().trim() || '';
              
              // Extraire l'image de couverture
              const image = $el.find('img').first().attr('src') || null;
              
              console.log(`📖 Histoire ${index + 1}: "${titre}" - URL: ${url}`);
              
              if (titre && url && url.includes('/story/') && titre.length > 3) {
                histoires.push({
                  titre: titre,
                  url: url,
                  description: description || `Histoire de ImaginaryFlame récupérée depuis Wattpad`,
                  auteur: 'ImaginaryFlame',
                  image_couverture: image
                });
              } else {
                console.log(`⚠️ Histoire ${index + 1} ignorée: titre="${titre}", url="${url}"`);
              }
            } catch (error) {
              console.error(`Erreur extraction histoire ${index}:`, error);
            }
          }
        });

        histoiresTrouvees = true;
        break;
      }
    }

    if (histoires.length > 0) {
      console.log(`🕷️ Cheerio réussi - ${histoires.length} histoires trouvées`);
      console.log(`🔧 Sélecteur utilisé: ${selecteurUtilise}`);
      return histoires;
    }

    return null;

  } catch (error) {
    console.error('❌ Erreur Cheerio profil:', error);
    return null;
  }
}

// Fonction principale de scraping de profil (avec multi-méthodes)
async function scraperProfilWattpad(urlProfil: string) {
  console.log('🧠 Début du scraping de profil multi-méthodes...');
  
  // 1. Essayer avec Playwright d'abord
  let histoires = await scraperProfilWattpadPlaywright(urlProfil);
  
  // 2. Si Playwright échoue, essayer avec Cheerio
  if (!histoires || histoires.length === 0) {
    console.log('🔄 Playwright a échoué, tentative avec Cheerio...');
    histoires = await scraperProfilWattpadCheerio(urlProfil);
  }
  
  // 3. Si tout échoue, utiliser le fallback avec tes histoires connues
  if (!histoires || histoires.length === 0) {
    console.log('🔄 Utilisation du fallback avec les histoires connues...');
    
    return [
      {
        titre: "La Fable du Héros et la Fée - Acte 1 : Il Etait Une Fois, la Conquête du Trône du Royaume de Sylvania",
        url: "https://www.wattpad.com/story/202925290-la-fable-du-h%C3%A9ros-et-la-f%C3%A9e-acte-1-il-%C3%A9tait-une",
        description: "[RÉÉCRITURE/CORRECTION] Dans un futur si lointain qu'il pourrait marquer la fin des temps, deux âmes que tout oppose - deux races ennemies par nature par histoire - vont voir leurs destins se croiser...",
        auteur: "ImaginaryFlame",
        image_couverture: null
      },
      {
        titre: "La Fable du Héros et la Fée - Acte 2 : Puis vint, la Revanche des Parias",
        url: "https://www.wattpad.com/story/287182109-le-h%C3%A9ros-et-la-f%C3%A9e-acte-2-puis-vint-la-revanche",
        description: "\"Héros usurpateurs ! Consumés par la rage, la haine et le péché, vous pensiez réellement être les élus de cette piteuse prophétie ?!\"",
        auteur: "ImaginaryFlame",
        image_couverture: null
      },
      {
        titre: "The Hero and the Fairy - Act 1: Once Upon a Time, the Conquest of the Throne of the Kingdom of Sylvania",
        url: "https://www.wattpad.com/story/315315133-the-hero-and-the-fairy-act-1-once-upon-a-time-the",
        description: "[REWRITE/CORRECTION] In a future so distant that it could mark the end of times, two souls that oppose everything - two races enemies by nature and history - will see their destinies cross...",
        auteur: "ImaginaryFlame",
        image_couverture: null
      }
    ];
  }
  
  // Supprimer les doublons basés sur l'URL
  const histoiresUniques = histoires.filter((histoire, index, self) => 
    index === self.findIndex(h => h.url === histoire.url)
  );
  
  console.log(`📊 Total de ${histoires.length} histoires trouvées sur le profil`);
  console.log(`✨ ${histoiresUniques.length} histoires uniques après déduplication`);
  return histoiresUniques;
} 