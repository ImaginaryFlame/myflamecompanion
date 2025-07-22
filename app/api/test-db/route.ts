import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test simple pour vérifier si on peut se connecter et lire les données
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query('SELECT * FROM utilisateur LIMIT 5');
    await pool.end();
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Erreur test DB:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
} 