import { prisma } from '@/lib/prisma';

const PURGE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Purge expired sessions and their associated data
 */
export async function purgeExpiredSessions(): Promise<void> {
  const now = new Date();

  try {
    // Find all sessions that should be purged
    const expiredSessions = await prisma.session.findMany({
      where: {
        purgeAfter: {
          lte: now,
        },
        status: {
          not: 'ENDED',
        },
      },
      select: {
        id: true,
      },
    });

    for (const session of expiredSessions) {
      // Cascade delete will handle:
      // - Participants
      // - Responses
      // - SessionSummary
      // - AuditLogs (setNull on sessionId)

      await prisma.session.update({
        where: { id: session.id },
        data: {
          status: 'ENDED',
          endedAt: now,
        },
      });

      // Delete session (cascade will handle related records)
      await prisma.session.delete({
        where: { id: session.id },
      });

      console.log(`Purged expired session: ${session.id}`);
    }

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

    if (expiredSessions.length > 0 || expiredSummaries.length > 0) {
      console.log(
        `Purge job completed: ${expiredSessions.length} sessions, ${expiredSummaries.length} summaries`
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

