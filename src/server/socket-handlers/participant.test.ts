import { handleParticipantMessage } from '@/server/socket-handlers/participant';
import { prisma } from '@/lib/prisma';
import { Server, Socket } from 'socket.io';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    participant: {
      create: jest.fn(),
    },
  },
}));

// Mock socket
const mockSocket = {
  id: 'socket-123',
  join: jest.fn(),
  emit: jest.fn(),
} as unknown as Socket;

const mockIo = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
} as unknown as Server;

// Mock broadcast functions
jest.mock('@/server/socket-handlers/broadcast', () => ({
  broadcastSessionState: jest.fn(),
  broadcastParticipantList: jest.fn(),
}));

describe('handleParticipantMessage: join', () => {
  const sessionId = 'session-123';
  const roomCode = 'CODE12';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send joined event with moduleId when joining successfully', async () => {
    const mockSession = {
      id: sessionId,
      roomCode,
      moduleId: 'test_module',
      status: 'LOBBY',
      introMedia: null,
    };

    const mockParticipant = {
      id: 'part-123',
      sessionId,
      nickname: 'Player',
    };

    (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
    (prisma.participant.create as jest.Mock).mockResolvedValue(mockParticipant);

    await handleParticipantMessage(mockIo, mockSocket, {
      type: 'join',
      sessionId: '',
      payload: {
        roomCode,
        nickname: 'Player',
      },
    });

    expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { roomCode },
        include: { introMedia: true }
    });

    expect(mockSocket.join).toHaveBeenCalledWith(`session:${sessionId}`);

    // Verify that the 'joined' message contains moduleId
    expect(mockSocket.emit).toHaveBeenCalledWith('server', {
      type: 'joined',
      sessionId,
      payload: {
        sessionId,
        participantId: mockParticipant.id,
        moduleId: 'test_module',
      },
    });
  });
});
