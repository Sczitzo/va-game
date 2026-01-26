import { broadcastCurrentPrompt } from '@/server/socket-handlers/broadcast';
import { prisma } from '@/lib/prisma';
import { Server } from 'socket.io';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    prompt: {
      findUnique: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock Socket.IO
const mockIo = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
} as unknown as Server;

describe('broadcastCurrentPrompt', () => {
  const sessionId = 'session-123';
  const promptId = 'prompt-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should broadcast current prompt when both prompt and session exist', async () => {
    const mockPrompt = {
      id: promptId,
      text: 'Test Prompt',
      topicTags: ['tag1', 'tag2'],
      intensity: 3,
    };

    const mockSession = {
      id: sessionId,
      currentRound: 2,
    };

    (prisma.prompt.findUnique as jest.Mock).mockResolvedValue(mockPrompt);
    (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);

    await broadcastCurrentPrompt(mockIo, sessionId, promptId);

    expect(prisma.prompt.findUnique).toHaveBeenCalledWith({ where: { id: promptId } });
    expect(prisma.session.findUnique).toHaveBeenCalledWith({ where: { id: sessionId } });

    expect(mockIo.to).toHaveBeenCalledWith(`session:${sessionId}`);
    expect(mockIo.emit).toHaveBeenCalledWith('server', {
      type: 'currentPrompt',
      sessionId,
      payload: {
        promptId: mockPrompt.id,
        text: mockPrompt.text,
        roundNumber: mockSession.currentRound,
        topicTags: mockPrompt.topicTags,
        intensity: mockPrompt.intensity,
      },
    });
  });

  it('should not broadcast if prompt is missing', async () => {
    (prisma.prompt.findUnique as jest.Mock).mockResolvedValue(null);

    await broadcastCurrentPrompt(mockIo, sessionId, promptId);

    expect(prisma.prompt.findUnique).toHaveBeenCalled();
    // In the current sequential implementation, session is not fetched if prompt is missing
    expect(mockIo.emit).not.toHaveBeenCalled();
  });

  it('should not broadcast if session is missing', async () => {
    (prisma.prompt.findUnique as jest.Mock).mockResolvedValue({ id: promptId });
    (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);

    await broadcastCurrentPrompt(mockIo, sessionId, promptId);

    expect(prisma.prompt.findUnique).toHaveBeenCalled();
    expect(prisma.session.findUnique).toHaveBeenCalled();
    expect(mockIo.emit).not.toHaveBeenCalled();
  });
});
