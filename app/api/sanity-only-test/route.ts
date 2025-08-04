import { NextRequest, NextResponse } from 'next/server'

// Configuration Sanity depuis les variables d'environnement
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || "64yujm4t"
const SANITY_DATASET = process.env.SANITY_DATASET || "production"
const SANITY_TOKEN = process.env.SANITY_TOKEN || "sk5sKK5Yv2qS6tztpnBEJ8KncBueu9juet4w0Joi7YMS82HumgNnG5W6qfnHjJcG0dtjkSJMRssn7vlClW44akMZ5KyaW1KC0Lfyki1kEehFuTeHvBsOuhVqRgV2tY2psugdzdKkWYDhSqhpBk6jJ3eucbh98JyHHqnuJFKqOAGMQzmqlkH3"

const SANITY_API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}`

// GET - Test Sanity seulement (sans base de données)
export async function GET(request: NextRequest) {
  try {
    const query = '*[_type == "personnage"][0..3]{_id, nom, prenom}'
    const url = `${SANITY_API_URL}?query=${encodeURIComponent(query)}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${SANITY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erreur Sanity API: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: {
        sanity_connection: 'OK',
        personnages_found: data.result?.length || 0,
        sample_personnages: data.result || [],
        config: {
          project_id: SANITY_PROJECT_ID,
          dataset: SANITY_DATASET,
          token_present: !!SANITY_TOKEN
        }
      },
      message: `✅ Sanity fonctionne ! ${data.result?.length || 0} personnages trouvés`
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur connexion Sanity',
      details: error.message,
      config: {
        project_id: SANITY_PROJECT_ID,
        dataset: SANITY_DATASET,
        token_present: !!SANITY_TOKEN
      }
    }, { status: 500 })
  }
}

// POST - Simuler un import Sanity sans base de données
export async function POST(request: NextRequest) {
  try {
    // Récupérer tous les personnages
    const queryPersonnages = '*[_type == "personnage"]{_id, nom, prenom, description}'
    const url = `${SANITY_API_URL}?query=${encodeURIComponent(queryPersonnages)}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${SANITY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Erreur Sanity API: ${response.status}`)
    }

    const data = await response.json()
    const personnages = data.result || []

    // Simuler un import réussi sans toucher à la base de données
    return NextResponse.json({
      success: true,
      data: {
        simulated_import: true,
        personnages_ready_for_import: personnages.length,
        sample_data: personnages.slice(0, 3),
        message: 'Import simulé - Sanity fonctionne parfaitement !',
        next_step: 'Redémarrer le serveur pour résoudre le problème de base de données'
      },
      message: `🚀 Prêt à importer ${personnages.length} personnages dès que la DB sera reconnectée !`
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur import simulé',
      details: error.message
    }, { status: 500 })
  }
}