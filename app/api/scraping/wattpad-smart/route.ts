import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium, Browser } from 'playwright';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction pour vérifier les droits admin
function verifierDroitsAdmin(request: Request): boolean {
  // TODO: Implémenter une vraie vérification d'authentification
  // Pour l'instant, on simule que c'est toujours l'admin
  // Plus tard, tu peux vérifier un token JWT, une session, etc.
  
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret';
  
  // En développement, on laisse passer
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // En production, vérifier le token
  return authHeader === `Bearer ${adminToken}`;
}

// Fonction pour nettoyer les chapitres et enlever les liens de navigation
function nettoyerChapitres(chapitres: { titre: string; numero: number; url?: string }[]) {
  const datePattern = /((Sun|Mon|Tue|Wed|Thu|Fri|Sat),?\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}$/i;
  const datePatternFR = /((dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi),?\s+)?(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{1,2},?\s+\d{4}$/i;

  const chapitresNettoyes = chapitres.filter(chapitre => {
    let titre = chapitre.titre.trim();
    // Retirer la date à la fin du titre (anglais ou français)
    titre = titre.replace(datePattern, '').replace(datePatternFR, '').trim();
    
    // Enlever les liens de navigation Wattpad
    const titreMin = titre.toLowerCase();
    const isNavigationLink = (
      titreMin.includes('wattpad originals') ||
      titreMin.includes('try premium') ||
      titreMin.includes('get the app') ||
      titreMin.includes('writers') ||
      titreMin.includes('brand partnerships') ||
      titreMin.includes('jobs') ||
      titreMin.includes('press') ||
      titreMin.includes('payment policy') ||
      titreMin.includes('accessibility') ||
      titreMin.includes('terms') ||
      titreMin.includes('privacy') ||
      titreMin.includes('help') ||
      titreMin.includes('browse') ||
      titreMin.includes('community') ||
      titreMin.includes('write') ||
      titreMin.includes('log in') ||
      titreMin.includes('sign up') ||
      // Enlever les textes trop courts ou vides
      titre.length < 5
    );
    
    chapitre.titre = titre;
    return !isNavigationLink;
  });
  
  // Renuméroter les chapitres après nettoyage
  return chapitresNettoyes.map((chapitre, index) => ({
    ...chapitre,
    numero: index + 1
  }));
}

export async function POST(request: Request) {
  try {
    // 🔒 Vérification des droits admin
    if (!verifierDroitsAdmin(request)) {
      console.log('⚠️ Tentative d\'accès non autorisée au scraping');
      return NextResponse.json({
        error: 'Accès refusé - Seuls les administrateurs peuvent scraper des histoires'
      }, { status: 403 });
    }

    const { url, verificationMaj = false } = await request.json();
    
    if (!url || !url.includes('wattpad.com')) {
      return NextResponse.json({ error: 'URL Wattpad invalide' }, { status: 400 });
    }

    if (verificationMaj) {
      console.log('🔍 [ADMIN] Début de la vérification des mises à jour pour:', url);
    } else {
      console.log('🧠 [ADMIN] Début du scraping intelligent pour:', url);
    }

    // Vérifier si l'histoire existe déjà
    const histoireExistante = await prisma.histoire.findFirst({
      where: { url_source: url },
      include: {
        chapitres: {
          orderBy: { numero_chapitre: 'asc' }
        }
      }
    });

    let histoireData;
    let histoire;

    if (verificationMaj && !histoireExistante) {
      return NextResponse.json({
        error: 'Histoire non trouvée en base - utilisez le scraping normal d\'abord'
      }, { status: 400 });
    }

    if (verificationMaj && histoireExistante) {
      // Mode vérification : utiliser les données existantes
      console.log('🔍 Mode vérification - Histoire existante trouvée');
      histoire = histoireExistante;
      histoireData = {
        titre: histoire.titre,
        auteur: histoire.auteur,
        description: histoire.description,
        image_couverture: histoire.image_couverture
      };
    } else {
      // Mode scraping normal
      // Méthode 1: Essayer avec Playwright
      console.log('🎭 Tentative avec Playwright...');
      histoireData = await tentativePlaywright(url);
      
      // Méthode 2: Si échec, essayer avec Cheerio
      if (!histoireData) {
        console.log('🕷️ Tentative avec Cheerio...');
        histoireData = await tentativeCheerio(url);
      }
      
      // Méthode 3: Si échec, utiliser le fallback intelligent
      if (!histoireData) {
        console.log('🔄 Utilisation du fallback intelligent...');
        histoireData = getFallbackIntelligent(url);
      }
      
      if (!histoireData) {
        throw new Error('Impossible d\'extraire les informations avec toutes les méthodes');
      }

      console.log('✅ Histoire récupérée:', histoireData.titre.substring(0, 50) + '...');

      if (histoireExistante) {
        console.log('📚 Histoire déjà existante, mise à jour...');
        
        // Retirer les champs problématiques pour la sauvegarde
        const { methode, chapitres, ...dataToSave } = histoireData;
        
        histoire = await prisma.histoire.update({
          where: { id: histoireExistante.id },
          data: dataToSave,
          include: { 
            chapitres: {
              orderBy: { numero_chapitre: 'asc' }
            }
          }
        });
        
        console.log(`✅ Histoire mise à jour: ${histoire.titre}`);
        
        // Gérer les chapitres séparément si il y en a
        if (chapitres && chapitres.length > 0) {
          for (const chapitre of chapitres) {
            const chapitreExistant = await prisma.chapitre.findFirst({
              where: { histoire_id: histoire.id, numero_chapitre: chapitre.numero }
            });
            
            if (chapitreExistant) {
              await prisma.chapitre.update({ 
                where: { id: chapitreExistant.id }, 
                data: { 
                  titre_chapitre: chapitre.titre, 
                  numero_chapitre: chapitre.numero,
                  url_chapitre: chapitre.url || null
                } 
              });
            } else {
              await prisma.chapitre.create({ 
                data: { 
                  titre_chapitre: chapitre.titre, 
                  numero_chapitre: chapitre.numero, 
                  histoire_id: histoire.id,
                  url_chapitre: chapitre.url || null
                } 
              });
            }
          }
        }
      } else {
        console.log('📚 Création de la nouvelle histoire...');
        
        // Retirer les champs problématiques pour la sauvegarde
        const { methode, chapitres, ...dataToSave } = histoireData;
        
        histoire = await prisma.histoire.create({
          data: {
            ...dataToSave,
            url_source: url,
            source: 'Wattpad'
          },
          include: { 
            chapitres: {
              orderBy: { numero_chapitre: 'asc' }
            }
          }
        });
        
        console.log(`✅ Nouvelle histoire créée: ${histoire.titre}`);
        
        // Ajouter les chapitres si il y en a
        if (chapitres && chapitres.length > 0) {
          console.log(`📖 Ajout de ${chapitres.length} chapitres...`);
          
          for (const chapitre of chapitres) {
            await prisma.chapitre.create({
              data: {
                titre_chapitre: chapitre.titre,
                numero_chapitre: chapitre.numero,
                histoire_id: histoire.id
              }
            });
          }
          
          console.log(`✅ ${chapitres.length} chapitres ajoutés`);
        } else {
          console.log('📖 Aucun chapitre à ajouter (normal si pas trouvés par scraping)');
        }
      }
    }

    // Compter les chapitres réels pour le message de retour
    const chapitresFinaux = await prisma.chapitre.findMany({
      where: { histoire_id: histoire.id },
      orderBy: { numero_chapitre: 'asc' }
    });

    const totalChapitres = chapitresFinaux.length;
    const chapitresOriginaux = histoireData.chapitres ? histoireData.chapitres.length : 0;
    
    console.log(`✅ Scraping terminé - ${totalChapitres} chapitres au total`);

    return NextResponse.json({
      success: true,
      histoire: {
        id: histoire.id,
        titre: histoire.titre,
        auteur: histoire.auteur
      },
      chapitres: {
        total: totalChapitres,
        nouveaux: chapitresOriginaux,
        existants: totalChapitres - chapitresOriginaux
      },
      methode: histoireData.methode || 'fallback',
      misAJour: verificationMaj ? 'Histoire mise à jour' : 'Histoire scrapée'
    });

  } catch (error) {
    console.error('Erreur scraping intelligent:', error);
    return NextResponse.json({
      error: 'Erreur lors du scraping intelligent',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Tentative avec Playwright (plus robuste pour les pages dynamiques)
async function tentativePlaywright(url: string) {
  let browser: Browser | null = null;
  
  try {
    console.log('🎭 Tentative Playwright...');
    
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // Aller sur la page avec un timeout plus long
    await page.goto(url, { 
      waitUntil: 'networkidle', 
      timeout: 15000 
    });
    
    // Attendre que le contenu se charge
    await page.waitForTimeout(2000);
    
    // Sélecteurs qui fonctionnent réellement (basés sur les tests)
    let titre = '';
    const titreSélecteurs = [
      'title' // Le seul qui fonctionne selon les tests
    ];
    
    for (const selector of titreSélecteurs) {
      try {
        const element = await page.$(selector);
        if (element) {
          let text = await element.textContent();
          if (text && text.trim().length > 3) {
            text = text.trim();
            // Nettoyer le titre de la page si c'est le sélecteur title
            if (selector === 'title') {
              text = text.replace(/ - Wattpad.*$/i, '').replace(/^.*? - /, '').trim();
            }
            if (text.length > 3 && !text.toLowerCase().includes('wattpad')) {
              titre = text;
              console.log(`✅ Titre trouvé avec "${selector}": ${titre}`);
              break;
            }
          }
        }
      } catch (e) {
        // Continuer avec le prochain sélecteur
      }
    }
    
    // Sélecteurs pour l'auteur (basés sur les tests)
    let auteur = '';
    const auteurSélecteurs = [
      'a[href*="/user/"]' // Le seul qui fonctionne selon les tests
    ];
    
    for (const selector of auteurSélecteurs) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim().length > 0) {
            auteur = text.trim();
            console.log(`✅ Auteur trouvé avec "${selector}": ${auteur}`);
            break;
          }
        }
      } catch (e) {
        // Continuer avec le prochain sélecteur
      }
    }
    
    // Essayer différents sélecteurs pour la description
    let description = '';
    const descriptionSélecteurs = [
      '[data-testid="story-description"]',
      '.story-description',
      '.description',
      '.summary',
      '.story-info .description',
      '.story-info p'
    ];
    
    for (const selector of descriptionSélecteurs) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim().length > 10) {
            description = text.trim();
            console.log(`✅ Description trouvée avec "${selector}": ${description.substring(0, 100)}...`);
            break;
          }
        }
      } catch (e) {
        // Continuer avec le prochain sélecteur
      }
    }
    
    // Récupérer les chapitres depuis la table des matières
    const chapitres: { titre: string; numero: number; url?: string }[] = [];
    
    // Attendre que la table des matières se charge
    try {
      await page.waitForSelector('.table-of-contents, [class*="table"], ul, ol', { timeout: 8000 });
      console.log('✅ Table des matières détectée');
    } catch (e) {
      console.log('⚠️ Table des matières non trouvée rapidement, on continue...');
    }
    
    // Sélecteurs spécifiques pour la table des matières de Wattpad
    const chapitreSélecteurs = [
      '.table-of-contents li a',
      '.table-of-contents a',
      'ul.table-of-contents li a',
      'ol.table-of-contents li a',
      'ul li a',
      'ol li a',
      'li a',
      '[class*="chapter"] a',
      '[class*="part"] a',
      'a[href*="/chapter/"]',
      'a[href*="/part/"]',
      'a[href*="wattpad.com/"]'
    ];
    
    for (const selector of chapitreSélecteurs) {
      try {
        const elements = await page.$$(selector);
        console.log(`🔍 Test sélecteur chapitres "${selector}": ${elements.length} éléments`);
        
        if (elements.length > 0) {
          for (let i = 0; i < Math.min(elements.length, 200); i++) { // Augmenté à 200 chapitres
            try {
              const element = elements[i];
              const href = await element.getAttribute('href');
              const titreTexte = await element.textContent();
              
              // Vérifier que c'est un lien avec du contenu
              if (href && titreTexte && titreTexte.trim() && titreTexte.length > 2) {
                const titre = titreTexte.trim();
                
                // Filtrer les liens non pertinents (plus intelligent)
                const isRelevantChapter = (
                  // Doit avoir un titre significatif
                  titre.length >= 3 &&
                  // Ne doit pas être un lien de navigation/interface
                  !titre.toLowerCase().includes('profile') && 
                  !titre.toLowerCase().includes('user') &&
                  !titre.toLowerCase().includes('follow') &&
                  !titre.toLowerCase().includes('home') &&
                  !titre.toLowerCase().includes('browse') &&
                  !titre.toLowerCase().includes('login') &&
                  !titre.toLowerCase().includes('sign up') &&
                  !titre.toLowerCase().includes('settings') &&
                  !titre.toLowerCase().includes('help') &&
                  !titre.toLowerCase().includes('about') &&
                  !titre.toLowerCase().includes('contact') &&
                  !titre.toLowerCase().includes('privacy') &&
                  !titre.toLowerCase().includes('terms') &&
                  // Ne doit pas être un doublon
                  !chapitres.find(c => c.titre === titre) &&
                  // Le lien doit pointer vers quelque chose de pertinent
                  (href.includes('/chapter/') || 
                   href.includes('/part/') || 
                   href.includes('wattpad.com/') ||
                   href.includes('/story/') ||
                   // OU avoir un titre qui ressemble à un chapitre
                   titre.toLowerCase().includes('chapter') ||
                   titre.toLowerCase().includes('chapitre') ||
                   titre.toLowerCase().includes('prologue') ||
                   titre.toLowerCase().includes('epilogue') ||
                   // OU être assez long pour être un titre de chapitre
                   titre.length > 8)
                );
                
                if (isRelevantChapter) {
                  // Construire l'URL complète si nécessaire
                  let urlComplète = href;
                  if (href.startsWith('/')) {
                    urlComplète = `https://www.wattpad.com${href}`;
                  }
                  
                  chapitres.push({
                    titre: titre,
                    numero: chapitres.length + 1, // Numérotation séquentielle
                    url: urlComplète
                  });
                  
                  console.log(`📖 Chapitre ${chapitres.length}: "${titre}" -> ${urlComplète}`);
                  
                  // Limiter à 200 chapitres max
                  if (chapitres.length >= 200) {
                    console.log('⚠️ Limite de 200 chapitres atteinte');
                    break;
                  }
                }
              }
            } catch (e) {
              console.log(`⚠️ Erreur extraction chapitre ${i + 1}:`, e);
            }
          }
          
          if (chapitres.length > 0) {
            console.log(`✅ ${chapitres.length} chapitres trouvés avec "${selector}"`);
            break;
          }
        }
      } catch (e) {
        console.log(`❌ Erreur avec sélecteur "${selector}":`, e);
      }
    }
    
    await browser.close();
    
    if (titre && titre.length > 3) {
      console.log(`🎭 Playwright réussi - Titre: "${titre}", Auteur: "${auteur}", Chapitres: ${chapitres.length}`);
      const chapitresNettoyes = nettoyerChapitres(chapitres);
      console.log(`🧹 Après nettoyage: ${chapitresNettoyes.length} chapitres valides`);
      
      return {
        titre,
        auteur: auteur || 'ImaginaryFlame',
        description: description || 'Histoire récupérée depuis Wattpad',
        chapitres: chapitresNettoyes,
        image_couverture: null,
        methode: 'playwright'
      };
    }
    
    // Si pas de titre mais qu'on a des chapitres, on peut quand même retourner quelque chose
    if (chapitres.length > 0) {
      console.log(`🎭 Playwright partiel - ${chapitres.length} chapitres trouvés sans titre complet`);
      const chapitresNettoyes = nettoyerChapitres(chapitres);
      console.log(`🧹 Après nettoyage: ${chapitresNettoyes.length} chapitres valides`);
      
      return {
        titre: titre || 'Titre à déterminer',
        auteur: auteur || 'ImaginaryFlame',
        description: description || 'Histoire récupérée depuis Wattpad',
        chapitres: chapitresNettoyes,
        image_couverture: null,
        methode: 'playwright-partiel'
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Erreur Playwright:', error);
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

// Tentative avec Cheerio (plus rapide mais moins robuste)
async function tentativeCheerio(url: string) {
  try {
    console.log('🕷️ Tentative Cheerio...');
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // Sélecteurs pour le titre (basés sur les tests)
    let titre = '';
    const titreSélecteurs = [
      'title' // Le seul qui fonctionne selon les tests
    ];
    
    for (const selector of titreSélecteurs) {
      const element = $(selector).first();
      if (element.length > 0) {
        let text = element.text().trim();
        if (text && text.length > 3) {
          // Nettoyer le titre de la page si c'est le sélecteur title
          if (selector === 'title') {
            text = text.replace(/ - Wattpad.*$/i, '').replace(/^.*? - /, '').trim();
          }
          if (text.length > 3 && !text.toLowerCase().includes('wattpad')) {
            titre = text;
            console.log(`✅ Titre trouvé avec "${selector}": ${titre}`);
            break;
          }
        }
      }
    }
    
    // Sélecteurs pour l'auteur (basés sur les tests) 
    let auteur = '';
    const auteurSélecteurs = [
      'a[href*="/user/"]' // Le seul qui fonctionne selon les tests
    ];
    
    for (const selector of auteurSélecteurs) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = element.text().trim();
        if (text && text.length > 0) {
          auteur = text;
          console.log(`✅ Auteur trouvé avec "${selector}": ${auteur}`);
          break;
        }
      }
    }
    
    // Essayer différents sélecteurs pour la description
    let description = '';
    const descriptionSélecteurs = [
      '[data-testid="story-description"]',
      '.story-description',
      '.description',
      '.summary',
      '.story-info .description',
      '.story-info p'
    ];
    
    for (const selector of descriptionSélecteurs) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = element.text().trim();
        if (text && text.length > 10) {
          description = text;
          console.log(`✅ Description trouvée avec "${selector}": ${description.substring(0, 100)}...`);
          break;
        }
      }
    }
    
    // Récupérer les chapitres
    const chapitres: { titre: string; numero: number; url?: string }[] = [];
    
    // Sélecteurs spécifiques pour la table des matières de Wattpad
    const chapitreSélecteurs = [
      // Sélecteurs basés sur la structure réelle observée sur Wattpad
      '.table-of-contents li a',
      '.table-of-contents a',
      'ul.table-of-contents li a',
      'ol.table-of-contents li a',
      // Sélecteurs pour les éléments de liste dans la table
      'ul li a',
      'ol li a',
      'li a',
      // Sélecteurs pour les liens dans des conteneurs de chapitres
      '[class*="chapter"] a',
      '[class*="part"] a',
      // Sélecteurs génériques pour tous les liens sur la page (avec filtrage)
      'a[href*="/chapter/"]',
      'a[href*="/part/"]',
      'a[href*="wattpad.com/"]'
    ];
    
    for (const selector of chapitreSélecteurs) {
      const elements = $(selector);
      console.log(`🔍 Test sélecteur chapitres "${selector}": ${elements.length} éléments`);
      
      if (elements.length > 0) {
        elements.each((index, element) => {
          if (index < 200) { // Augmenté à 200 chapitres
            try {
              const $element = $(element);
              const href = $element.attr('href');
              const titreTexte = $element.text().trim();
              
              // Vérifier que c'est un lien avec du contenu
              if (href && titreTexte && titreTexte.length > 2) {
                const titre = titreTexte;
                
                // Filtrer les liens non pertinents (plus intelligent)
                const isRelevantChapter = (
                  // Doit avoir un titre significatif
                  titre.length >= 3 &&
                  // Ne doit pas être un lien de navigation/interface
                  !titre.toLowerCase().includes('profile') && 
                  !titre.toLowerCase().includes('user') &&
                  !titre.toLowerCase().includes('follow') &&
                  !titre.toLowerCase().includes('home') &&
                  !titre.toLowerCase().includes('browse') &&
                  !titre.toLowerCase().includes('login') &&
                  !titre.toLowerCase().includes('sign up') &&
                  !titre.toLowerCase().includes('settings') &&
                  !titre.toLowerCase().includes('help') &&
                  !titre.toLowerCase().includes('about') &&
                  !titre.toLowerCase().includes('contact') &&
                  !titre.toLowerCase().includes('privacy') &&
                  !titre.toLowerCase().includes('terms') &&
                  // Ne doit pas être un doublon
                  !chapitres.find(c => c.titre === titre) &&
                  // Le lien doit pointer vers quelque chose de pertinent
                  (href.includes('/chapter/') || 
                   href.includes('/part/') || 
                   href.includes('wattpad.com/') ||
                   href.includes('/story/') ||
                   // OU avoir un titre qui ressemble à un chapitre
                   titre.toLowerCase().includes('chapter') ||
                   titre.toLowerCase().includes('chapitre') ||
                   titre.toLowerCase().includes('prologue') ||
                   titre.toLowerCase().includes('epilogue') ||
                   // OU être assez long pour être un titre de chapitre
                   titre.length > 8)
                );
                
                if (isRelevantChapter) {
                  // Construire l'URL complète si nécessaire
                  let urlComplète = href;
                  if (href.startsWith('/')) {
                    urlComplète = `https://www.wattpad.com${href}`;
                  }
                  
                  chapitres.push({
                    titre: titre,
                    numero: chapitres.length + 1, // Numérotation séquentielle
                    url: urlComplète
                  });
                  
                  console.log(`📖 Chapitre ${chapitres.length}: "${titre}" -> ${urlComplète}`);
                  
                  // Limiter à 200 chapitres max
                  if (chapitres.length >= 200) {
                    console.log('⚠️ Limite de 200 chapitres atteinte');
                    return false; // Arrêter l'itération
                  }
                }
              }
            } catch (e) {
              console.log(`⚠️ Erreur extraction chapitre ${index + 1}:`, e);
            }
          }
        });
        
        if (chapitres.length > 0) {
          console.log(`✅ ${chapitres.length} chapitres trouvés avec "${selector}"`);
          break;
        }
      }
    }
    
    if (titre && titre.length > 3) {
      console.log(`🕷️ Cheerio réussi - Titre: "${titre}", Auteur: "${auteur}", Chapitres: ${chapitres.length}`);
      const chapitresNettoyes = nettoyerChapitres(chapitres);
      console.log(`🧹 Après nettoyage: ${chapitresNettoyes.length} chapitres valides`);
      
      return {
        titre,
        auteur: auteur || 'ImaginaryFlame',
        description: description || 'Histoire récupérée depuis Wattpad',
        chapitres: chapitresNettoyes,
        image_couverture: null,
        methode: 'cheerio'
      };
    }
    
    // Si pas de titre mais qu'on a des chapitres, on peut quand même retourner quelque chose
    if (chapitres.length > 0) {
      console.log(`🕷️ Cheerio partiel - ${chapitres.length} chapitres trouvés sans titre complet`);
      const chapitresNettoyes = nettoyerChapitres(chapitres);
      console.log(`🧹 Après nettoyage: ${chapitresNettoyes.length} chapitres valides`);
      
      return {
        titre: titre || 'Titre à déterminer',
        auteur: auteur || 'ImaginaryFlame',
        description: description || 'Histoire récupérée depuis Wattpad',
        chapitres: chapitresNettoyes,
        image_couverture: null,
        methode: 'cheerio-partiel'
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Erreur Cheerio:', error);
    return null;
  }
}

// Fallback intelligent basé sur l'URL
function getFallbackIntelligent(url: string) {
  console.log('🔄 Fallback intelligent...');
  
  // Extraire l'ID de l'histoire depuis l'URL
  const match = url.match(/\/story\/(\d+)-([^\/]+)/);
  if (!match) {
    console.log('❌ URL non reconnue pour le fallback');
    return null;
  }
  
  const [, storyId, slug] = match;
  console.log(`📋 ID histoire: ${storyId}, Slug: ${slug}`);
  
  // Convertir le slug en titre lisible
  const titre = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/%C3%A9/g, 'é')
    .replace(/%C3%A8/g, 'è')
    .replace(/%C3%AA/g, 'ê')
    .replace(/%C3%A0/g, 'à')
    .replace(/%C3%A7/g, 'ç');
  
  // Données spécifiques pour tes histoires connues (SANS chapitres inventés)
  const histoiresConnues: { [key: string]: any } = {
    '315315133': {
      titre: 'The Hero and the Fairy - Act 1: Once Upon a Time, the Conquest of the Throne of the Kingdom of Sylvania',
      auteur: 'ImaginaryFlame',
      description: '[REWRITE/CORRECTION] In a future so distant that it could mark the end of times, two souls that oppose everything - two races enemies by nature and history - will see their destinies cross...',
      chapitres: [] // Pas de chapitres inventés - sera récupéré par scraping réel ou laissé vide
    },
    '202925290': {
      titre: 'La Fable du Héros et la Fée - Acte 1 : Il Etait Une Fois, la Conquête du Trône du Royaume de Sylvania',
      auteur: 'ImaginaryFlame',
      description: '[RÉÉCRITURE/CORRECTION] Dans un futur si lointain qu\'il pourrait marquer la fin des temps, deux âmes que tout oppose - deux races ennemies par nature par histoire - vont voir leurs destins se croiser...',
      chapitres: [] // Pas de chapitres inventés
    },
    '287182109': {
      titre: 'La Fable du Héros et la Fée - Acte 2 : Puis vint, la Revanche des Parias',
      auteur: 'ImaginaryFlame',
      description: '"Héros usurpateurs ! Consumés par la rage, la haine et le péché, vous pensiez réellement être les élus de cette piteuse prophétie ?!"',
      chapitres: [] // Pas de chapitres inventés
    }
  };
  
  if (histoiresConnues[storyId]) {
    console.log(`✅ Histoire connue trouvée pour ID ${storyId}`);
    return {
      ...histoiresConnues[storyId],
      image_couverture: null,
      methode: 'fallback-connu'
    };
  }
  
  // Fallback générique si l'histoire n'est pas dans nos données connues
  console.log(`🔄 Fallback générique pour: ${titre}`);
  return {
    titre: titre.length > 100 ? titre.substring(0, 97) + '...' : titre,
    auteur: 'ImaginaryFlame',
    description: `Histoire récupérée depuis Wattpad - ${titre}`,
    chapitres: [], // Pas de chapitres inventés - l'utilisateur peut les ajouter manuellement
    image_couverture: null,
    methode: 'fallback-generique'
  };
} 