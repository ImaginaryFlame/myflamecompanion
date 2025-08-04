import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const results = {
      histoires: { exists: false, count: 0, error: null },
      chapitres: { exists: false, count: 0, error: null },
      chaines: { exists: false, count: 0, error: null },
      videos: { exists: false, count: 0, error: null },
      notifications: { exists: false, count: 0, error: null }
    };

    // Test table histoires
    try {
      const histoires = await prisma.histoire.findMany();
      results.histoires.exists = true;
      results.histoires.count = histoires.length;
    } catch (error) {
      results.histoires.error = (error as Error).message;
    }

    // Test table chapitres
    try {
      const chapitres = await prisma.chapitre.findMany();
      results.chapitres.exists = true;
      results.chapitres.count = chapitres.length;
    } catch (error) {
      results.chapitres.error = (error as Error).message;
    }

    // Test table chaines
    try {
      const chaines = await prisma.chaine.findMany();
      results.chaines.exists = true;
      results.chaines.count = chaines.length;
    } catch (error) {
      results.chaines.error = (error as Error).message;
    }

    // Test table videos
    try {
      const videos = await prisma.video.findMany();
      results.videos.exists = true;
      results.videos.count = videos.length;
    } catch (error) {
      results.videos.error = (error as Error).message;
    }

    // Test table notifications
    try {
      const notifications = await prisma.notification.findMany();
      results.notifications.exists = true;
      results.notifications.count = notifications.length;
    } catch (error) {
      results.notifications.error = (error as Error).message;
    }

    return NextResponse.json({
      success: true,
      tables: results,
      summary: {
        total_tables: Object.keys(results).length,
        existing_tables: Object.values(results).filter(r => r.exists).length,
        total_records: Object.values(results).reduce((sum, r) => sum + r.count, 0)
      }
    });

  } catch (error) {
    console.error('Erreur diagnostic tables:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}