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

const DELAY_MS = 100;

describe('broadcastCurrentPrompt Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementations with delay
    (prisma.prompt.findUnique as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      return {
        id: 'prompt-123',
        text: 'Test Prompt',
        topicTags: ['test'],
        intensity: 5,
      };
    });

    (prisma.session.findUnique as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      return {
        id: 'session-123',
        currentRound: 1,
      };
    });
  });

  test('benchmark execution time', async () => {
    const iterations = 5;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await broadcastCurrentPrompt(mockIo, 'session-123', 'prompt-123');
    }

    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;

    console.log(`
      Benchmark Results:
      ------------------
      Total Time (${iterations} iterations): ${totalTime.toFixed(2)}ms
      Average Time per call: ${avgTime.toFixed(2)}ms
      Expected Sequential Time (approx): ${2 * DELAY_MS}ms
      Expected Parallel Time (approx): ${DELAY_MS}ms
    `);

    // Simple assertion to make sure it's running
    expect(totalTime).toBeGreaterThan(0);
  });
});
