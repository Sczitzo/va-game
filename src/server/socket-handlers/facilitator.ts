import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';
import { generateRoomCode } from '@/lib/room-code';
import { getModule } from '@/modules';
import {
  FacilitatorMessage,
  CreateSessionPayload,
  StartSessionPayload,
  NextPromptPayload,
  SpotlightResponsePayload,
  HideResponsePayload,
  SaveForFollowupPayload,
  EndSessionPayload,
} from '@/types/websocket';
import {
  broadcastSessionState,
  broadcastCurrentPrompt,
  broadcastSpotlightedResponses,
  broadcastParticipantList,
} from './broadcast';
import { handleModuleAction } from './modules/thought-reframe-relay';

const SESSION_RETENTION_HOURS = parseInt(process.env.SESSION_RETENTION_HOURS || '72', 10);

export async function handleFacilitatorMessage(
  io: SocketIOServer,
  socket: Socket,
  message: FacilitatorMessage
): Promise<void> {
  switch (message.type) {
    case 'join':
      await handleFacilitatorJoin(io, socket, message.sessionId!);
      break;
    case 'createSession':
      await handleCreateSession(io, socket, message.payload as CreateSessionPayload);
      break;
    case 'startSession':
      await handleStartSession(io, socket, message.payload as StartSessionPayload);
      break;
    case 'nextPrompt':
      await handleNextPrompt(io, socket, message.payload as NextPromptPayload);
      break;
    case 'spotlightResponse':
      await handleSpotlightResponse(io, socket, message.payload as SpotlightResponsePayload);
      break;
    case 'hideResponse':
      await handleHideResponse(io, socket, message.payload as HideResponsePayload);
      break;
    case 'saveForFollowup':
      await handleSaveForFollowup(io, socket, message.payload as SaveForFollowupPayload);
      break;
    case 'endSession':
      await handleEndSession(io, socket, message.payload as EndSessionPayload);
      break;
    case 'markIntroCompleted':
      await handleMarkIntroCompleted(io, socket, message.sessionId!);
      break;
    case 'moduleAction':
      await handleModuleAction(io, socket, message.payload as any);
      break;
    default:
      throw new Error(`Unknown facilitator message type: ${(message as any).type}`);
  }
}

async function handleFacilitatorJoin(
  io: SocketIOServer,
  socket: Socket,
  sessionId: string
): Promise<void> {
  // Join facilitator to session room
  socket.join(`session:${sessionId}`);
  socket.join(`facilitator:${sessionId}`);

  // Broadcast current session state
  await broadcastSessionState(io, sessionId);
  await broadcastParticipantList(io, sessionId);
}

async function handleCreateSession(
  io: SocketIOServer,
  socket: Socket,
  payload: CreateSessionPayload
): Promise<void> {
  // TODO: Validate facilitator permissions
  // For now, assume socket has userId in handshake.auth or similar

  const userId = socket.data.userId;
  if (!userId) {
    throw new Error('Unauthorized: No user ID found');
  }
  
  const roomCode = generateRoomCode();
  const purgeAfter = new Date();
  purgeAfter.setHours(purgeAfter.getHours() + SESSION_RETENTION_HOURS);

  const session = await prisma.session.create({
    data: {
      careTeamId: payload.careTeamId,
      facilitatorId: userId,
      moduleId: payload.moduleId,
      promptPackId: payload.promptPackId,
      roomCode,
      numRounds: payload.numRounds,
      sharingDefaults: payload.sharingDefaults,
      introMediaId: payload.introMediaId,
      purgeAfter,
    },
    include: {
      introMedia: true,
    },
  });

  // Join facilitator to session room
  socket.join(`session:${session.id}`);
  socket.join(`facilitator:${session.id}`);

  // Broadcast session state
  await broadcastSessionState(io, session.id);

  // Send session created confirmation
  socket.emit('server', {
    type: 'sessionCreated',
    sessionId: session.id,
    payload: {
      sessionId: session.id,
      roomCode: session.roomCode,
    },
  });
}

async function handleStartSession(
  io: SocketIOServer,
  socket: Socket,
  payload: StartSessionPayload
): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });

  if (!session) throw new Error('Session not found');

  // Handle Thought Reframe Relay module state
  if (session.moduleId === 'thought_reframe_relay') {
    const defaults = (session.sharingDefaults as any) || {};
    defaults.moduleState = 'LOBBY';
    
    await prisma.session.update({
      where: { id: payload.sessionId },
      data: {
        status: 'LOBBY',
        startedAt: new Date(),
        sharingDefaults: defaults,
      },
    });

    // Broadcast module state
    io.to(`session:${payload.sessionId}`).emit('thoughtReframeRelay:state', {
      state: 'LOBBY',
    });
  } else {
    // Standard flow
    await prisma.session.update({
      where: { id: payload.sessionId },
      data: {
        status: 'LOBBY',
        startedAt: new Date(),
      },
    });
  }

  await broadcastSessionState(io, payload.sessionId);
}

async function handleNextPrompt(
  io: SocketIOServer,
  socket: Socket,
  payload: NextPromptPayload
): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });

  if (!session) throw new Error('Session not found');

  const updatedSession = await prisma.session.update({
    where: { id: payload.sessionId },
    data: {
      status: 'IN_PROGRESS',
      currentRound: session.currentRound + 1,
      currentPromptId: payload.promptId,
    },
  });

  await broadcastSessionState(io, updatedSession.id);
  await broadcastCurrentPrompt(io, updatedSession.id, payload.promptId);
}

async function handleSpotlightResponse(
  io: SocketIOServer,
  socket: Socket,
  payload: SpotlightResponsePayload
): Promise<void> {
  await prisma.response.update({
    where: { id: payload.responseId },
    data: { isSpotlighted: true },
  });

  await broadcastSpotlightedResponses(io, payload.sessionId);
}

async function handleHideResponse(
  io: SocketIOServer,
  socket: Socket,
  payload: HideResponsePayload
): Promise<void> {
  await prisma.response.update({
    where: { id: payload.responseId },
    data: { isHidden: true, isSpotlighted: false },
  });

  await broadcastSpotlightedResponses(io, payload.sessionId);
}

async function handleSaveForFollowup(
  io: SocketIOServer,
  socket: Socket,
  payload: SaveForFollowupPayload
): Promise<void> {
  await prisma.response.update({
    where: { id: payload.responseId },
    data: { isSavedForFollowup: true },
  });
}

async function handleEndSession(
  io: SocketIOServer,
  socket: Socket,
  payload: EndSessionPayload
): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      responses: {
        include: {
          participant: true,
        },
      },
      participants: true,
    },
  });

  if (!session) throw new Error('Session not found');

  // Generate session summary
  const module = getModule(session.moduleId);
  if (!module) throw new Error(`Module ${session.moduleId} not found`);

  const summaryData = await module.generateSummary(
    session,
    session.responses,
    session.participants
  );

  const purgeAfter = new Date();
  purgeAfter.setHours(purgeAfter.getHours() + SESSION_RETENTION_HOURS);

  await prisma.sessionSummary.create({
    data: {
      sessionId: session.id,
      moduleId: summaryData.moduleId,
      numRounds: summaryData.numRounds,
      attendanceNote: summaryData.attendanceNote,
      savedResponses: summaryData.savedResponses,
      purgeAfter,
    },
  });

  // Update session status
  await prisma.session.update({
    where: { id: payload.sessionId },
    data: {
      status: 'ENDED',
      endedAt: new Date(),
    },
  });

  await broadcastSessionState(io, payload.sessionId);
}

async function handleMarkIntroCompleted(
  io: SocketIOServer,
  socket: Socket,
  sessionId: string
): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) throw new Error('Session not found');

  // Handle Thought Reframe Relay module state
  if (session.moduleId === 'thought_reframe_relay') {
    const defaults = (session.sharingDefaults as any) || {};
    defaults.moduleState = 'PROMPT_READING';
    
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'INTRO',
        introCompleted: true,
        sharingDefaults: defaults,
      },
    });

    // Broadcast module state
    io.to(`session:${sessionId}`).emit('thoughtReframeRelay:state', {
      state: 'PROMPT_READING',
    });
  } else {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'INTRO',
        introCompleted: true,
      },
    });
  }

  await broadcastSessionState(io, sessionId);
}

