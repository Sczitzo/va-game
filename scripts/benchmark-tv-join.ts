
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock functions simulating DB/Network latency
async function broadcastSessionState() {
  await delay(50); // Simulate 50ms latency
}

async function broadcastCurrentPrompt() {
  await delay(50); // Simulate 50ms latency
}

async function broadcastSpotlightedResponses() {
  await delay(50); // Simulate 50ms latency
}

async function runSequential() {
  console.log('--- Sequential Execution ---');
  const start = performance.now();

  await broadcastSessionState();

  // Simulate condition being true
  if (true) {
    await broadcastCurrentPrompt();
  }

  await broadcastSpotlightedResponses();

  const end = performance.now();
  console.log(`Time taken: ${(end - start).toFixed(2)}ms`);
  return end - start;
}

async function runParallel() {
  console.log('--- Parallel Execution ---');
  const start = performance.now();

  const promises = [
    broadcastSessionState(),
    broadcastSpotlightedResponses()
  ];

  // Simulate condition being true
  if (true) {
    promises.push(broadcastCurrentPrompt());
  }

  await Promise.all(promises);

  const end = performance.now();
  console.log(`Time taken: ${(end - start).toFixed(2)}ms`);
  return end - start;
}

async function main() {
  console.log('Starting Benchmark Simulation...\n');

  const seqTime = await runSequential();
  console.log('');
  const parTime = await runParallel();

  console.log('\n--- Results ---');
  console.log(`Improvement: ${(seqTime - parTime).toFixed(2)}ms`);
  console.log(`Speedup: ${(seqTime / parTime).toFixed(2)}x`);
}

main();
