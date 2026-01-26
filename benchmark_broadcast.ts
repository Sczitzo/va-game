
import { performance } from 'perf_hooks';

// Mock dependencies to simulate DB/Network latency
const SIMULATED_LATENCY_MS = 50;

async function broadcastSessionState() {
  await new Promise(resolve => setTimeout(resolve, SIMULATED_LATENCY_MS));
}

async function broadcastParticipantList() {
  await new Promise(resolve => setTimeout(resolve, SIMULATED_LATENCY_MS));
}

// Current Implementation
async function sequentialBroadcast() {
  await broadcastSessionState();
  await broadcastParticipantList();
}

// Optimized Implementation
async function parallelBroadcast() {
  await Promise.all([
    broadcastSessionState(),
    broadcastParticipantList()
  ]);
}

async function runBenchmark() {
  console.log('Running Broadcast Benchmark...');
  console.log(`Simulated Latency per call: ${SIMULATED_LATENCY_MS}ms`);

  const iterations = 10;

  // Warmup
  await sequentialBroadcast();
  await parallelBroadcast();

  // Test Sequential
  let totalSeq = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await sequentialBroadcast();
    totalSeq += (performance.now() - start);
  }
  const avgSeq = totalSeq / iterations;

  // Test Parallel
  let totalPar = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await parallelBroadcast();
    totalPar += (performance.now() - start);
  }
  const avgPar = totalPar / iterations;

  console.log('\nResults:');
  console.log(`Sequential Average: ${avgSeq.toFixed(2)}ms`);
  console.log(`Parallel Average:   ${avgPar.toFixed(2)}ms`);
  console.log(`Improvement:        ${((avgSeq - avgPar) / avgSeq * 100).toFixed(2)}%`);
  console.log(`Speedup Factor:     ${(avgSeq / avgPar).toFixed(2)}x`);
}

runBenchmark();
