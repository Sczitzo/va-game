'use client';

import { useEffect, useState } from 'react';

interface Participant {
  id: string;
  nickname: string;
}

interface WaitingRoomProps {
  participants: Participant[];
  roomCode: string;
  currentParticipantId: string | null;
}

/**
 * WaitingRoom - Jackbox-style lobby where participants see all joined players
 * Shows animated participant cards with their nicknames
 */
export function WaitingRoom({ participants, roomCode, currentParticipantId }: WaitingRoomProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setAnimateIn(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 jackbox-gradient-bg">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <h1 className="jackbox-title jackbox-title-gradient text-4xl md:text-5xl mb-3">
            Waiting Room
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="jackbox-badge-purple text-lg px-4 py-2">
              Room Code: <span className="font-mono font-bold">{roomCode}</span>
            </div>
          </div>
          <p className="text-xl text-gray-700 font-medium">
            {participants.length === 1 
              ? 'Waiting for more players to join...' 
              : `${participants.length} players joined`}
          </p>
        </div>

        {/* Participants Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {participants.map((participant, index) => {
            const isCurrentUser = participant.id === currentParticipantId;
            return (
              <div
                key={participant.id}
                className={`
                  jackbox-card text-center p-6 transform transition-all duration-500
                  ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                  ${isCurrentUser ? 'ring-4 ring-jackbox-purple ring-offset-2 scale-105' : ''}
                `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Avatar */}
                <div className="mb-3">
                  <div className={`
                    w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl
                    ${isCurrentUser 
                      ? 'bg-gradient-to-br from-jackbox-purple to-jackbox-blue shadow-lg' 
                      : 'bg-gradient-to-br from-gray-200 to-gray-300'
                    }
                  `}>
                    {participant.nickname.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                {/* Nickname */}
                <div className="font-bold text-lg text-gray-900 break-words">
                  {participant.nickname}
                </div>
                
                {/* Current User Badge */}
                {isCurrentUser && (
                  <div className="mt-2">
                    <span className="jackbox-badge-green text-xs">You</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {participants.length === 0 && (
          <div className="jackbox-card text-center py-12">
            <div className="text-5xl mb-4 animate-pulse">👤</div>
            <p className="text-xl text-gray-600">No participants yet...</p>
          </div>
        )}

        {/* Waiting Message */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-jackbox-purple rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-jackbox-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-jackbox-purple rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-lg font-medium">Waiting for session to start...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

