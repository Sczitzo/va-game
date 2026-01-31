'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { SubmitResponsePayload } from '@/types/websocket';

interface ResponseFormProps {
  sessionId: string;
  promptId: string;
  socket: Socket;
}

export function ResponseForm({ sessionId, promptId, socket }: ResponseFormProps) {
  const [alternativeThought, setAlternativeThought] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  const [emotionPre, setEmotionPre] = useState<number | undefined>();
  const [emotionPost, setEmotionPost] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Reset skip confirmation when user types
  useEffect(() => {
    setShowSkipConfirm(false);
  }, [alternativeThought, automaticThought, emotionPre, emotionPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alternativeThought.trim()) {
      return;
    }

    setIsSubmitting(true);

    const payload: SubmitResponsePayload = {
      promptId,
      alternativeThought: alternativeThought.trim(),
      automaticThought: automaticThought.trim() || undefined,
      emotionPre,
      emotionPost,
    };

    socket.emit('participant', {
      type: 'submitResponse',
      sessionId,
      payload,
    });

    // Reset form
    setAlternativeThought('');
    setAutomaticThought('');
    setEmotionPre(undefined);
    setEmotionPost(undefined);
    setIsSubmitting(false);
  };

  const handleSkip = () => {
    const hasContent =
      alternativeThought.trim() ||
      automaticThought.trim() ||
      emotionPre !== undefined ||
      emotionPost !== undefined;

    if (hasContent && !showSkipConfirm) {
      setShowSkipConfirm(true);
      return;
    }

    socket.emit('participant', {
      type: 'skip',
      sessionId,
      payload: { promptId },
    });
    setIsSkipped(true);
  };

  if (isSkipped) {
    return (
      <div className="jackbox-card text-center">
        <div className="text-4xl mb-3" aria-hidden="true">⏭️</div>
        <p className="text-gray-700 font-medium">You skipped this prompt.</p>
        <p className="text-sm text-gray-600 mt-1">Waiting for next round...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="jackbox-card space-y-5">
      <h2 className="text-xl font-bold mb-4 text-jackbox-purple">
        <span aria-hidden="true">✍️</span> Your Response
      </h2>

          <div>
            <label htmlFor="alternativeThought" className="block text-sm font-semibold mb-2 text-gray-900">
              Alternative Thought <span className="text-red-500">*</span>
            </label>
            <textarea
              id="alternativeThought"
              value={alternativeThought}
              onChange={(e) => setAlternativeThought(e.target.value)}
              required
              rows={4}
              maxLength={500}
              className="jackbox-input"
              placeholder="What's an alternative, balanced way to think about this?"
              aria-required="true"
              aria-describedby="alternativeThought-counter"
            />
            <div
              id="alternativeThought-counter"
              className={`text-right text-xs mt-1 transition-colors duration-200 ${
                alternativeThought.length > 450 ? 'text-red-600 font-bold' :
                alternativeThought.length > 400 ? 'text-orange-700' : 'text-gray-500'
              }`}
            >
              {alternativeThought.length} / 500 characters
            </div>
          </div>

          <div>
            <label htmlFor="automaticThought" className="block text-sm font-semibold mb-2 text-gray-900">
              Automatic Thought <span className="text-xs text-gray-600">(Optional)</span>
            </label>
            <textarea
              id="automaticThought"
              value={automaticThought}
              onChange={(e) => setAutomaticThought(e.target.value)}
              rows={3}
              maxLength={500}
              className="jackbox-input"
              placeholder="What was your initial automatic thought?"
              aria-describedby="automaticThought-counter"
            />
            <div
              id="automaticThought-counter"
              className={`text-right text-xs mt-1 transition-colors duration-200 ${
                automaticThought.length > 450 ? 'text-red-600 font-bold' :
                automaticThought.length > 400 ? 'text-orange-700' : 'text-gray-500'
              }`}
            >
              {automaticThought.length} / 500 characters
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="emotionPre" className="block text-sm font-semibold mb-2 text-gray-900">
                Emotion Before <span className="text-xs text-gray-600">(0-10)</span>
              </label>
              <input
                id="emotionPre"
                type="number"
                min="0"
                max="10"
                value={emotionPre || ''}
                onChange={(e) => setEmotionPre(e.target.value ? parseInt(e.target.value) : undefined)}
                className="jackbox-input"
              />
            </div>

            <div>
              <label htmlFor="emotionPost" className="block text-sm font-semibold mb-2 text-gray-900">
                Emotion After <span className="text-xs text-gray-600">(0-10)</span>
              </label>
              <input
                id="emotionPost"
                type="number"
                min="0"
                max="10"
                value={emotionPost || ''}
                onChange={(e) => setEmotionPost(e.target.value ? parseInt(e.target.value) : undefined)}
                className="jackbox-input"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !alternativeThought.trim()}
              className="flex-1 jackbox-button-primary focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><span aria-hidden="true">⏳</span> Submitting...</>
              ) : (
                <><span aria-hidden="true">🚀</span> Submit</>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className={
                showSkipConfirm
                  ? 'jackbox-button bg-red-50 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white focus-visible-ring transition-colors duration-200'
                  : 'jackbox-button-secondary focus-visible-ring transition-colors duration-200'
              }
              aria-label={showSkipConfirm ? 'Confirm skip?' : 'Skip this prompt'}
              aria-live="polite"
            >
              <span aria-hidden="true">{showSkipConfirm ? '⚠️' : '⏭️'}</span>
              {showSkipConfirm ? ' Confirm Skip?' : ' Skip'}
            </button>
          </div>
    </form>
  );
}

