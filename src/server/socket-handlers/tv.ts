import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';
import {
  broadcastSessionState,
  broadcastCurrentPrompt,
  broadcastSpotlightedResponses,
} from './broadcast';

export interface TVMessage {
  type: 'join';
  roomCode: string;
}

/**
 * Handle TV/Projector viewer connection
 * TV viewers join the public room to see only facilitator-approved content
 */
export async function handleTVMessage(
  io: SocketIOServer,
  socket: Socket,
  message: TVMessage
): Promise<void> {
  console.log(`[TV] handleTVMessage called with:`, message);
  if (message.type === 'join') {
    await handleTVJoin(io, socket, message.roomCode);
  } else {
    console.warn(`[TV] Unknown message type: ${(message as any).type}`);
    socket.emit('server', {
      type: 'error',
      sessionId: '',
      payload: {
        code: 'UNKNOWN_MESSAGE_TYPE',
        message: `Unknown TV message type: ${(message as any).type}`,
      },
    });
  }
}

async function handleTVJoin(
  io: SocketIOServer,
  socket: Socket,
  roomCode: string
): Promise<void> {
  try {
    console.log(`[TV] Join request for room code: ${roomCode}`);
    
    // Find session by room code
    const session = await prisma.session.findUnique({
      where: { roomCode: roomCode.toUpperCase() },
      include: {
        currentPrompt: true,
      },
    });

    if (!session) {
      console.log(`[TV] Session not found for room code: ${roomCode}`);
      socket.emit('server', {
        type: 'error',
        sessionId: '',
        payload: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found. Please check the room code.',
        },
      });
      return;
    }

    console.log(`[TV] Session found: ${session.id}, module: ${session.moduleId}`);

  // Join TV to public room (read-only, sees only spotlighted content)
  socket.join(`public:${session.id}`);
  socket.join(`session:${session.id}`);

  // Mark socket as TV viewer
  socket.data.role = 'tv';
  socket.data.sessionId = session.id;

  // Send current state
  socket.emit('server', {
    type: 'joined',
    sessionId: session.id,
    payload: {
      sessionId: session.id,
      role: 'tv',
    },
  });

  // Send current session state
  await broadcastSessionState(io, session.id);

  // Send current prompt if exists
  if (session.currentPromptId) {
    await broadcastCurrentPrompt(io, session.id, session.currentPromptId);
  }

  // Send current spotlighted responses
  await broadcastSpotlightedResponses(io, session.id);

  // For Thought Reframe Relay, send module state
  if (session.moduleId === 'thought_reframe_relay') {
    const defaults = (session.sharingDefaults as any) || {};
    const moduleState = defaults.moduleState || 'LOBBY';
    
    socket.emit('thoughtReframeRelay:state', { state: moduleState });

    if (session.currentPrompt) {
      socket.emit('thoughtReframeRelay:prompt', {
        prompt: {
          id: session.currentPrompt.id,
          text: session.currentPrompt.text,
          roundNumber: session.currentRound,
        },
      });
    }

    // Send current spotlighted responses for Thought Reframe Relay
    const responses = await prisma.response.findMany({
      where: {
        sessionId: session.id,
        isSpotlighted: true,
        isHidden: false,
        alternativeThought: { not: '__PASS__' },
      },
      orderBy: { submittedAt: 'asc' },
    });

    socket.emit('thoughtReframeRelay:spotlighted', {
      responses: responses.map((r) => ({
        id: r.id,
        reframe: r.alternativeThought || '',
      })),
    });

    // Send anonymous count
    const count = await prisma.response.count({
      where: {
        sessionId: session.id,
        alternativeThought: { not: '__PASS__' },
      },
    });

    socket.emit('thoughtReframeRelay:anonymousCount', { count });
    }
    
    console.log(`[TV] Successfully joined session: ${session.id}`);
  } catch (error) {
    console.error('[TV] Error joining session:', error);
    socket.emit('server', {
      type: 'error',
      sessionId: '',
      payload: {
        code: 'TV_JOIN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to join session',
      },
    });
  }
}

