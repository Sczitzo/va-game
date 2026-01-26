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
    const expiredSummaries = await prisma.sessionSummary.findMany({
      where: {
        purgeAfter: {
          lte: now,
        },
      },
      select: {
        id: true,
      },
    });

    if (expiredSummaries.length > 0) {
      const summaryIds = expiredSummaries.map((s) => s.id);

      await prisma.sessionSummary.deleteMany({
        where: {
          id: {
            in: summaryIds,
          },
        },
      });

      for (const summary of expiredSummaries) {
        console.log(`Purged expired session summary: ${summary.id}`);
      }
    }

    if (deletedSessionsCount > 0 || expiredSummaries.length > 0) {
      console.log(
        `Purge job completed: ${deletedSessionsCount} sessions, ${expiredSummaries.length} summaries`
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
