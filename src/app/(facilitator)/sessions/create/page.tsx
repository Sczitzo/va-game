'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { getAllModules } from '@/modules';

interface CareTeam {
  id: string;
  name: string;
}

interface PromptPack {
  id: string;
  name: string;
}

interface MediaAsset {
  id: string;
  name: string;
  type: string;
}

export default function CreateSessionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [careTeams, setCareTeams] = useState<CareTeam[]>([]);
  const [promptPacks, setPromptPacks] = useState<PromptPack[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  
  const [careTeamId, setCareTeamId] = useState('');
  const [moduleId, setModuleId] = useState('cbt_reframe_relay');
  const [promptPackId, setPromptPackId] = useState('');
  const [numRounds, setNumRounds] = useState(3);
  const [introMediaId, setIntroMediaId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const modules = getAllModules();

  useEffect(() => {
    // Fetch care teams, prompt packs, and media assets
    Promise.all([
      fetch('/api/care-teams').then((res) => res.json()),
      fetch('/api/prompt-packs').then((res) => res.json()),
      fetch('/api/media-assets').then((res) => res.json()),
    ])
      .then(([careTeamsData, promptPacksData, mediaData]) => {
        const teams = careTeamsData.careTeams || [];
        setCareTeams(teams);
        setPromptPacks(promptPacksData.promptPacks || []);
        setMediaAssets(mediaData.mediaAssets || []);
        
        // If no care teams exist, create a default one
        if (teams.length === 0) {
          createDefaultCareTeam();
        }
      })
      .catch((err) => {
        console.error('Failed to fetch data:', err);
        setError('Failed to load form data');
      });
  }, []);

  const createDefaultCareTeam = async () => {
    try {
      const response = await fetch('/api/care-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Default Care Team',
          description: 'Default care team for new facilitators',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCareTeams([data.careTeam]);
        setCareTeamId(data.careTeam.id);
      }
    } catch (err) {
      console.error('Failed to create default care team:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!user?.id) {
      setError('Please log in to create a session');
      return;
    }
    
    if (!careTeamId || !promptPackId || !introMediaId) {
      const missing = [];
      if (!careTeamId) missing.push('Care Team');
      if (!promptPackId) missing.push('Prompt Pack');
      if (!introMediaId) missing.push('Intro Media');
      setError(`Please select: ${missing.join(', ')}`);
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careTeamId,
          moduleId,
          promptPackId,
          numRounds,
          sharingDefaults: {},
          introMediaId,
          facilitatorId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create session');
        return;
      }

      router.push(`/sessions/${data.session.id}`);
    } catch (err) {
      console.error('Session creation error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user || user.role !== 'FACILITATOR') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'FACILITATOR') {
    return null;
  }

  return (
    <div className="min-h-screen jackbox-gradient-bg p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="jackbox-title jackbox-title-gradient text-4xl mb-6 drop-shadow-lg">✨ Create Session</h1>

        <form onSubmit={handleSubmit} className="jackbox-card space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl font-semibold" role="alert">
              ⚠️ {error}
            </div>
          )}
          
          {/* Debug info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-xs">
              <strong>Debug:</strong> User ID: {user?.id || 'Not set'} | Care Team: {careTeamId || 'Not selected'} | Prompt Pack: {promptPackId || 'Not selected'} | Intro Media: {introMediaId || 'Not selected'}
            </div>
          )}

          <div>
            <label htmlFor="careTeamId" className="block text-sm font-semibold mb-2 text-gray-900">
              Care Team <span className="text-red-500">*</span>
            </label>
            <select
              id="careTeamId"
              value={careTeamId}
              onChange={(e) => setCareTeamId(e.target.value)}
              required
              className="jackbox-input"
            >
              <option value="">Select a care team</option>
              {careTeams.length === 0 ? (
                <option value="default" disabled>No care teams available - creating default...</option>
              ) : (
                careTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="moduleId" className="block text-sm font-medium mb-1">
              Module <span className="text-red-600">*</span>
            </label>
            <select
              id="moduleId"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              required
              className="jackbox-input"
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="promptPackId" className="block text-sm font-semibold mb-2 text-gray-900">
              Prompt Pack <span className="text-red-500">*</span>
            </label>
            <select
              id="promptPackId"
              value={promptPackId}
              onChange={(e) => setPromptPackId(e.target.value)}
              required
              className="jackbox-input"
            >
              <option value="">Select a prompt pack</option>
              {promptPacks.length === 0 ? (
                <option value="default" disabled>No prompt packs available - please create one first</option>
              ) : (
                promptPacks.map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {pack.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="numRounds" className="block text-sm font-semibold mb-2 text-gray-900">
              Number of Rounds <span className="text-red-500">*</span>
            </label>
            <input
              id="numRounds"
              type="number"
              min="1"
              max="10"
              value={numRounds}
              onChange={(e) => setNumRounds(parseInt(e.target.value))}
              required
              className="jackbox-input"
            />
          </div>

          <div>
            <label htmlFor="introMediaId" className="block text-sm font-semibold mb-2 text-gray-900">
              Intro Media <span className="text-red-500">*</span>
            </label>
            <select
              id="introMediaId"
              value={introMediaId}
              onChange={(e) => setIntroMediaId(e.target.value)}
              required
              className="jackbox-input"
            >
              <option value="">Select intro media</option>
              {mediaAssets.length === 0 ? (
                <option value="default" disabled>No media assets available - please upload one first</option>
              ) : (
                mediaAssets.map((media) => (
                  <option key={media.id} value={media.id}>
                    {media.name} ({media.type})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 jackbox-button-primary focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Creating...' : '🚀 Create Session'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="jackbox-button-secondary focus-visible-ring"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

