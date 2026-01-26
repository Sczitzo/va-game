'use client';

import { useState } from 'react';
import { getModule } from '@/modules';

interface GameInstructionsProps {
  moduleId: string;
}

export function GameInstructions({ moduleId }: GameInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const gameModule = getModule(moduleId);

  if (!gameModule) return null;

  return (
    <div className="jackbox-card">
      <h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-2 rounded-lg focus-visible-ring"
          aria-expanded={isExpanded}
          aria-controls="game-instructions-content"
          aria-label={isExpanded ? 'Collapse game instructions' : 'Expand game instructions'}
        >
          <span className="text-lg font-bold text-jackbox-purple">📖 Game Instructions</span>
          <span className="text-2xl" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
        </button>
      </h2>
      
      {isExpanded && (
        <div id="game-instructions-content" className="text-gray-700 whitespace-pre-line">
          {gameModule.instructions.split('\n').map((line, i) => {
            // Bold headers (markdown **text**)
            if (line.match(/^\*\*.*\*\*$/)) {
              return (
                <h3 key={i} className="font-bold text-jackbox-purple mt-4 mb-2 text-lg">
                  {line.replace(/\*\*/g, '')}
                </h3>
              );
            }
            // Bullet points
            if (line.trim().startsWith('•')) {
              return (
                <p key={i} className="ml-4 mb-2 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{line.replace(/^•\s*/, '')}</span>
                </p>
              );
            }
            // Numbered lists
            if (line.match(/^\d+\./)) {
              return (
                <p key={i} className="ml-4 mb-2">
                  {line}
                </p>
              );
            }
            // Regular paragraphs (skip empty lines)
            if (line.trim()) {
              return <p key={i} className="mb-2">{line}</p>;
            }
            return <br key={i} />;
          })}
        </div>
      )}
    </div>
  );
}
