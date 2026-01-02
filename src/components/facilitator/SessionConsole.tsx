'use client';

import { Socket } from 'socket.io-client';
import type { SessionStatePayload } from '@/types/websocket';

interface SessionConsoleProps {
  sessionId: string;
  sessionState: SessionStatePayload | null;
  socket: Socket;
}

export function SessionConsole({ sessionId, sessionState, socket }: SessionConsoleProps) {
  const handleStartSession = () => {
    socket.emit('facilitator', {
      type: 'startSession',
      payload: { sessionId },
    });
  };

  const handleMarkIntroCompleted = () => {
    socket.emit('facilitator', {
      type: 'markIntroCompleted',
      sessionId,
    });
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end this session? This will generate the session summary.')) {
      socket.emit('facilitator', {
        type: 'endSession',
        payload: { sessionId },
      });
    }
  };

  if (!sessionState) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p>Loading session state...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">Session Controls</h2>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium">Status:</span>
          <span className={`ml-2 px-2 py-1 text-xs rounded ${
            sessionState.status === 'ENDED' ? 'bg-gray-200' :
            sessionState.status === 'IN_PROGRESS' ? 'bg-green-100' :
            sessionState.status === 'INTRO' ? 'bg-blue-100' :
            'bg-yellow-100'
          }`}>
            {sessionState.status}
          </span>
        </div>
        
        <div>
          <span className="text-sm font-medium">Round:</span>
          <span className="ml-2">{sessionState.currentRound} / {sessionState.numRounds}</span>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        {sessionState.status === 'CREATED' || sessionState.status === 'LOBBY' ? (
          <button
            onClick={handleStartSession}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus-visible-ring"
          >
            Start Session
          </button>
        ) : null}

        {sessionState.status === 'INTRO' && !sessionState.introCompleted ? (
          <button
            onClick={handleMarkIntroCompleted}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible-ring"
          >
            Mark Intro Completed
          </button>
        ) : null}

        {sessionState.status !== 'ENDED' && (
          <button
            onClick={handleEndSession}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus-visible-ring"
          >
            End Session
          </button>
        )}
      </div>
    </div>
  );
}

