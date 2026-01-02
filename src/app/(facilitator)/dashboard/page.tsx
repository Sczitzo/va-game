'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

interface Session {
  id: string;
  roomCode: string;
  status: string;
  moduleId: string;
  createdAt: string;
  promptPack: {
    name: string;
  };
  careTeam: {
    name: string;
  };
  _count: {
    participants: number;
    responses: number;
  };
}

export default function FacilitatorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'FACILITATOR') {
      router.push('/login');
      return;
    }

    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/sessions?facilitatorId=${user?.id}`);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center jackbox-gradient-bg">
        <div className="jackbox-card text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-jackbox-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen jackbox-gradient-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="jackbox-title jackbox-title-gradient text-4xl drop-shadow-lg">🎯 Facilitator Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/sessions/create"
              className="jackbox-button-primary focus-visible-ring"
            >
              ✨ Create Session
            </Link>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                router.push('/');
              }}
              className="jackbox-button-secondary focus-visible-ring"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="jackbox-card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-jackbox-purple/10 to-jackbox-blue/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-jackbox-purple uppercase tracking-wider">
                  Room Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-jackbox-purple uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-jackbox-purple uppercase tracking-wider">
                  Care Team
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-jackbox-purple uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-jackbox-purple uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-jackbox-purple uppercase tracking-wider">
                  Responses
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-jackbox-purple uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="text-gray-400 text-lg mb-2">🎮</div>
                    <p className="text-gray-700 font-medium">No sessions yet.</p>
                    <p className="text-sm text-gray-600 mt-1">Create your first session to get started!</p>
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-jackbox-purple/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-lg text-jackbox-purple">{session.roomCode}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="jackbox-badge-purple">{session.moduleId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {session.careTeam.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`jackbox-badge ${
                        session.status === 'ENDED' ? 'bg-gray-200 text-gray-700' :
                        session.status === 'IN_PROGRESS' ? 'bg-jackbox-green/20 text-jackbox-green' :
                        'bg-jackbox-yellow/20 text-jackbox-orange'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-gray-900">
                      👥 {session._count.participants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-gray-900">
                      💬 {session._count.responses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/sessions/${session.id}`}
                        className="jackbox-button-secondary text-sm px-4 py-2 focus-visible-ring"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

