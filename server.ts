import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketHandlers } from './src/server/socket-handlers';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Setup socket handlers
  setupSocketHandlers(io);

  // Start purge job (runs hourly)
  if (process.env.NODE_ENV !== 'test') {
    const { startPurgeJob } = require('./src/server/jobs/purge-job');
    startPurgeJob();
  }

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

