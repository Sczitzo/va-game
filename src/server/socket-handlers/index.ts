import { Server as SocketIOServer } from 'socket.io';
import { handleFacilitatorMessage } from './facilitator';
import { handleParticipantMessage } from './participant';
import { handleTVMessage } from './tv';
import { prisma } from '@/lib/prisma';

export function setupSocketHandlers(io: SocketIOServer) {
  io.use(async (socket, next) => {
    // Basic connection validation
    // Extract userId from handshake auth
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.data.userId = userId;
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', async () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Update participant's socketId if they disconnect
      await prisma.participant.updateMany({
        where: { socketId: socket.id },
        data: { socketId: null },
      });
    });

    // Facilitator messages
    socket.on('facilitator', async (message: any) => {
      try {
        await handleFacilitatorMessage(io, socket, message);
      } catch (error) {
        console.error('Error handling facilitator message:', error);
        socket.emit('error', {
          code: 'FACILITATOR_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Participant messages
    socket.on('participant', async (message: any) => {
      try {
        await handleParticipantMessage(io, socket, message);
      } catch (error) {
        console.error('Error handling participant message:', error);
        socket.emit('error', {
          code: 'PARTICIPANT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // TV/Projector viewer messages
    socket.on('tv', async (message: any) => {
      try {
        console.log(`[TV] Received TV message:`, message);
        await handleTVMessage(io, socket, message);
      } catch (error) {
        console.error('[TV] Error handling TV message:', error);
        socket.emit('server', {
          type: 'error',
          sessionId: message.roomCode || '',
          payload: {
            code: 'TV_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    });
  });
}

