'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useFacilitatorStore } from '@/stores/facilitator-store';
import { SessionConsole } from '@/components/facilitator/SessionConsole';
import { ParticipantList } from '@/components/facilitator/ParticipantList';
import { ResponseModeration } from '@/components/facilitator/ResponseModeration';
import { PromptControl } from '@/components/facilitator/PromptControl';
import { QRCodeDisplay } from '@/components/facilitator/QRCodeDisplay';
import { GameInstructions } from '@/components/shared/GameInstructions';
import { FullscreenContainer } from '@/components/shared/FullscreenContainer';
import { getModule } from '@/modules';
import type { ServerMessage } from '@/types/websocket';

export default function FacilitatorSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const {
    sessionState,
    currentPrompt,
    participants,
    allResponses,
    isConnected,
    setSessionId,
    setSessionState,
    setCurrentPrompt,
    setParticipants,
    addResponse,
    updateResponse,
    setSocket,
    setConnected,
  } = useFacilitatorStore();

  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    setSessionId(sessionId);

    // Fetch session data
    fetch(`/api/sessions/${sessionId}`)
      .then((res) => res.json())
      .then((data) => setSessionData(data.session));

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

      // Join facilitator room
      socket.emit('facilitator', {
        type: 'join',
        sessionId,
        payload: {},
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socket.on('server', (message: ServerMessage) => {
      switch (message.type) {
        case 'sessionState':
          setSessionState(message.payload);
          break;
        case 'currentPrompt':
          setCurrentPrompt(message.payload);
          break;
        case 'participantListUpdate':
          setParticipants(message.payload.participants);
          break;
        case 'responsesUpdate':
          // Facilitator gets all responses via separate endpoint
          break;
      }
    });

    // Poll for responses
    const pollInterval = setInterval(() => {
      if (sessionId) {
        fetch(`/api/sessions/${sessionId}/responses`)
          .then((res) => res.json())
          .then((data) => {
            // Update responses in store
            data.responses.forEach((response: any) => {
              // Check if response already exists
              const existing = allResponses.find((r) => r.id === response.id);
              if (!existing) {
                addResponse({
                  id: response.id,
                  participantId: response.participantId,
                  participantNickname: response.participant.nickname,
                  promptId: response.promptId,
                  alternativeThought: response.alternativeThought,
                  automaticThought: response.automaticThought,
                  emotionPre: response.emotionPre,
                  emotionPost: response.emotionPost,
                  submittedAt: new Date(response.submittedAt),
                  isSpotlighted: response.isSpotlighted,
                  isHidden: response.isHidden,
                  isSavedForFollowup: response.isSavedForFollowup,
                });
              }
            });
          });
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
      setConnected(false);
    };
  }, [sessionId]);

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center jackbox-gradient-bg">
        <div className="jackbox-card text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-jackbox-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-900">Loading session...</p>
        </div>
      </div>
    );
  }

  const gameModule = getModule(sessionData.moduleId);
  const isActive = sessionState?.status === 'IN_PROGRESS' || sessionState?.status === 'INTRO';

  return (
    <FullscreenContainer
      headerContent={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm font-bold text-jackbox-purple leading-tight">Session: {sessionData.roomCode}</h1>
              <p className="text-[10px] text-gray-500 leading-tight">
                {sessionData.promptPack.name} • {sessionData.careTeam.name}
              </p>
            </div>
          </div>
          <QRCodeDisplay 
            roomCode={sessionData.roomCode} 
            sessionStatus={sessionState?.status}
            compact={isActive}
          />
        </div>
      }
    >
      <div className={`min-h-screen ${isActive ? 'jackbox-gradient-bg' : 'bg-gray-50'} p-6`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Game Instructions - visible to all */}
          {gameModule && (
            <GameInstructions moduleId={sessionData.moduleId} />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Controls */}
            <div className="lg:col-span-1 space-y-6">
              <SessionConsole
                sessionId={sessionId}
                sessionState={sessionState}
                socket={socketInstance!}
              />
              
              <PromptControl
                sessionId={sessionId}
                promptPackId={sessionData.promptPackId}
                socket={socketInstance!}
              />
            </div>

            {/* Right Column: Participants and Responses */}
            <div className="lg:col-span-2 space-y-6">
              <ParticipantList participants={participants} />
              
              <ResponseModeration
                sessionId={sessionId}
                responses={allResponses}
                socket={socketInstance!}
              />
            </div>
          </div>
        </div>
      </div>
    </FullscreenContainer>
  );
}

