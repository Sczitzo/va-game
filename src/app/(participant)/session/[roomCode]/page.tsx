'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { useParticipantStore } from '@/stores/participant-store';
import { PromptDisplay } from '@/components/participant/PromptDisplay';
import { ResponseForm } from '@/components/participant/ResponseForm';
import { SpotlightedResponses } from '@/components/participant/SpotlightedResponses';
import { WaitingRoom } from '@/components/participant/WaitingRoom';
import { MediaPlayer } from '@/components/shared/MediaPlayer';
import { GameInstructions } from '@/components/shared/GameInstructions';
import { FullscreenContainer } from '@/components/shared/FullscreenContainer';
import { QRCodeDisplay } from '@/components/facilitator/QRCodeDisplay';
import type { ServerMessage } from '@/types/websocket';

export default function ParticipantSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = params.roomCode as string;
  const nickname = searchParams.get('nickname') || '';
  const pseudonymId = searchParams.get('pseudonymId') || '';

  const {
    sessionId,
    participantId,
    sessionState,
    currentPrompt,
    spotlightedResponses,
    participants,
    isConnected,
    setSessionId,
    setParticipantId,
    setSessionState,
    setCurrentPrompt,
    setSpotlightedResponses,
    setParticipants,
    setSocket,
    setConnected,
  } = useParticipantStore();

  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [error, setError] = useState('');
  const [moduleId, setModuleId] = useState<string>('');

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setSocket(socket);
      setSocketInstance(socket);

      // Join session
      socket.emit('participant', {
        type: 'join',
        sessionId: '', // Will be set after join
        payload: {
          roomCode: roomCode.toUpperCase(),
          nickname,
          pseudonymId: pseudonymId || undefined,
        },
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socket.on('server', (message: ServerMessage) => {
      switch (message.type) {
        case 'joined':
          setSessionId(message.payload.sessionId);
          setParticipantId(message.payload.participantId);
          // Fetch module ID from session
          if (message.payload.sessionId) {
            fetch(`/api/sessions/${message.payload.sessionId}`)
              .then((res) => res.json())
              .then((data) => setModuleId(data.session?.moduleId || ''));
          }
          break;
        case 'sessionState':
          setSessionState(message.payload);
          break;
        case 'currentPrompt':
          setCurrentPrompt(message.payload);
          break;
        case 'responsesUpdate':
          setSpotlightedResponses(message.payload.spotlightedResponses);
          break;
        case 'participantListUpdate':
          setParticipants(message.payload.participants);
          break;
        case 'error':
          setError(message.payload.message);
          break;
      }
    });

    return () => {
      socket.disconnect();
      setConnected(false);
    };
  }, [roomCode, nickname, pseudonymId]);

  // Wake Lock API to prevent screen sleep
  useEffect(() => {
    if ('wakeLock' in navigator && sessionState?.status === 'IN_PROGRESS') {
      let wakeLock: WakeLockSentinel | null = null;

      const requestWakeLock = async () => {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.log('Wake Lock request failed:', err);
        }
      };

      requestWakeLock();

      return () => {
        if (wakeLock) {
          wakeLock.release();
        }
      };
    }
  }, [sessionState?.status]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 jackbox-gradient-bg">
        <div className="jackbox-card text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-jackbox-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">🔌 Connecting to session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 jackbox-gradient-bg">
        <div className="max-w-md w-full">
      <div className="jackbox-card text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <div className="p-4 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl mb-4 font-semibold" role="alert">
          {error}
        </div>
        <Link href="/join" className="jackbox-button-secondary">
          ← Try Again
        </Link>
      </div>
        </div>
      </div>
    );
  }

  if (!sessionState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 jackbox-gradient-bg">
      <div className="jackbox-card text-center">
        <div className="animate-pulse text-5xl mb-4">🎮</div>
        <p className="text-lg font-semibold text-gray-900">Loading session...</p>
      </div>
      </div>
    );
  }

  const isActive = sessionState?.status === 'IN_PROGRESS' || sessionState?.status === 'INTRO';
  const isLobby = sessionState?.status === 'LOBBY' || sessionState?.status === 'CREATED';

  // Show waiting room when in lobby
  if (isLobby) {
    return (
      <WaitingRoom 
        participants={participants}
        roomCode={roomCode}
        currentParticipantId={participantId}
      />
    );
  }

  return (
    <FullscreenContainer
      headerContent={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-sm font-bold text-jackbox-purple leading-tight">🎮 {roomCode}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="jackbox-badge-purple text-[10px] px-1.5 py-0.5">R{sessionState.currentRound}/{sessionState.numRounds}</span>
                {isConnected && <span className="jackbox-badge-green text-[10px] px-1.5 py-0.5">🟢</span>}
              </div>
            </div>
          </div>
          {isActive && (
            <QRCodeDisplay 
              roomCode={roomCode} 
              sessionStatus={sessionState?.status}
              compact={true}
            />
          )}
        </div>
      }
    >
      <div className="min-h-screen jackbox-gradient-bg p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Game Instructions - visible to all participants */}
          {moduleId && (
            <GameInstructions moduleId={moduleId} />
          )}

        {/* Intro Media */}
        {sessionState.status === 'INTRO' && sessionState.introMedia && (
          <div className="jackbox-card">
            <h2 className="text-xl font-bold mb-4 text-jackbox-purple">📺 Introduction</h2>
            <MediaPlayer media={sessionState.introMedia} />
          </div>
        )}

        {/* Current Prompt */}
        {currentPrompt && (
          <PromptDisplay prompt={currentPrompt} />
        )}

        {/* Response Form */}
        {sessionState.status === 'IN_PROGRESS' && currentPrompt && (
          <ResponseForm
            sessionId={sessionId!}
            promptId={currentPrompt.promptId}
            socket={socketInstance!}
          />
        )}

        {/* Spotlighted Responses */}
        {spotlightedResponses.length > 0 && (
          <SpotlightedResponses responses={spotlightedResponses} />
        )}

        {/* Session Ended */}
        {sessionState.status === 'ENDED' && (
          <div className="jackbox-card text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="jackbox-title jackbox-title-gradient text-2xl mb-2">Session Ended</h2>
            <p className="text-gray-700 text-lg font-medium">Thank you for participating!</p>
          </div>
        )}
        </div>
      </div>
    </FullscreenContainer>
  );
}

