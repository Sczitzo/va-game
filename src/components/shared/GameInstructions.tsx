'use client';

import { useState } from 'react';
import { getModule } from '@/modules';

interface GameInstructionsProps {
  moduleId: string;
}

export function GameInstructions({ moduleId }: GameInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const module = getModule(moduleId);

  if (!module) return null;

  return (
    <div className="jackbox-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-2"
        aria-expanded={isExpanded}
      >
        <h2 className="text-lg font-bold text-jackbox-purple">📖 Game Instructions</h2>
        <span className="text-2xl">{isExpanded ? '−' : '+'}</span>
      </button>
      
      {isExpanded && (
        <div className="text-gray-700 whitespace-pre-line">
          {module.instructions.split('\n').map((line, i) => {
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

