import prisma from '../src/config/prisma.js';
import { getEmbedding } from '../src/services/embeddings.js';

async function backfill() {
  console.log('🔍 Checking existing faculty embeddings in database...');

  const faculties = await prisma.faculty.findMany({
    select: {
      id: true,
      name: true,
      researchInterests: true,
    },
    orderBy: { id: 'asc' },
  });

  const check = await prisma.$queryRawUnsafe(
    'SELECT id, (embedding IS NOT NULL) as "hasEmbedding" FROM faculties'
  );
  const embeddedMap = new Map(check.map((r) => [r.id, r.hasEmbedding]));

  const needsEmbedding = faculties.filter(
    (f) => f.researchInterests.length > 0 && !embeddedMap.get(f.id)
  );

  console.log(
    `Total faculty: ${faculties.length}, Faculty with interests: ${
      faculties.filter((f) => f.researchInterests.length > 0).length
    }, Already embedded: ${
      check.filter((r) => r.hasEmbedding).length
    }, Needs embedding: ${needsEmbedding.length}`
  );

  if (needsEmbedding.length === 0) {
    console.log('✨ All faculty research embeddings are already up to date!');
    await prisma.$disconnect();
    return;
  }

  let count = 0;
  for (const f of needsEmbedding) {
    const text = f.researchInterests.join(', ');
    try {
      const vector = await getEmbedding(text);
      if (vector && vector.length === 768) {
        const vectorStr = `[${vector.join(',')}]`;
        await prisma.$executeRawUnsafe(
          'UPDATE faculties SET embedding = $1::vector WHERE id = $2',
          vectorStr,
          f.id
        );
        count++;
        console.log(`[${count}/${needsEmbedding.length}] Embedded ${f.id} (${f.name})`);
      }
      // Small pause to be gentle with rate limits
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.error(`❌ Failed embedding ${f.id}:`, err.message);
    }
  }

  console.log(`\n🎉 Successfully backfilled ${count} faculty embeddings!`);
  await prisma.$disconnect();
}

backfill().catch((err) => {
  console.error('Fatal backfill error:', err);
  process.exit(1);
});
