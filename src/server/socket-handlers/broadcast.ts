import { Server as SocketIOServer, Socket } from 'socket.io';
import { Session, MediaAsset } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getModule } from '@/modules';
import type {
  ServerMessage,
  SessionStatePayload,
  CurrentPromptPayload,
  ResponsesUpdatePayload,
  ParticipantListUpdatePayload,
} from '@/types/websocket';

type SessionWithMedia = Session & { introMedia: MediaAsset | null };

/**
 * Broadcast session state to all clients in a session
 */
export async function broadcastSessionState(
  io: SocketIOServer,
  sessionId: string,
  preloadedSession?: SessionWithMedia
): Promise<void> {
  const session = preloadedSession || await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      introMedia: true,
    },
  });

  if (!session) return;

  const payload: SessionStatePayload = {
    status: session.status,
    currentRound: session.currentRound,
    numRounds: session.numRounds,
    introCompleted: session.introCompleted,
    currentPromptId: session.currentPromptId || undefined,
    introMedia: session.introMedia
      ? {
          id: session.introMedia.id,
          url: session.introMedia.url,
          type: session.introMedia.type,
        }
      : undefined,
  };

  const message: ServerMessage = {
    type: 'sessionState',
    sessionId,
    payload,
  };

  io.to(`session:${sessionId}`).emit('server', message);
}

/**
 * Broadcast current prompt to all participants
 */
export async function broadcastCurrentPrompt(
  io: SocketIOServer,
  sessionId: string,
  promptId: string
): Promise<void> {
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
  });

  if (!prompt) return;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) return;

  const payload: CurrentPromptPayload = {
    promptId: prompt.id,
    text: prompt.text,
    roundNumber: session.currentRound,
    topicTags: prompt.topicTags,
    intensity: prompt.intensity,
  };

  const message: ServerMessage = {
    type: 'currentPrompt',
    sessionId,
    payload,
  };

  io.to(`session:${sessionId}`).emit('server', message);
}

/**
 * Broadcast spotlighted responses to participants
 */
export async function broadcastSpotlightedResponses(
  io: SocketIOServer,
  sessionId: string
): Promise<void> {
  const responses = await prisma.response.findMany({
    where: {
      sessionId,
      isSpotlighted: true,
      isHidden: false,
    },
    orderBy: { submittedAt: 'desc' },
  });

  const payload: ResponsesUpdatePayload = {
    spotlightedResponses: responses.map((r) => ({
      id: r.id,
      alternativeThought: r.alternativeThought,
      automaticThought: r.automaticThought || undefined,
      emotionPre: r.emotionPre || undefined,
      emotionPost: r.emotionPost || undefined,
    })),
  };

  const message: ServerMessage = {
    type: 'responsesUpdate',
    sessionId,
    payload,
  };

  // Only send to participants, not facilitator (they see all responses)
  io.to(`session:${sessionId}`).emit('server', message);
}

/**
 * Broadcast participant list update
 */
export async function broadcastParticipantList(
  io: SocketIOServer,
  sessionId: string
): Promise<void> {
  const participants = await prisma.participant.findMany({
    where: { sessionId },
    orderBy: { joinedAt: 'asc' },
  });

  const payload: ParticipantListUpdatePayload = {
    participants: participants.map((p) => ({
      id: p.id,
      nickname: p.nickname,
    })),
  };

  const message: ServerMessage = {
    type: 'participantListUpdate',
    sessionId,
    payload,
  };

  io.to(`session:${sessionId}`).emit('server', message);
}
