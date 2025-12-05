import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Demo məhsul məlumatları
const demoProducts = [
  {
    name: "Стильная футболка",
    description: "Удобная и стильная футболка из качественного хлопка. Идеально подходит для повседневной носки.",
    price: 29.99,
    compareAtPrice: 39.99,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
    quantity: 50,
  },
  {
    name: "Классические джинсы",
    description: "Классические джинсы с идеальной посадкой. Изготовлены из премиального денима.",
    price: 79.99,
    compareAtPrice: 99.99,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"],
    quantity: 30,
  },
  {
    name: "Элегантное платье",
    description: "Элегантное платье для особых случаев. Изготовлено из качественных материалов.",
    price: 129.99,
    compareAtPrice: 159.99,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"],
    quantity: 25,
  },
  {
    name: "Спортивная куртка",
    description: "Спортивная куртка с ветрозащитой. Идеально подходит для активного образа жизни.",
    price: 89.99,
    compareAtPrice: 119.99,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    quantity: 40,
  },
  {
    name: "Модные кроссовки",
    description: "Стильные и удобные кроссовки для повседневной носки. Высокое качество и комфорт.",
    price: 99.99,
    compareAtPrice: 129.99,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
    quantity: 35,
  },
];

// Slug yaratmaq üçün funksiya
const generateSlug = (text: string) => {
  const transliterate = (text: string) => {
    const mapping: { [key: string]: string } = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    };
    return text.split('').map(char => mapping[char] || char).join('');
  };

  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

async function main() {
  console.log("Начинаем добавление демо-товаров...");

  try {
    // Bütün əsas kateqoriyaları götür (parentId null olanlar)
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        deletedAt: null,
      },
    });

    console.log(`Найдено ${categories.length} основных категорий`);

    for (const category of categories) {
      console.log(`\nОбрабатываем категорию: ${category.name}`);

      // Bu kateqoriyada artıq neçə məhsul var?
      const existingProductsCount = await prisma.product.count({
        where: {
          categoryId: category.id,
          deletedAt: null,
        },
      });

      // Əgər artıq 5 və ya daha çox məhsul varsa, keç
      if (existingProductsCount >= 5) {
        console.log(`  ✓ В категории уже есть ${existingProductsCount} товаров, пропускаем`);
        continue;
      }

      // Neçə məhsul əlavə etməliyik?
      const productsToAdd = 5 - existingProductsCount;

      for (let i = 0; i < productsToAdd; i++) {
        const demoProduct = demoProducts[i % demoProducts.length];
        const baseSlug = generateSlug(demoProduct.name);
        const uniqueSlug = `${baseSlug}-${category.slug}-${Date.now()}-${i}`;
        const sku = `DEMO-${category.slug.toUpperCase()}-${i + 1}-${Date.now()}`;

        try {
          const product = await prisma.product.create({
            data: {
              name: `${demoProduct.name} (${category.name})`,
              slug: uniqueSlug,
              description: demoProduct.description,
              price: demoProduct.price,
              compareAtPrice: demoProduct.compareAtPrice,
              sku: sku,
              images: demoProduct.images,
              categoryId: category.id,
              quantity: demoProduct.quantity,
              active: true,
              featured: i === 0, // İlk məhsulu featured et
            },
          });

          console.log(`  ✓ Создан товар: ${product.name}`);
        } catch (error: any) {
          if (error.code === 'P2002') {
            // Slug və ya SKU artıq mövcuddur, yenidən cəhd et
            console.log(`  ⚠ Товар с таким slug/SKU уже существует, пропускаем`);
          } else {
            console.error(`  ✗ Ошибка при создании товара:`, error.message);
          }
        }
      }
    }

    console.log("\n✓ Готово! Демо-товары добавлены во все категории.");
  } catch (error) {
    console.error("Ошибка:", error);
    throw error;
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

