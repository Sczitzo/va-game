
import { prisma } from '@/lib/prisma';
import { purgeExpiredSessions } from '@/server/jobs/purge-job';

async function main() {
  console.log('🚀 Starting Benchmark: Purge Job');

  // 1. Setup Prerequisites
  console.log('📦 Setting up prerequisites...');

  // Create a dummy user
  const user = await prisma.user.create({
    data: {
      email: `benchmark-${Date.now()}@example.com`,
      passwordHash: 'dummy',
      role: 'FACILITATOR',
    },
  });

  // Create a dummy care team
  const careTeam = await prisma.careTeam.create({
    data: {
      name: 'Benchmark Team',
    },
  });

  await prisma.careTeamMember.create({
    data: {
      careTeamId: careTeam.id,
      userId: user.id,
      role: 'LEAD',
    },
  });

  // Create a dummy prompt pack
  const promptPack = await prisma.promptPack.create({
    data: {
      name: 'Benchmark Pack',
      topicTags: ['benchmark'],
    },
  });

  const prompt = await prisma.prompt.create({
    data: {
      promptPackId: promptPack.id,
      text: 'Benchmark Prompt',
      topicTags: ['benchmark'],
    },
  });

  // 2. Seed Data
  const EXPIRED_COUNT = 100;
  const ACTIVE_COUNT = 20;
  const PARTICIPANTS_PER_SESSION = 5;
  const RESPONSES_PER_PARTICIPANT = 2;

  console.log(`🌱 Seeding ${EXPIRED_COUNT} expired sessions and ${ACTIVE_COUNT} active sessions...`);
  console.log(`   (Each session: ${PARTICIPANTS_PER_SESSION} participants, ${RESPONSES_PER_PARTICIPANT} responses each)`);

  const now = new Date();
  const past = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day in future

  // Helper to create session
  const createSession = async (isExpired: boolean, index: number) => {
    const purgeTime = isExpired ? past : future;
    const uniqueSuffix = `${Date.now().toString().slice(-5)}${index}`;

    const session = await prisma.session.create({
      data: {
        careTeamId: careTeam.id,
        facilitatorId: user.id,
        moduleId: 'benchmark_module',
        promptPackId: promptPack.id,
        roomCode: `B${isExpired ? 'E' : 'A'}${uniqueSuffix}`, // Ensure unique
        status: 'IN_PROGRESS',
        sharingDefaults: {}, // Json object
        purgeAfter: purgeTime,
        createdAt: new Date(purgeTime.getTime() - 72 * 60 * 60 * 1000),
      },
    });

    // Create participants and responses
    for (let i = 0; i < PARTICIPANTS_PER_SESSION; i++) {
      const participant = await prisma.participant.create({
        data: {
          sessionId: session.id,
          nickname: `User ${i}`,
        },
      });

      for (let j = 0; j < RESPONSES_PER_PARTICIPANT; j++) {
        await prisma.response.create({
          data: {
            sessionId: session.id,
            participantId: participant.id,
            promptId: prompt.id,
            roundNumber: 1,
            alternativeThought: 'Benchmark thought',
          },
        });
      }
    }

    // Create a summary for some sessions
    if (index % 2 === 0) {
      await prisma.sessionSummary.create({
        data: {
          sessionId: session.id,
          moduleId: 'benchmark_module',
          numRounds: 3,
          attendanceNote: 'Benchmark',
          savedResponses: [], // Json array
          purgeAfter: purgeTime,
        },
      });
    }
  };

  // Run creation in parallel chunks to speed up setup
  const batchSize = 10;

  console.log('   Creating expired sessions...');
  for (let i = 0; i < EXPIRED_COUNT; i += batchSize) {
    await Promise.all(
      Array.from({ length: Math.min(batchSize, EXPIRED_COUNT - i) }, (_, j) =>
        createSession(true, i + j)
      )
    );
  }

  console.log('   Creating active sessions...');
  for (let i = 0; i < ACTIVE_COUNT; i += batchSize) {
     await Promise.all(
      Array.from({ length: Math.min(batchSize, ACTIVE_COUNT - i) }, (_, j) =>
        createSession(false, i + j)
      )
    );
  }

  // Count before
  const countBefore = await prisma.session.count();
  console.log(`📊 Total sessions in DB: ${countBefore}`);

  // 3. Run Benchmark
  console.log('⏱️  Running purge job...');
  const start = performance.now();

  await purgeExpiredSessions();

  const end = performance.now();
  const duration = end - start;

  // 4. Verify
  console.log('🔍 Verifying results...');
  const countAfter = await prisma.session.count();
  const deletedCount = countBefore - countAfter;

  const remainingExpired = await prisma.session.count({
    where: {
      purgeAfter: { lte: now },
      status: { not: 'ENDED' }
    }
  });

  console.log(`✅ Time taken: ${duration.toFixed(2)}ms`);
  console.log(`   Deleted sessions: ${deletedCount} (Expected: ~${EXPIRED_COUNT})`);
  console.log(`   Remaining expired sessions: ${remainingExpired} (Expected: 0)`);

  // Cleanup
  console.log('🧹 Cleanup...');
  // Clean up remaining sessions (active ones)
  await prisma.session.deleteMany({ where: { facilitatorId: user.id } });

  // Clean up user and other dependencies
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.careTeam.delete({ where: { id: careTeam.id } });
  await prisma.promptPack.delete({ where: { id: promptPack.id } });

  console.log('✨ Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
