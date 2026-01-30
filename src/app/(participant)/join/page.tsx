'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [pseudonymId, setPseudonymId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate room code format
    if (!/^[A-Z2-9]{6}$/.test(roomCode.toUpperCase())) {
      setError('Room code must be 6 characters (letters and numbers)');
      setIsLoading(false);
      return;
    }

    // Redirect to session page (will handle join via WebSocket)
    router.push(`/session/${roomCode.toUpperCase()}?nickname=${encodeURIComponent(nickname)}&pseudonymId=${encodeURIComponent(pseudonymId)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 jackbox-gradient-bg">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="jackbox-title jackbox-title-gradient text-4xl mb-2 drop-shadow-lg">🎮 Join Session</h1>
          <p className="jackbox-subtitle jackbox-subtitle-light drop-shadow-lg">
            Enter your room code to join a group session
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 jackbox-card">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-300 text-red-700 rounded-xl" role="alert">
              <span className="font-semibold">⚠️</span> {error}
            </div>
          )}

          <div>
            <label htmlFor="roomCode" className="block text-sm font-semibold mb-2 text-gray-900">
              Room Code <span className="text-red-500">*</span>
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              pattern="[A-Z2-9]{6}"
              className="w-full px-4 py-4 text-3xl text-center tracking-widest font-bold border-2 border-jackbox-purple rounded-xl focus-visible-ring uppercase bg-gray-800 text-white placeholder-gray-400"
              placeholder="ABC123"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-semibold mb-2 text-gray-900">
              Nickname <span className="text-red-500">*</span>
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              maxLength={20}
              className="jackbox-input"
              placeholder="Choose a nickname"
              aria-required="true"
            />
            <p className="mt-2 text-sm text-gray-600">
              👥 This will be visible to other participants
            </p>
          </div>

          <div>
            <label htmlFor="pseudonymId" className="block text-sm font-semibold mb-2 text-gray-900">
              Participant ID <span className="text-xs text-gray-600">(Optional)</span>
            </label>
            <input
              id="pseudonymId"
              type="text"
              value={pseudonymId}
              onChange={(e) => setPseudonymId(e.target.value)}
              className="jackbox-input"
              placeholder="If provided by facilitator"
            />
            <p className="mt-2 text-sm text-gray-600">
              🔒 Optional pseudonymous ID provided by your facilitator
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="jackbox-button-primary w-full focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Joining...</span>
              </>
            ) : (
              '🚀 Join Session'
            )}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-sm font-semibold text-white hover:text-white/80 transition-colors drop-shadow-lg">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

