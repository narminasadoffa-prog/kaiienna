import { prisma } from '../lib/prisma'

async function main() {
  console.log('🌱 Kateqoriyaları yaradıram...\n')

  // Əsas kateqoriyalar
  const mainCategories = [
    {
      name: 'Qadın Geyimləri',
      slug: 'women',
      description: 'Qadın geyimləri və aksesuarları',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      subcategories: [
        { name: 'Üst Geyimlər', slug: 'women-tops', description: 'Köynəklər, bluzlar, t-shirtlər', sizeType: 'clothing' },
        { name: 'Aşağı Geyimlər', slug: 'women-bottoms', description: 'Şalvar, cins, yubka', sizeType: 'numeric' },
        { name: 'Paltarlar', slug: 'women-dresses', description: 'Gündəlik və gecə paltarları', sizeType: 'clothing' },
        { name: 'Xarici Geyimlər', slug: 'women-outerwear', description: 'Palto, ceket, kurtka', sizeType: 'clothing' },
        { name: 'Aksesuarlar', slug: 'women-accessories', description: 'Çanta, qolbaq, şal', sizeType: null },
        { name: 'Ayaqqabılar', slug: 'women-shoes', description: 'Bot, tufli, idman ayaqqabısı', sizeType: 'shoe' },
        { name: 'İç Geyimlər', slug: 'women-lingerie', description: 'Korset, büstqalter', sizeType: 'clothing' },
      ],
    },
    {
      name: 'Kişi Geyimləri',
      slug: 'men',
      description: 'Kişi geyimləri və aksesuarları',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      subcategories: [
        { name: 'Üst Geyimlər', slug: 'men-tops', description: 'Köynək, t-shirt, polo', sizeType: 'clothing' },
        { name: 'Aşağı Geyimlər', slug: 'men-bottoms', description: 'Şalvar, cins, şort', sizeType: 'numeric' },
        { name: 'Xarici Geyimlər', slug: 'men-outerwear', description: 'Palto, ceket, kurtka', sizeType: 'clothing' },
        { name: 'Aksesuarlar', slug: 'men-accessories', description: 'Qolbaq, papaq, kəmər', sizeType: null },
        { name: 'Ayaqqabılar', slug: 'men-shoes', description: 'Bot, tufli, idman ayaqqabısı', sizeType: 'shoe' },
        { name: 'İç Geyimlər', slug: 'men-underwear', description: 'Boxer, t-shirt', sizeType: 'clothing' },
      ],
    },
    {
      name: 'Yeniyetmə Geyimləri',
      slug: 'teen',
      description: 'Yeniyetmə geyimləri və aksesuarları',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      subcategories: [
        { name: '13-15 Yaş', slug: 'teen-13-15', description: 'Yeniyetmə geyimləri', sizeType: 'clothing' },
        { name: '16-18 Yaş', slug: 'teen-16-18', description: 'Böyük yeniyetmə geyimləri', sizeType: 'clothing' },
        { name: 'Qız Geyimləri', slug: 'teen-girls', description: 'Qız yeniyetmələr üçün', sizeType: 'clothing' },
        { name: 'Oğlan Geyimləri', slug: 'teen-boys', description: 'Oğlan yeniyetmələr üçün', sizeType: 'clothing' },
        { name: 'Ayaqqabılar', slug: 'teen-shoes', description: 'Yeniyetmə ayaqqabıları', sizeType: 'shoe' },
        { name: 'Aksesuarlar', slug: 'teen-accessories', description: 'Yeniyetmə aksesuarları', sizeType: null },
      ],
    },
    {
      name: 'Uşaq Geyimləri',
      slug: 'kids',
      description: 'Uşaq geyimləri və aksesuarları',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      subcategories: [
        { name: '0-2 Yaş', slug: 'kids-0-2', description: 'Körpə geyimləri', sizeType: 'numeric' },
        { name: '3-6 Yaş', slug: 'kids-3-6', description: 'Kiçik uşaq geyimləri', sizeType: 'numeric' },
        { name: '7-12 Yaş', slug: 'kids-7-12', description: 'Böyük uşaq geyimləri', sizeType: 'clothing' },
        { name: 'Qız Geyimləri', slug: 'kids-girls', description: 'Qız uşaqlar üçün', sizeType: 'clothing' },
        { name: 'Oğlan Geyimləri', slug: 'kids-boys', description: 'Oğlan uşaqlar üçün', sizeType: 'clothing' },
        { name: 'Ayaqqabılar', slug: 'kids-shoes', description: 'Uşaq ayaqqabıları', sizeType: 'shoe' },
        { name: 'Aksesuarlar', slug: 'kids-accessories', description: 'Uşaq aksesuarları', sizeType: null },
      ],
    },
  ]

  for (const mainCat of mainCategories) {
    // Əsas kateqoriyanı yarad və ya yenilə
    const mainCategory = await prisma.category.upsert({
      where: { slug: mainCat.slug },
      update: {
        name: mainCat.name,
        description: mainCat.description,
        image: mainCat.image,
      },
      create: {
        name: mainCat.name,
        slug: mainCat.slug,
        description: mainCat.description,
        image: mainCat.image,
      },
    })

    console.log(`✅ ${mainCategory.name} yaradıldı`)

    // Alt kateqoriyaları yarad
    for (const subCat of mainCat.subcategories) {
      await prisma.category.upsert({
        where: { slug: subCat.slug },
        update: {
          name: subCat.name,
          description: subCat.description,
          parentId: mainCategory.id,
        },
        create: {
          name: subCat.name,
          slug: subCat.slug,
          description: subCat.description,
          parentId: mainCategory.id,
        },
      })
      console.log(`   └─ ${subCat.name} yaradıldı`)
    }
  }

  console.log('\n✅ Bütün kateqoriyalar yaradıldı!')
}

main()
  .catch((e) => {
    console.error('❌ Xəta:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

