import { NextResponse } from 'next/server';

// Stockage temporaire en mémoire (à remplacer par la base de données plus tard)
let votes: any[] = [];
let currentPoll: any = null;

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        currentPoll,
        votes,
        totalVotes: votes.length
      }
    });
  } catch (error) {
    console.error('Erreur récupération votes:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create_poll':
        currentPoll = {
          id: Date.now(),
          question: data.question,
          options: data.options,
          createdAt: new Date(),
          active: true,
          votes: {}
        };
        
        // Initialiser les votes à 0 pour chaque option
        data.options.forEach((option: string, index: number) => {
          currentPoll.votes[index] = 0;
        });
        
        return NextResponse.json({
          success: true,
          data: currentPoll
        });

      case 'vote':
        if (!currentPoll || !currentPoll.active) {
          return NextResponse.json({
            success: false,
            error: 'Aucun sondage actif'
          }, { status: 400 });
        }

        const vote = {
          id: Date.now(),
          userId: data.userId || 'anonymous',
          username: data.username || 'Anonyme',
          optionIndex: data.optionIndex,
          timestamp: new Date()
        };

        votes.push(vote);
        currentPoll.votes[data.optionIndex]++;

        return NextResponse.json({
          success: true,
          data: {
            vote,
            currentResults: currentPoll.votes
          }
        });

      case 'close_poll':
        if (currentPoll) {
          currentPoll.active = false;
          currentPoll.closedAt = new Date();
        }
        
        return NextResponse.json({
          success: true,
          data: currentPoll
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Action non reconnue'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur traitement vote:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
} 