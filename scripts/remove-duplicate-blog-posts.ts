import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for duplicate blog posts...');

  // Get all posts
  const allPosts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total posts: ${allPosts.length}`);

  // Find duplicates by slug
  const slugMap = new Map<string, any[]>();
  
  allPosts.forEach(post => {
    if (!slugMap.has(post.slug)) {
      slugMap.set(post.slug, []);
    }
    slugMap.get(post.slug)!.push(post);
  });

  // Find duplicates
  const duplicates: any[] = [];
  slugMap.forEach((posts, slug) => {
    if (posts.length > 1) {
      console.log(`Found ${posts.length} posts with slug: ${slug}`);
      // Keep the first one (oldest), mark others for deletion
      const toDelete = posts.slice(1);
      duplicates.push(...toDelete);
    }
  });

  if (duplicates.length === 0) {
    console.log('No duplicate posts found!');
    return;
  }

  console.log(`Found ${duplicates.length} duplicate posts to delete:`);
  duplicates.forEach(post => {
    console.log(`- ${post.title} (ID: ${post.id}, Created: ${post.createdAt})`);
  });

  // Delete duplicates
  for (const post of duplicates) {
    await prisma.blogPost.delete({
      where: { id: post.id },
    });
    console.log(`Deleted: ${post.title}`);
  }

  console.log(`\nSuccessfully removed ${duplicates.length} duplicate posts!`);
  console.log(`Remaining posts: ${allPosts.length - duplicates.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

