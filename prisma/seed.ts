import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Prompt Packs
  const anxietyPack = await prisma.promptPack.upsert({
    where: { id: 'anxiety-pack-1' },
    update: {},
    create: {
      id: 'anxiety-pack-1',
      name: 'Anxiety & Worry',
      description: 'Prompts focused on managing anxiety and worry thoughts',
      topicTags: ['anxiety', 'worry', 'stress'],
    },
  });

  const depressionPack = await prisma.promptPack.upsert({
    where: { id: 'depression-pack-1' },
    update: {},
    create: {
      id: 'depression-pack-1',
      name: 'Depression & Low Mood',
      description: 'Prompts for challenging negative thoughts related to depression',
      topicTags: ['depression', 'low-mood', 'hopelessness'],
    },
  });

  const relationshipsPack = await prisma.promptPack.upsert({
    where: { id: 'relationships-pack-1' },
    update: {},
    create: {
      id: 'relationships-pack-1',
      name: 'Relationships & Social',
      description: 'Prompts for reframing thoughts about relationships and social situations',
      topicTags: ['relationships', 'social', 'communication'],
    },
  });

  const generalPack = await prisma.promptPack.upsert({
    where: { id: 'general-pack-1' },
    update: {},
    create: {
      id: 'general-pack-1',
      name: 'General Practice',
      description: 'A variety of prompts for general CBT practice',
      topicTags: ['general', 'practice', 'cbt'],
    },
  });

  console.log('✅ Created prompt packs');

  // Create Prompts for Anxiety Pack
  const anxietyPrompts = [
    {
      text: 'I\'m going to mess this up and everyone will think I\'m incompetent.',
      topicTags: ['anxiety', 'perfectionism', 'self-doubt'],
      intensity: 4,
      facilitatorNotes: 'Common anxiety thought pattern. Focus on evidence-based alternatives.',
      order: 1,
    },
    {
      text: 'Something terrible is going to happen if I don\'t check everything multiple times.',
      topicTags: ['anxiety', 'worry', 'control'],
      intensity: 5,
      facilitatorNotes: 'Addresses worry and need for control. Help identify balanced perspective.',
      order: 2,
    },
    {
      text: 'Everyone is judging me right now and they can see how anxious I am.',
      topicTags: ['anxiety', 'social-anxiety', 'mind-reading'],
      intensity: 3,
      facilitatorNotes: 'Mind-reading cognitive distortion. Explore alternative explanations.',
      order: 3,
    },
    {
      text: 'I can\'t handle this situation. I\'m going to have a panic attack.',
      topicTags: ['anxiety', 'panic', 'coping'],
      intensity: 4,
      facilitatorNotes: 'Catastrophic thinking. Focus on past successes and coping strategies.',
      order: 4,
    },
    {
      text: 'If I make a mistake, it will ruin everything.',
      topicTags: ['anxiety', 'perfectionism', 'catastrophizing'],
      intensity: 3,
      facilitatorNotes: 'All-or-nothing thinking. Explore realistic outcomes.',
      order: 5,
    },
  ];

  for (const prompt of anxietyPrompts) {
    await prisma.prompt.upsert({
      where: {
        id: `anxiety-prompt-${prompt.order}`,
      },
      update: {},
      create: {
        id: `anxiety-prompt-${prompt.order}`,
        promptPackId: anxietyPack.id,
        ...prompt,
      },
    });
  }

  // Create Prompts for Depression Pack
  const depressionPrompts = [
    {
      text: 'Nothing ever works out for me. I\'m just unlucky.',
      topicTags: ['depression', 'hopelessness', 'overgeneralization'],
      intensity: 4,
      facilitatorNotes: 'Overgeneralization. Help identify specific examples and exceptions.',
      order: 1,
    },
    {
      text: 'I\'m a failure and I\'ll never be good enough.',
      topicTags: ['depression', 'self-esteem', 'labeling'],
      intensity: 5,
      facilitatorNotes: 'Labeling cognitive distortion. Focus on specific behaviors vs. identity.',
      order: 2,
    },
    {
      text: 'There\'s no point in trying because I\'ll just fail anyway.',
      topicTags: ['depression', 'hopelessness', 'motivation'],
      intensity: 4,
      facilitatorNotes: 'Hopelessness pattern. Explore evidence of past successes.',
      order: 3,
    },
    {
      text: 'Everyone else has it easier than me. Life is unfair.',
      topicTags: ['depression', 'comparison', 'unfairness'],
      intensity: 3,
      facilitatorNotes: 'Comparison and unfairness thinking. Focus on individual journey.',
      order: 4,
    },
    {
      text: 'I don\'t deserve to be happy or successful.',
      topicTags: ['depression', 'self-worth', 'deservingness'],
      intensity: 5,
      facilitatorNotes: 'Core belief about self-worth. Gently challenge with compassion.',
      order: 5,
    },
  ];

  for (const prompt of depressionPrompts) {
    await prisma.prompt.upsert({
      where: {
        id: `depression-prompt-${prompt.order}`,
      },
      update: {},
      create: {
        id: `depression-prompt-${prompt.order}`,
        promptPackId: depressionPack.id,
        ...prompt,
      },
    });
  }

  // Create Prompts for Relationships Pack
  const relationshipPrompts = [
    {
      text: 'They didn\'t text me back immediately, so they must be angry with me.',
      topicTags: ['relationships', 'mind-reading', 'assumptions'],
      intensity: 2,
      facilitatorNotes: 'Mind-reading. Explore alternative explanations for behavior.',
      order: 1,
    },
    {
      text: 'If I express my needs, they\'ll think I\'m too needy and leave.',
      topicTags: ['relationships', 'communication', 'fear-of-rejection'],
      intensity: 3,
      facilitatorNotes: 'Fear of rejection. Normalize healthy communication.',
      order: 2,
    },
    {
      text: 'They always interrupt me because they don\'t value what I have to say.',
      topicTags: ['relationships', 'communication', 'mind-reading'],
      intensity: 3,
      facilitatorNotes: 'Mind-reading and overgeneralization. Explore other possibilities.',
      order: 3,
    },
    {
      text: 'I\'m not good at social situations. People probably find me boring.',
      topicTags: ['relationships', 'social-anxiety', 'self-esteem'],
      intensity: 3,
      facilitatorNotes: 'Self-labeling. Focus on specific situations and evidence.',
      order: 4,
    },
    {
      text: 'If I make a mistake in this conversation, they\'ll never want to talk to me again.',
      topicTags: ['relationships', 'perfectionism', 'catastrophizing'],
      intensity: 2,
      facilitatorNotes: 'Catastrophic thinking. Explore realistic outcomes.',
      order: 5,
    },
  ];

  for (const prompt of relationshipPrompts) {
    await prisma.prompt.upsert({
      where: {
        id: `relationship-prompt-${prompt.order}`,
      },
      update: {},
      create: {
        id: `relationship-prompt-${prompt.order}`,
        promptPackId: relationshipsPack.id,
        ...prompt,
      },
    });
  }

  // Create Prompts for General Pack
  const generalPrompts = [
    {
      text: 'I should be able to handle this on my own without asking for help.',
      topicTags: ['general', 'should-statements', 'independence'],
      intensity: 2,
      facilitatorNotes: 'Should statement. Normalize asking for help.',
      order: 1,
    },
    {
      text: 'If I can\'t do it perfectly, there\'s no point in doing it at all.',
      topicTags: ['general', 'perfectionism', 'all-or-nothing'],
      intensity: 3,
      facilitatorNotes: 'All-or-nothing thinking. Explore value of partial efforts.',
      order: 2,
    },
    {
      text: 'I always make the wrong decisions. I can\'t trust my judgment.',
      topicTags: ['general', 'self-trust', 'overgeneralization'],
      intensity: 3,
      facilitatorNotes: 'Overgeneralization. Identify examples of good decisions.',
      order: 3,
    },
    {
      text: 'Things are either completely good or completely bad. There\'s no in-between.',
      topicTags: ['general', 'all-or-nothing', 'black-and-white'],
      intensity: 2,
      facilitatorNotes: 'Black-and-white thinking. Explore shades of gray.',
      order: 4,
    },
    {
      text: 'I need to be in control of everything or things will fall apart.',
      topicTags: ['general', 'control', 'anxiety'],
      intensity: 4,
      facilitatorNotes: 'Control beliefs. Explore what is and isn\'t within control.',
      order: 5,
    },
  ];

  for (const prompt of generalPrompts) {
    await prisma.prompt.upsert({
      where: {
        id: `general-prompt-${prompt.order}`,
      },
      update: {},
      create: {
        id: `general-prompt-${prompt.order}`,
        promptPackId: generalPack.id,
        ...prompt,
      },
    });
  }

  console.log('✅ Created prompts');

  // Create Media Assets (using placeholder URLs - in production these would be actual uploaded files)
  const introMedia = [
    {
      id: 'intro-media-1',
      name: 'CBT Introduction Video',
      description: 'Introduction to Cognitive Behavioral Therapy concepts',
      type: 'VIDEO' as const,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Sample video
      mimeType: 'video/mp4',
    },
    {
      id: 'intro-media-2',
      name: 'Thought Reframing Overview',
      description: 'Overview of thought reframing techniques',
      type: 'VIDEO' as const,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Sample video
      mimeType: 'video/mp4',
    },
    {
      id: 'intro-media-3',
      name: 'Welcome Audio Guide',
      description: 'Audio introduction to the session',
      type: 'AUDIO' as const,
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder audio
      mimeType: 'audio/mpeg',
    },
    {
      id: 'intro-media-4',
      name: 'Session Guidelines Image',
      description: 'Visual guide showing session guidelines',
      type: 'IMAGE' as const,
      url: 'https://via.placeholder.com/800x600/8B5CF6/FFFFFF?text=Session+Guidelines', // Placeholder image
      mimeType: 'image/png',
    },
    {
      id: 'intro-media-5',
      name: 'CBT Concepts Document',
      description: 'PDF guide to CBT concepts',
      type: 'DOCUMENT' as const,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Placeholder PDF
      mimeType: 'application/pdf',
    },
  ];

  for (const media of introMedia) {
    await prisma.mediaAsset.upsert({
      where: { id: media.id },
      update: {},
      create: media,
    });
  }

  console.log('✅ Created media assets');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

