import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';
import type { ThoughtReframeRelayState } from '@/stores/thought-reframe-relay-store';

/**
 * Module-specific handlers for Thought Reframe Relay
 * Handles module state transitions and response management
 */

interface ModuleActionPayload {
  action: string;
  moduleId: string;
  sessionId: string;
}

/**
 * Get current module state from session metadata
 */
async function getModuleState(sessionId: string): Promise<ThoughtReframeRelayState> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { sharingDefaults: true },
  });

  if (!session) return 'LOBBY';

  const defaults = session.sharingDefaults as any;
  return defaults?.moduleState || 'LOBBY';
}

/**
 * Set module state in session metadata
 */
async function setModuleState(
  sessionId: string,
  state: ThoughtReframeRelayState
): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { sharingDefaults: true },
  });

  if (!session) return;

  const defaults = (session.sharingDefaults as any) || {};
  defaults.moduleState = state;

  await prisma.session.update({
    where: { id: sessionId },
    data: { sharingDefaults: defaults },
  });
}

/**
 * Broadcast module state to all clients
 */
function broadcastModuleState(
  io: SocketIOServer,
  sessionId: string,
  state: ThoughtReframeRelayState
): void {
  io.to(`session:${sessionId}`).emit('thoughtReframeRelay:state', { state });
}

/**
 * Broadcast anonymous response count (no identifiers)
 */
async function broadcastAnonymousCount(
  io: SocketIOServer,
  sessionId: string
): Promise<void> {
  const count = await prisma.response.count({
    where: {
      sessionId,
      // Count only non-pass responses (exclude '__PASS__' marker)
      alternativeThought: { not: '__PASS__' },
    },
  });

  io.to(`public:${sessionId}`).emit('thoughtReframeRelay:anonymousCount', { count });
}

/**
 * Handle module action from facilitator
 */
export async function handleModuleAction(
  io: SocketIOServer,
  socket: Socket,
  payload: ModuleActionPayload
): Promise<void> {
  const { action, sessionId } = payload;

  // Verify facilitator permissions (TODO: implement proper auth)
  // For now, assume socket is authenticated

  switch (action) {
    case 'openForResponses':
      await setModuleState(sessionId, 'INPUT');
      broadcastModuleState(io, sessionId, 'INPUT');
      // Start broadcasting anonymous count updates
      setInterval(() => {
        broadcastAnonymousCount(io, sessionId);
      }, 2000);
      break;

    case 'closeInput':
      await setModuleState(sessionId, 'MODERATION');
      broadcastModuleState(io, sessionId, 'MODERATION');
      break;

    case 'revealSelected':
      await setModuleState(sessionId, 'REVEAL');
      broadcastModuleState(io, sessionId, 'REVEAL');
      await broadcastSpotlightedResponses(io, sessionId);
      break;

    case 'continueToDiscussion':
      await setModuleState(sessionId, 'DISCUSSION');
      broadcastModuleState(io, sessionId, 'DISCUSSION');
      break;

    case 'pauseSession':
      // Pause state - show holding screen
      io.to(`public:${sessionId}`).emit('thoughtReframeRelay:paused', {
        message: 'Session paused',
      });
      break;

    case 'redFlagPrompt':
      // Clear current responses and advance
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { currentPromptId: true },
      });

      if (session?.currentPromptId) {
        await prisma.response.deleteMany({
          where: {
            sessionId,
            promptId: session.currentPromptId,
          },
        });
      }

      await setModuleState(sessionId, 'PROMPT_READING');
      broadcastModuleState(io, sessionId, 'PROMPT_READING');
      
      io.to(`public:${sessionId}`).emit('thoughtReframeRelay:message', {
        message: 'Moving to our next exercise...',
      });
      break;

    default:
      throw new Error(`Unknown module action: ${action}`);
  }
}

/**
 * Handle response submission for Thought Reframe Relay
 */
export async function handleThoughtReframeResponse(
  io: SocketIOServer,
  socket: Socket,
  sessionId: string,
  promptId: string,
  reframe: string,
  isPass: boolean,
  participantId: string
): Promise<void> {
  // Get participant info
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!participant) {
    throw new Error('Participant not found');
  }

  // Create response (using alternativeThought field for reframe)
  // Passes are stored with '__PASS__' marker (never shown in UI)
  const response = await prisma.response.create({
    data: {
      sessionId,
      participantId,
      promptId,
      roundNumber: (await prisma.session.findUnique({
        where: { id: sessionId },
        select: { currentRound: true },
      }))?.currentRound || 1,
      alternativeThought: isPass ? '__PASS__' : reframe,
    },
    include: {
      participant: {
        select: {
          id: true,
          nickname: true,
          pseudonymId: true,
        },
      },
    },
  });

  // Broadcast to facilitator (with full metadata)
  io.to(`facilitator:${sessionId}`).emit('thoughtReframeRelay:response', {
    response: {
      id: response.id,
      participantId: response.participantId,
      participantNickname: participant.nickname,
      promptId: response.promptId,
      reframe: isPass ? '' : reframe,
      isPass,
      submittedAt: response.submittedAt,
      isSpotlighted: false,
      isHidden: false,
      isSavedForFollowup: false,
    },
  });

  // Update anonymous count for public view
  await broadcastAnonymousCount(io, sessionId);
}

/**
 * Broadcast spotlighted responses (anonymized) to public room
 */
async function broadcastSpotlightedResponses(
  io: SocketIOServer,
  sessionId: string
): Promise<void> {
  const responses = await prisma.response.findMany({
    where: {
      sessionId,
      isSpotlighted: true,
      isHidden: false,
      // Exclude passes (stored with '__PASS__' marker)
      alternativeThought: { not: '__PASS__' },
    },
    orderBy: { submittedAt: 'asc' },
  });

  const spotlighted = responses.map((r) => ({
    id: r.id,
    reframe: r.alternativeThought,
    // NO participant identifiers
  }));

  io.to(`public:${sessionId}`).emit('thoughtReframeRelay:spotlighted', {
    responses: spotlighted,
  });
}

// Export removed - function is already exported above

