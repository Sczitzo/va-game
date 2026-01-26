import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';
import { getModule } from '@/modules';
import {
  ParticipantMessage,
  JoinPayload,
  SubmitResponsePayload,
  SkipPayload,
} from '@/types/websocket';
import {
  broadcastSessionState,
  broadcastParticipantList,
  broadcastSpotlightedResponses,
} from './broadcast';
import { handleThoughtReframeResponse } from './modules/thought-reframe-relay';
import { SessionStatus } from '@prisma/client';

export async function handleParticipantMessage(
  io: SocketIOServer,
  socket: Socket,
  message: ParticipantMessage
): Promise<void> {
  switch (message.type) {
    case 'join':
      await handleJoin(io, socket, message.payload as JoinPayload);
      break;
    case 'submitResponse':
      await handleSubmitResponse(io, socket, message.sessionId, message.payload as SubmitResponsePayload);
      break;
    case 'skip':
      await handleSkip(io, socket, message.sessionId, message.payload as SkipPayload);
      break;
    default:
      throw new Error(`Unknown participant message type: ${(message as any).type}`);
  }
}

async function handleJoin(
  io: SocketIOServer,
  socket: Socket,
  payload: JoinPayload
): Promise<void> {
  // Find session by room code
  const session = await prisma.session.findUnique({
    where: { roomCode: payload.roomCode },
    include: {
      introMedia: true,
    },
  });

  if (!session) {
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

  if (session.status === 'ENDED') {
    socket.emit('server', {
      type: 'error',
      sessionId: session.id,
      payload: {
        code: 'SESSION_ENDED',
        message: 'This session has ended.',
      },
    });
    return;
  }

  // Create participant
  const participant = await prisma.participant.create({
    data: {
      sessionId: session.id,
      nickname: payload.nickname,
      pseudonymId: payload.pseudonymId,
      socketId: socket.id,
    },
  });

  // Join participant to session room
  socket.join(`session:${session.id}`);
  socket.join(`participant:${participant.id}`);

  let currentSession = session;

  // Update session status to LOBBY if it was CREATED
  if (session.status === 'CREATED') {
    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'LOBBY' },
    });
    // Update local object to reflect change
    currentSession = { ...session, status: 'LOBBY' as SessionStatus };
  }

  // Broadcast updates
  await broadcastSessionState(io, session.id, currentSession);
  await broadcastParticipantList(io, session.id);

  // Send join confirmation
  socket.emit('server', {
    type: 'joined',
    sessionId: session.id,
    payload: {
      sessionId: session.id,
      participantId: participant.id,
    },
  });
}

async function handleSubmitResponse(
  io: SocketIOServer,
  socket: Socket,
  sessionId: string,
  payload: SubmitResponsePayload
): Promise<void> {
  // Find participant by socket ID
  const participant = await prisma.participant.findFirst({
    where: { socketId: socket.id, sessionId },
  });

  if (!participant) {
    socket.emit('server', {
      type: 'error',
      sessionId,
      payload: {
        code: 'PARTICIPANT_NOT_FOUND',
        message: 'Participant not found. Please rejoin the session.',
      },
    });
    return;
  }

  // Get session
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    socket.emit('server', {
      type: 'error',
      sessionId,
      payload: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found.',
      },
    });
    return;
  }

  // Get module
  const module = getModule(session.moduleId);
  if (!module) throw new Error(`Module ${session.moduleId} not found`);

  // Handle Thought Reframe Relay module differently
  if (session.moduleId === 'thought_reframe_relay') {
    // Check module state (must be INPUT)
    const defaults = (session.sharingDefaults as any) || {};
    const moduleState = defaults.moduleState || 'LOBBY';
    
    if (moduleState !== 'INPUT') {
      socket.emit('server', {
        type: 'error',
        sessionId,
        payload: {
          code: 'INPUT_NOT_OPEN',
          message: 'Input is not currently open for responses.',
        },
      });
      return;
    }

    // Validate payload
    try {
      module.participantInputSchema.parse({
        reframe: payload.reframe,
        isPass: payload.isPass || false,
      });
    } catch (error) {
      socket.emit('server', {
        type: 'error',
        sessionId,
        payload: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response format.',
        },
      });
      return;
    }

    // Handle Thought Reframe Relay response
    await handleThoughtReframeResponse(
      io,
      socket,
      sessionId,
      payload.promptId,
      payload.reframe || '',
      payload.isPass || false,
      participant.id
    );
  } else {
    // Handle other modules (CBT Reframe Relay, etc.)
    if (session.status !== 'IN_PROGRESS') {
      socket.emit('server', {
        type: 'error',
        sessionId,
        payload: {
          code: 'SESSION_NOT_ACTIVE',
          message: 'Session is not currently accepting responses.',
        },
      });
      return;
    }

    // Validate response against module schema
    try {
      module.participantInputSchema.parse(payload);
    } catch (error) {
      socket.emit('server', {
        type: 'error',
        sessionId,
        payload: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response format.',
        },
      });
      return;
    }

    // Create response
    await prisma.response.create({
      data: {
        sessionId,
        participantId: participant.id,
        promptId: payload.promptId,
        roundNumber: session.currentRound,
        alternativeThought: payload.alternativeThought || '',
        automaticThought: payload.automaticThought,
        emotionPre: payload.emotionPre,
        emotionPost: payload.emotionPost,
      },
    });
  }

  // Update participant last seen
  await prisma.participant.update({
    where: { id: participant.id },
    data: { lastSeenAt: new Date() },
  });

  // Broadcast spotlighted responses (in case facilitator spotlights this one)
  await broadcastSpotlightedResponses(io, sessionId);
}

async function handleSkip(
  io: SocketIOServer,
  socket: Socket,
  sessionId: string,
  payload: SkipPayload
): Promise<void> {
  // Find participant by socket ID
  const participant = await prisma.participant.findFirst({
    where: { socketId: socket.id, sessionId },
  });

  if (!participant) {
    socket.emit('server', {
      type: 'error',
      sessionId,
      payload: {
        code: 'PARTICIPANT_NOT_FOUND',
        message: 'Participant not found. Please rejoin the session.',
      },
    });
    return;
  }

  // Update participant last seen (skip is neutral, no response created)
  await prisma.participant.update({
    where: { id: participant.id },
    data: { lastSeenAt: new Date() },
  });

  // No error, skip is always allowed
}

