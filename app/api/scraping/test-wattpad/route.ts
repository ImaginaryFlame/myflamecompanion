import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url || !url.includes('wattpad.com')) {
      return NextResponse.json({ error: 'URL Wattpad invalide' }, { status: 400 });
    }

    console.log('🔍 Test de scraping pour:', url);

    // Test avec Playwright d'abord
    const playwrightResult = await testPlaywright(url);
    
    // Test avec Cheerio ensuite
    const cheerioResult = await testCheerio(url);

    return NextResponse.json({
      success: true,
      url,
      playwright: playwrightResult,
      cheerio: cheerioResult,
      recommendations: generateRecommendations(playwrightResult, cheerioResult)
    });

  } catch (error) {
    console.error('Erreur test scraping:', error);
    return NextResponse.json({
      error: 'Erreur lors du test de scraping',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

async function testPlaywright(url: string) {
  let browser = null;
  
  try {
    console.log('🎭 Test Playwright...');
    
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    await page.goto(url, { 
      waitUntil: 'networkidle', 
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);

    // Test tous les sélecteurs possibles pour le titre
    const titreTests = await page.evaluate(() => {
      const selectors = [
        'h1[data-testid="story-title"]',
        'h1.story-title',
        'h1.title',
        '.story-info h1',
        '.header h1',
        'h1',
        '[data-testid="story-title"]',
        '.story-header h1',
        '.story-banner h1',
        'title'
      ];
      
      const results = [];
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent?.trim() || '';
          results.push({
            selector,
            found: !!element,
            text: text.substring(0, 100),
            length: text.length
          });
        } else {
          results.push({
            selector,
            found: false,
            text: '',
            length: 0
          });
        }
      }
      return results;
    });

    // Test tous les sélecteurs possibles pour l'auteur
    const auteurTests = await page.evaluate(() => {
      const selectors = [
        '[data-testid="story-author"]',
        '.author-info a',
        '.story-author',
        '.by-line a',
        '.username',
        'a[href*="/user/"]',
        '.story-header .username',
        '.story-banner .username'
      ];
      
      const results = [];
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent?.trim() || '';
          results.push({
            selector,
            found: !!element,
            text: text.substring(0, 50),
            length: text.length
          });
        } else {
          results.push({
            selector,
            found: false,
            text: '',
            length: 0
          });
        }
      }
      return results;
    });

    // Test tous les sélecteurs possibles pour la description
    const descriptionTests = await page.evaluate(() => {
      const selectors = [
        '[data-testid="story-description"]',
        '.story-description',
        '.description',
        '.summary',
        '.story-info .description',
        '.story-info p',
        '.story-header .description',
        '.story-banner .description'
      ];
      
      const results = [];
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent?.trim() || '';
          results.push({
            selector,
            found: !!element,
            text: text.substring(0, 200),
            length: text.length
          });
        } else {
          results.push({
            selector,
            found: false,
            text: '',
            length: 0
          });
        }
      }
      return results;
    });

    // Test de la structure générale de la page
    const pageStructure = await page.evaluate(() => {
      const body = document.body;
      const mainElements = [];
      
      // Récupérer les principales balises et leurs classes/ids
      const importantSelectors = ['header', 'main', '.story', '.content', '[class*="story"]', '[id*="story"]'];
      
      for (const selector of importantSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
          if (index < 3) { // Limiter à 3 éléments par sélecteur
            mainElements.push({
              selector: selector,
              tag: el.tagName,
              classes: el.className,
              id: el.id,
              textPreview: el.textContent?.substring(0, 100) || ''
            });
          }
        });
      }
      
      return {
        title: document.title,
        mainElements,
        bodyClasses: body.className,
        bodyId: body.id
      };
    });

    await browser.close();

    return {
      success: true,
      method: 'playwright',
      pageStructure,
      tests: {
        titre: titreTests,
        auteur: auteurTests,
        description: descriptionTests
      }
    };

  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore
      }
    }
    
    return {
      success: false,
      method: 'playwright',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

async function testCheerio(url: string) {
  try {
    console.log('🕷️ Test Cheerio...');
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);

    // Test tous les sélecteurs possibles pour le titre
    const titreTests = [];
    const titreSelectors = [
      'h1[data-testid="story-title"]',
      'h1.story-title',
      'h1.title',
      '.story-info h1',
      '.header h1',
      'h1',
      '[data-testid="story-title"]',
      '.story-header h1',
      '.story-banner h1',
      'title'
    ];
    
    for (const selector of titreSelectors) {
      const element = $(selector).first();
      const text = element.text().trim();
      titreTests.push({
        selector,
        found: element.length > 0,
        text: text.substring(0, 100),
        length: text.length
      });
    }

    // Test tous les sélecteurs possibles pour l'auteur
    const auteurTests = [];
    const auteurSelectors = [
      '[data-testid="story-author"]',
      '.author-info a',
      '.story-author',
      '.by-line a',
      '.username',
      'a[href*="/user/"]',
      '.story-header .username',
      '.story-banner .username'
    ];
    
    for (const selector of auteurSelectors) {
      const element = $(selector).first();
      const text = element.text().trim();
      auteurTests.push({
        selector,
        found: element.length > 0,
        text: text.substring(0, 50),
        length: text.length
      });
    }

    // Test tous les sélecteurs possibles pour la description
    const descriptionTests = [];
    const descriptionSelectors = [
      '[data-testid="story-description"]',
      '.story-description',
      '.description',
      '.summary',
      '.story-info .description',
      '.story-info p',
      '.story-header .description',
      '.story-banner .description'
    ];
    
    for (const selector of descriptionSelectors) {
      const element = $(selector).first();
      const text = element.text().trim();
      descriptionTests.push({
        selector,
        found: element.length > 0,
        text: text.substring(0, 200),
        length: text.length
      });
    }

    // Structure générale de la page
    const pageStructure = {
      title: $('title').text(),
      bodyClasses: $('body').attr('class') || '',
      bodyId: $('body').attr('id') || '',
      mainElements: []
    };

    const importantSelectors = ['header', 'main', '.story', '.content', '[class*="story"]', '[id*="story"]'];
    for (const selector of importantSelectors) {
      $(selector).each((index, element) => {
        if (index < 3) {
          const $el = $(element);
          pageStructure.mainElements.push({
            selector: selector,
            tag: element.tagName,
            classes: $el.attr('class') || '',
            id: $el.attr('id') || '',
            textPreview: $el.text().substring(0, 100)
          });
        }
      });
    }

    return {
      success: true,
      method: 'cheerio',
      pageStructure,
      tests: {
        titre: titreTests,
        auteur: auteurTests,
        description: descriptionTests
      }
    };

  } catch (error) {
    return {
      success: false,
      method: 'cheerio',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

function generateRecommendations(playwrightResult: any, cheerioResult: any) {
  const recommendations = [];

  // Analyser les résultats pour recommander les meilleurs sélecteurs
  if (playwrightResult.success && playwrightResult.tests) {
    const bestTitre = playwrightResult.tests.titre.find((t: any) => t.found && t.length > 10);
    if (bestTitre) {
      recommendations.push(`Meilleur sélecteur titre (Playwright): ${bestTitre.selector}`);
    }

    const bestAuteur = playwrightResult.tests.auteur.find((a: any) => a.found && a.length > 2);
    if (bestAuteur) {
      recommendations.push(`Meilleur sélecteur auteur (Playwright): ${bestAuteur.selector}`);
    }

    const bestDescription = playwrightResult.tests.description.find((d: any) => d.found && d.length > 20);
    if (bestDescription) {
      recommendations.push(`Meilleur sélecteur description (Playwright): ${bestDescription.selector}`);
    }
  }

  if (cheerioResult.success && cheerioResult.tests) {
    const bestTitre = cheerioResult.tests.titre.find((t: any) => t.found && t.length > 10);
    if (bestTitre) {
      recommendations.push(`Meilleur sélecteur titre (Cheerio): ${bestTitre.selector}`);
    }

    const bestAuteur = cheerioResult.tests.auteur.find((a: any) => a.found && a.length > 2);
    if (bestAuteur) {
      recommendations.push(`Meilleur sélecteur auteur (Cheerio): ${bestAuteur.selector}`);
    }

    const bestDescription = cheerioResult.tests.description.find((d: any) => d.found && d.length > 20);
    if (bestDescription) {
      recommendations.push(`Meilleur sélecteur description (Cheerio): ${bestDescription.selector}`);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Aucun sélecteur efficace trouvé - la structure de Wattpad a peut-être changé');
  }

  return recommendations;
} 