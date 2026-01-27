import { prisma } from '../src/lib/prisma';
import { SessionStatus } from '@prisma/client';

async function main() {
  console.log('⚡ Benchmarking Session Fetch Latency...');

  // 1. Setup Data
  const timestamp = Date.now();
  const userEmail = `bench-${timestamp}@example.com`;

  const user = await prisma.user.create({
    data: {
      email: userEmail,
      passwordHash: 'dummy',
      role: 'FACILITATOR',
    },
  });

  const careTeam = await prisma.careTeam.create({
    data: {
      name: `Bench Team ${timestamp}`,
    },
  });

  // Reuse a prompt pack from seed or create one
  let promptPack = await prisma.promptPack.findFirst();
  if (!promptPack) {
    promptPack = await prisma.promptPack.create({
      data: {
        name: 'Bench Pack',
        topicTags: [],
      },
    });
  }

  // Create Session
  const roomCode = `B${timestamp.toString().slice(-5)}`; // unlikely collision
  const session = await prisma.session.create({
    data: {
      careTeamId: careTeam.id,
      facilitatorId: user.id,
      moduleId: 'cbt_reframe_relay',
      promptPackId: promptPack.id,
      roomCode: roomCode,
      status: 'LOBBY',
      numRounds: 3,
      sharingDefaults: {},
      purgeAfter: new Date(Date.now() + 3600000),
    },
  });

  console.log(`✅ Created test session: ${session.id} (Code: ${session.roomCode})`);

  // 2. Benchmark
  const iterations = 5;
  let totalTime = 0;
  const url = `http://localhost:3000/api/sessions/${session.id}`;

  console.log(`Starting ${iterations} fetches from ${url}...`);
  console.log('(Ensure the server is running on port 3000)');

  // Warmup
  try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
  } catch (e) {
      console.error("Failed to fetch. Is server running?", e);
      await cleanup(session.id, careTeam.id, user.id);
      process.exit(1);
  }

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const res = await fetch(url);
    if (!res.ok) {
        console.error(`Fetch failed: ${res.status}`);
    }
    await res.json();
    const end = performance.now();
    const duration = end - start;
    totalTime += duration;
    console.log(`  Run ${i + 1}: ${duration.toFixed(2)}ms`);
  }

  const avgTime = totalTime / iterations;
  console.log(`\n📊 Average Fetch Latency: ${avgTime.toFixed(2)}ms`);
  console.log(`   This is the estimated savings per participant join.`);

  // 3. Cleanup
  await cleanup(session.id, careTeam.id, user.id);
}

async function cleanup(sessionId: string, careTeamId: string, userId: string) {
    console.log('🧹 Cleaning up...');
    try {
        await prisma.session.delete({ where: { id: sessionId } });
        await prisma.careTeam.delete({ where: { id: careTeamId } });
        await prisma.user.delete({ where: { id: userId } });
    } catch (e) {
        console.error('Error during cleanup:', e);
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
