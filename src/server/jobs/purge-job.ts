import { prisma } from '@/lib/prisma';

const PURGE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Purge expired sessions and their associated data
 */
export async function purgeExpiredSessions(): Promise<void> {
  const now = new Date();

  try {
    // Delete all sessions that should be purged
    // Cascade delete will handle:
    // - Participants
    // - Responses
    // - SessionSummary
    // - AuditLogs (setNull on sessionId)
    const { count: deletedSessionsCount } = await prisma.session.deleteMany({
      where: {
        purgeAfter: {
          lte: now,
        },
        status: {
          not: 'ENDED',
        },
      },
    });

    // Also purge expired session summaries
    const { count: deletedSummariesCount } = await prisma.sessionSummary.deleteMany({
      where: {
        purgeAfter: {
          lte: now,
        },
      },
    });

    if (deletedSessionsCount > 0 || deletedSummariesCount > 0) {
      console.log(
        `Purge job completed: ${deletedSessionsCount} sessions, ${deletedSummariesCount} summaries`
      );
    }
  } catch (error) {
    console.error('Error in purge job:', error);
  }
}

/**
 * Start the purge job (runs hourly)
 */
export function startPurgeJob(): void {
  console.log('Starting purge job (runs hourly)');

  // Run immediately on startup
  purgeExpiredSessions();

  // Then run every hour
  setInterval(() => {
    purgeExpiredSessions();
  }, PURGE_INTERVAL_MS);
}
