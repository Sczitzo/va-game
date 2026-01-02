/**
 * TV/Projector Server - Separate server for testing projector view
 * Runs on port 3001, serves HTML that connects to main Socket.io server on port 3000
 */

import express from 'express';
import { createServer } from 'http';
import path from 'path';

const app = express();
const httpServer = createServer(app);

const PORT = 3001;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

// Serve static files from public directory if needed
app.use(express.static(path.join(__dirname, 'public')));

// TV/Projector view HTML
app.get('/', (req, res) => {
  const roomCode = req.query.roomCode as string;
  
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TV/Projector View - Thought Reframe Relay</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <style>
    /* Base styles - Tailwind-like utilities for TV server */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; min-height: 100vh; padding: 1.5rem; }
    .container { max-width: 80rem; margin: 0 auto; }
    .text-center { text-align: center; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-8 { margin-top: 2rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .p-8 { padding: 2rem; }
    .p-10 { padding: 2.5rem; }
    .p-12 { padding: 3rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .text-4xl { font-size: 2.25rem; }
    .text-5xl { font-size: 3rem; }
    .text-6xl { font-size: 3.75rem; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-700 { color: #374151; }
    .text-gray-800 { color: #1f2937; }
    .text-gray-900 { color: #111827; }
    .text-purple-600 { color: #9333ea; }
    .text-white { color: #ffffff; }
    .max-w-4xl { max-width: 56rem; }
    .max-w-6xl { max-width: 72rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .bg-white { background-color: #ffffff; }
    .bg-blue-500 { background-color: #3b82f6; }
    .bg-purple-600 { background-color: #9333ea; }
    .hover\\:bg-blue-600:hover { background-color: #2563eb; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-3xl { border-radius: 1.5rem; }
    .rounded-full { border-radius: 9999px; }
    .border-2 { border-width: 2px; }
    .border-gray-300 { border-color: #d1d5db; }
    .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
    .uppercase { text-transform: uppercase; }
    .tracking-wide { letter-spacing: 0.025em; }
    .leading-tight { line-height: 1.25; }
    .leading-relaxed { line-height: 1.625; }
    .flex { display: flex; }
    .inline-block { display: inline-block; }
    .grid { display: grid; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .gap-3 { gap: 0.75rem; }
    .gap-6 { gap: 1.5rem; }
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-full { width: 100%; }
    .min-h-screen { min-height: 100vh; }
    .min-h-\\[60vh\\] { min-height: 60vh; }
    input { width: 100%; max-width: 300px; }
    button { cursor: pointer; transition: all 0.2s; }
    button:hover { opacity: 0.9; transform: translateY(-1px); }
    button:active { transform: translateY(0); }
    @media (min-width: 768px) {
      .md\\:text-4xl { font-size: 2.25rem; }
      .md\\:text-5xl { font-size: 3rem; }
      .md\\:text-6xl { font-size: 3.75rem; }
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (min-width: 1024px) {
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .flex-wrap { flex-wrap: wrap; }
    .ml-2 { margin-left: 0.5rem; }
    .inline-flex { display: inline-flex; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in {
      opacity: 0;
      animation: fadeIn 0.5s ease-in forwards;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  </style>
</head>
<body style="background: #f3f4f6; min-height: 100vh; padding: 1.5rem;">
  <div id="app" class="container">
    <div class="text-center mb-6">
      <h1 style="font-size: 1.875rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">📺 TV/Projector View</h1>
      <div style="margin-bottom: 1rem;">
        <input 
          type="text" 
          id="roomCodeInput" 
          placeholder="Enter Room Code" 
          value="${roomCode || ''}"
          style="padding: 0.5rem 1rem; border: 2px solid #d1d5db; border-radius: 0.5rem; font-size: 1.125rem; max-width: 300px;"
        />
        <button 
          onclick="connectToSession()" 
          style="margin-left: 0.5rem; padding: 0.5rem 1.5rem; background: #3b82f6; color: white; border-radius: 0.5rem; border: none; font-size: 1rem; font-weight: 600;"
        >
          Connect
        </button>
      </div>
      <div id="status" style="font-size: 0.875rem; color: #4b5563;"></div>
    </div>
    <div id="content"></div>
  </div>

  <script>
    let socket = null;
    let currentState = 'LOBBY';
    let currentPrompt = null;
    let spotlightedResponses = [];
    let anonymousCount = 0;

    function connectToSession() {
      const roomCode = document.getElementById('roomCodeInput').value.trim();
      if (!roomCode) {
        alert('Please enter a room code');
        return;
      }

      // Disconnect existing socket
      if (socket) {
        socket.disconnect();
      }

      // Connect to main server as TV viewer
      socket = io('${SOCKET_URL}', {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        document.getElementById('status').textContent = 'Connected. Joining session...';
        
        // Wait a moment for all listeners to be set up, then join
        setTimeout(() => {
          console.log('Emitting TV join for room code:', roomCode);
          socket.emit('tv', {
            type: 'join',
            roomCode: roomCode.toUpperCase(),
          });
        }, 100);
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        document.getElementById('status').textContent = \`❌ Connection error: \${error.message}\`;
      });

      socket.on('disconnect', () => {
        document.getElementById('status').textContent = 'Disconnected';
      });

      socket.on('server', (message) => {
        console.log('Received server message:', message);
        if (message.type === 'joined') {
          document.getElementById('status').textContent = \`✅ Connected to session: \${message.payload.sessionId}\`;
        } else if (message.type === 'error') {
          document.getElementById('status').textContent = \`❌ Error: \${message.payload.message}\`;
          alert(message.payload.message);
        } else {
          console.log('Unhandled server message type:', message.type);
        }
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        document.getElementById('status').textContent = \`❌ Socket error: \${error.message || 'Unknown error'}\`;
      });

      // Listen for module-specific events
      socket.on('thoughtReframeRelay:state', (data) => {
        currentState = data.state;
        render();
      });

      socket.on('thoughtReframeRelay:prompt', (data) => {
        currentPrompt = data.prompt;
        render();
      });

      socket.on('thoughtReframeRelay:spotlighted', (data) => {
        spotlightedResponses = data.responses;
        render();
      });

      socket.on('thoughtReframeRelay:anonymousCount', (data) => {
        anonymousCount = data.count;
        render();
      });

      socket.on('thoughtReframeRelay:paused', (data) => {
        document.getElementById('content').innerHTML = \`
          <div class="flex items-center justify-center min-h-[60vh]">
            <div class="text-center">
              <div class="text-6xl mb-6">⏸️</div>
              <h2 class="text-4xl font-bold text-gray-800 mb-4">Session Paused</h2>
              <p class="text-xl text-gray-600">\${data.message || 'Please wait...'}</p>
            </div>
          </div>
        \`;
      });

      socket.on('thoughtReframeRelay:message', (data) => {
        document.getElementById('content').innerHTML = \`
          <div class="flex items-center justify-center min-h-[60vh]">
            <div class="text-center">
              <p class="text-2xl text-gray-700">\${data.message}</p>
            </div>
          </div>
        \`;
      });
    }

    function render() {
      const content = document.getElementById('content');
      
      switch (currentState) {
        case 'LOBBY':
          content.innerHTML = \`
            <div style="display: flex; align-items: center; justify-content: center; min-height: 60vh;">
              <div style="text-align: center;">
                <div style="font-size: 3.75rem; margin-bottom: 1.5rem;">🎮</div>
                <h2 style="font-size: 2.25rem; font-weight: 700; color: #1f2937; margin-bottom: 1rem;">Waiting for session to begin...</h2>
                <p style="font-size: 1.25rem; color: #4b5563;">Join with your room code to participate</p>
              </div>
            </div>
          \`;
          break;

        case 'INTRO':
          content.innerHTML = \`
            <div class="flex items-center justify-center min-h-[60vh]">
              <div class="text-center">
                <div class="text-6xl mb-6">📺</div>
                <h2 class="text-4xl font-bold text-gray-800 mb-4">Introduction</h2>
                <p class="text-xl text-gray-600">Please watch the introduction video</p>
              </div>
            </div>
          \`;
          break;

        case 'PROMPT_READING':
          if (currentPrompt) {
            content.innerHTML = \`
              <div class="flex items-center justify-center min-h-[60vh]">
                <div class="max-w-4xl mx-auto text-center">
                  <div class="bg-white rounded-3xl shadow-2xl p-12 mb-8">
                    <div class="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wide">
                      Stuck Thought
                    </div>
                    <h1 class="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                      \${currentPrompt.text}
                    </h1>
                    <p class="text-xl text-gray-600 mt-8">Read and reflect...</p>
                  </div>
                </div>
              </div>
            \`;
          }
          break;

        case 'INPUT':
          if (currentPrompt) {
            const dots = Array.from({ length: Math.min(anonymousCount, 20) })
              .map((_, i) => \`<div class="w-4 h-4 bg-purple-600 rounded-full animate-pulse" style="animation-delay: \${i * 0.1}s"></div>\`)
              .join('');
            const moreText = anonymousCount > 20 ? \`<span class="text-lg text-gray-600 ml-2">+\${anonymousCount - 20}</span>\` : '';
            
            content.innerHTML = \`
              <div class="flex items-center justify-center min-h-[60vh]">
                <div class="max-w-4xl mx-auto text-center">
                  <div class="bg-white rounded-3xl shadow-2xl p-10 mb-8">
                    <div class="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wide">
                      Stuck Thought
                    </div>
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      \${currentPrompt.text}
                    </h2>
                  </div>
                  <div class="bg-white rounded-2xl shadow-xl p-8">
                    <p class="text-2xl text-gray-700 mb-4">Responses coming in...</p>
                    <div class="flex justify-center items-center gap-3 flex-wrap">
                      \${dots}
                      \${moreText}
                    </div>
                    <p class="text-sm text-gray-500 mt-4">Share your balanced thought on your device</p>
                  </div>
                </div>
              </div>
            \`;
          }
          break;

        case 'MODERATION':
          content.innerHTML = \`
            <div class="flex items-center justify-center min-h-[60vh]">
              <div class="text-center">
                <div class="text-5xl mb-6">⏳</div>
                <h2 class="text-4xl font-bold text-gray-800 mb-4">Preparing for discussion...</h2>
                <p class="text-xl text-gray-600">Please wait while responses are reviewed</p>
              </div>
            </div>
          \`;
          break;

        case 'REVEAL':
          if (currentPrompt) {
            const cards = spotlightedResponses.length > 0
              ? spotlightedResponses.map((response, index) => \`
                <div class="bg-white rounded-2xl shadow-xl p-10 animate-fade-in" style="animation-delay: \${index * 0.2}s">
                  <div class="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wide">
                    Balanced Thought
                  </div>
                  <p class="text-3xl font-medium text-gray-900 leading-relaxed">
                    \${response.reframe}
                  </p>
                </div>
              \`).join('')
              : '<div class="text-center py-12"><p class="text-2xl text-gray-600">No responses to display</p></div>';
            
            content.innerHTML = \`
              <div class="min-h-[60vh] py-8">
                <div class="max-w-6xl mx-auto">
                  <div class="mb-8 text-center">
                    <div class="bg-white rounded-3xl shadow-2xl p-8 inline-block">
                      <div class="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
                        Stuck Thought
                      </div>
                      <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
                        \${currentPrompt.text}
                      </h2>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    \${cards}
                  </div>
                </div>
              </div>
            \`;
          }
          break;

        case 'DISCUSSION':
          if (currentPrompt) {
            const cards = spotlightedResponses.length > 0
              ? spotlightedResponses.map((response) => \`
                <div class="bg-white rounded-2xl shadow-xl p-10">
                  <div class="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wide">
                    Balanced Thought
                  </div>
                  <p class="text-3xl font-medium text-gray-900 leading-relaxed">
                    \${response.reframe}
                  </p>
                </div>
              \`).join('')
              : '';
            
            content.innerHTML = \`
              <div class="min-h-[60vh] py-8">
                <div class="max-w-6xl mx-auto">
                  <div class="mb-8 text-center">
                    <div class="bg-white rounded-3xl shadow-2xl p-8 inline-block">
                      <div class="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
                        Stuck Thought
                      </div>
                      <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
                        \${currentPrompt.text}
                      </h2>
                    </div>
                  </div>
                  \${cards ? \`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">\${cards}</div>\` : ''}
                  <div class="text-center mt-8">
                    <p class="text-2xl text-gray-700 font-medium">Discussion in progress...</p>
                  </div>
                </div>
              </div>
            \`;
          }
          break;

        case 'END':
          content.innerHTML = \`
            <div class="flex items-center justify-center min-h-[60vh]">
              <div class="text-center">
                <div class="text-6xl mb-6">🎉</div>
                <h2 class="text-4xl font-bold text-gray-800 mb-4">Session Complete</h2>
                <p class="text-xl text-gray-600">Thank you for participating!</p>
              </div>
            </div>
          \`;
          break;

        default:
          content.innerHTML = \`
            <div class="text-center py-12">
              <p class="text-xl text-gray-600">Waiting for session...</p>
            </div>
          \`;
      }
    }

    // Auto-connect if room code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    if (roomCode) {
      document.getElementById('roomCodeInput').value = roomCode;
      setTimeout(() => connectToSession(), 500);
    }

    // Initial render
    render();
  </script>
</body>
</html>
  `);
});

httpServer.listen(PORT, () => {
  console.log(`📺 TV/Projector server running on http://localhost:${PORT}`);
  console.log(`   Connect with: http://localhost:${PORT}?roomCode=YOUR_CODE`);
});
