'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { SessionStatus } from '@prisma/client';

interface QRCodeDisplayProps {
  roomCode: string;
  sessionStatus?: SessionStatus;
  compact?: boolean;
}

export function QRCodeDisplay({ roomCode, sessionStatus, compact = false }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join?roomCode=${roomCode}`
    : '';

  const isActive = sessionStatus === 'IN_PROGRESS' || sessionStatus === 'INTRO';
  const displayCompact = compact || isActive;

  useEffect(() => {
    if (joinUrl) {
      const size = displayCompact ? 80 : 200;
      QRCode.toDataURL(joinUrl, {
        width: size,
        margin: 2,
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [joinUrl, displayCompact]);

  if (displayCompact) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-[10px] font-medium text-gray-500">Room</div>
          <div className="text-sm font-mono font-bold text-jackbox-purple leading-tight">{roomCode}</div>
        </div>
        {qrDataUrl && (
          <div>
            <img 
              src={qrDataUrl} 
              alt="QR Code" 
              className="border border-jackbox-purple/50 rounded w-12 h-12"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-2">
        <span className="text-sm font-medium">Room Code:</span>
        <div className="text-2xl font-mono font-bold mt-1">{roomCode}</div>
      </div>
      {qrDataUrl && (
        <div className="mt-4">
          <img src={qrDataUrl} alt="QR Code" className="mx-auto border-2 border-black rounded" />
          <p className="text-xs text-gray-600 mt-2">Scan to join</p>
        </div>
      )}
      <div className="mt-4">
        <input
          type="text"
          readOnly
          value={joinUrl}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
      </div>
    </div>
  );
}


