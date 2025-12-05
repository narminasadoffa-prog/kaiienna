import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Tərcümə mapping-i - bütün mümkün alt kateqoriyalar
const categoryTranslations: { [key: string]: { name: string; description?: string } } = {
  // Qadın Geyimləri alt kateqoriyaları
  'Üst Geyimlər': { name: 'Верхняя одежда', description: 'Рубашки, блузки, футболки' },
  'Aşağı Geyimlər': { name: 'Нижняя одежда', description: 'Брюки, джинсы, юбки' },
  'Paltarlar': { name: 'Платья', description: 'Повседневные и вечерние платья' },
  'Xarici Geyimlər': { name: 'Верхняя одежда', description: 'Пальто, куртки, жакеты' },
  'Aksesuarlar': { name: 'Аксессуары', description: 'Сумки, кошельки, шарфы' },
  'Ayaqqabılar': { name: 'Обувь', description: 'Ботинки, туфли, кроссовки' },
  'İç Geyimlər': { name: 'Нижнее белье', description: 'Корсеты, бюстгальтеры' },
  
  // Uşaq Geyimləri alt kateqoriyaları
  '0-2 Yaş': { name: '0-2 года', description: 'Одежда для малышей' },
  '3-6 Yaş': { name: '3-6 лет', description: 'Одежда для дошкольников' },
  '7-12 Yaş': { name: '7-12 лет', description: 'Одежда для школьников' },
  'Qız Geyimləri': { name: 'Одежда для девочек', description: 'Платья, юбки, блузки' },
  'Oğlan Geyimləri': { name: 'Одежда для мальчиков', description: 'Брюки, рубашки, футболки' },
}

// Məhsul adlarının tərcümə funksiyası
function translateProductName(name: string): string {
  const nameLower = name.toLowerCase().trim()
  
  // Əgər artıq rus dilindədirsə, qaytar
  if (/[а-яё]/i.test(name)) {
    return name
  }

  // Azərbaycan hərflərini normalizasiya et
  let normalized = nameLower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')

  // Ümumi tərcümə qaydaları
  if (normalized.includes('paltar') || normalized.includes('плать')) {
    return name.replace(/paltar/gi, 'Платье').replace(/Paltar/gi, 'Платье')
  }
  if (normalized.includes('köynək') || normalized.includes('рубашк')) {
    return name.replace(/köynək/gi, 'Рубашка').replace(/Köynək/gi, 'Рубашка')
  }
  if (normalized.includes('bluz') || normalized.includes('блузк')) {
    return name.replace(/bluz/gi, 'Блузка').replace(/Bluz/gi, 'Блузка')
  }
  if (normalized.includes('don') || normalized.includes('брюк')) {
    return name.replace(/don/gi, 'Брюки').replace(/Don/gi, 'Брюки')
  }
  if (normalized.includes('yubka') || normalized.includes('юбк')) {
    return name.replace(/yubka/gi, 'Юбка').replace(/Yubka/gi, 'Юбка')
  }
  if (normalized.includes('palto') || normalized.includes('пальто')) {
    return name.replace(/palto/gi, 'Пальто').replace(/Palto/gi, 'Пальто')
  }
  if (normalized.includes('ayakkab') || normalized.includes('ayaqqab') || normalized.includes('обув')) {
    return name.replace(/ayakkab/gi, 'Обувь').replace(/Ayaqqab/gi, 'Обувь')
  }
  if (normalized.includes('aksesuar') || normalized.includes('аксессуар')) {
    return name.replace(/aksesuar/gi, 'Аксессуар').replace(/Aksesuar/gi, 'Аксессуар')
  }
  if (normalized.includes('iç geyim') || normalized.includes('нижнее белье')) {
    return name.replace(/iç geyim/gi, 'Нижнее белье').replace(/İç Geyim/gi, 'Нижнее белье')
  }
  if (normalized.includes('t-shirt') || normalized.includes('футболк')) {
    return name.replace(/t-shirt/gi, 'Футболка').replace(/T-Shirt/gi, 'Футболка')
  }
  if (normalized.includes('sviter') || normalized.includes('свитер')) {
    return name.replace(/sviter/gi, 'Свитер').replace(/Sviter/gi, 'Свитер')
  }
  if (normalized.includes('kardiqan') || normalized.includes('кардиган')) {
    return name.replace(/kardiqan/gi, 'Кардиган').replace(/Kardiqan/gi, 'Кардиган')
  }
  if (normalized.includes('hoodie') || normalized.includes('худи')) {
    return name.replace(/hoodie/gi, 'Худи').replace(/Hoodie/gi, 'Худи')
  }

  // Əgər tərcümə tapılmadısa, sadə transliterasiya et
  const translit: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  // Əgər adda azərbaycan hərfləri varsa, sadə tərcümə et
  if (/[əöüşğçı]/i.test(name)) {
    // Sadə tərcümə: adın sonuna rus dilində ekvivalent əlavə et
    return name + ' (Товар)'
  }

  return name
}

// Məhsul təsvirinin tərcümə funksiyası
function translateProductDescription(description: string): string {
  if (!description) return description
  
  // Əgər artıq tamamilə rus dilindədirsə (azərbaycan hərfləri yoxdursa), qaytar
  if (/[а-яё]/i.test(description) && !/[əöüşğçı]/i.test(description)) {
    return description
  }
  
  // Əgər heç bir azərbaycan hərfi yoxdursa və rus hərfləri varsa, qaytar
  if (!/[əöüşğçı]/i.test(description) && /[а-яё]/i.test(description)) {
    return description
  }

  const descLower = description.toLowerCase().trim()
  let normalized = descLower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')

  // Ümumi tərcümə qaydaları
  let translated = description

  // Azərbaycan sözlərinin tərcümə lüğəti
  const wordTranslations: { [key: string]: string } = {
    'şalvar': 'Брюки',
    'şalvarlar': 'Брюки',
    'şalvarlər': 'Брюки',
    'pəncək': 'Рубашка',
    'pəncəklər': 'Рубашки',
    'pəncəklər': 'Рубашки',
    'pencek': 'Рубашка',
    'penceklər': 'Рубашки',
    'penceklər': 'Рубашки',
    'palto': 'Пальто',
    'paltolar': 'Пальто',
    'paltar': 'Платье',
    'paltarlar': 'Платья',
    'köynək': 'Рубашка',
    'köynəklər': 'Рубашки',
    'bluz': 'Блузка',
    'bluzlar': 'Блузки',
    'don': 'Брюки',
    'donlar': 'Брюки',
    'yubka': 'Юбка',
    'yubkalar': 'Юбки',
    'kurtka': 'Куртка',
    'kurtkalar': 'Куртки',
    'ceket': 'Жакет',
    'ceketlər': 'Жакеты',
    'sviter': 'Свитер',
    'sviterlər': 'Свитеры',
    'kardiqan': 'Кардиган',
    'kardiqanlar': 'Кардиганы',
    't-shirt': 'Футболка',
    't-shirtlər': 'Футболки',
    'aksesuar': 'Аксессуар',
    'aksesuarlar': 'Аксессуары',
    'çanta': 'Сумка',
    'çantalar': 'Сумки',
    'ayaqqabı': 'Обувь',
    'ayaqqabılar': 'Обувь',
    'bot': 'Ботинки',
    'botlar': 'Ботинки',
    'tufli': 'Туфли',
    'tuflilər': 'Туфли',
    'idman ayaqqabısı': 'Кроссовки',
    'idman ayaqqabıları': 'Кроссовки',
    'iç geyim': 'Нижнее белье',
    'iç geyimlər': 'Нижнее белье',
    'korset': 'Корсет',
    'korsetlər': 'Корсеты',
    'büstqalter': 'Бюстгальтер',
    'büstqalterlər': 'Бюстгальтеры',
    'cins': 'Джинсы',
    'cinslər': 'Джинсы',
    'şal': 'Шарф',
    'şallar': 'Шарфы',
    'qalstuk': 'Галстук',
    'qalstuklar': 'Галстуки',
    'qolbaq': 'Кошелек',
    'qolbaqlar': 'Кошельки',
    'gündəlik': 'Повседневный',
    'gecə': 'Вечерний',
    'ofis': 'Офисный',
    'idman': 'Спортивный',
    'yay': 'Летний',
    'qış': 'Зимний',
    'payız': 'Осенний',
    'yaz': 'Весенний',
    'pamuk': 'Хлопок',
    'ipək': 'Шелк',
    'yün': 'Шерсть',
    'sintetik': 'Синтетический',
    'rahat': 'Удобный',
    'stil': 'Стильный',
    'müasir': 'Современный',
    'klassik': 'Классический',
    'trend': 'Трендовый',
    'keyfiyyət': 'Качество',
    'yüksək': 'Высокое',
    'və': 'и',
    'və ya': 'или',
    'üçün': 'для',
  }

  // Hər sözü tərcümə et
  for (const [azWord, ruWord] of Object.entries(wordTranslations)) {
    const regex = new RegExp(`\\b${azWord}\\b`, 'gi')
    translated = translated.replace(regex, ruWord)
  }

  // Əgər hələ də azərbaycan hərfləri varsa, qismən tərcümə et
  if (/[əöüşğçı]/i.test(translated)) {
    // Qismən tərcümə: açar sözləri tərcümə et
    translated = translated
      .replace(/şalvar/gi, 'Брюки')
      .replace(/şalvarlar/gi, 'Брюки')
      .replace(/şalvarlər/gi, 'Брюки')
      .replace(/pəncək/gi, 'Рубашка')
      .replace(/pəncəklər/gi, 'Рубашки')
      .replace(/pəncəklər/gi, 'Рубашки')
      .replace(/pencek/gi, 'Рубашка')
      .replace(/penceklər/gi, 'Рубашки')
      .replace(/penceklər/gi, 'Рубашки')
      .replace(/palto/gi, 'Пальто')
      .replace(/paltar/gi, 'Платье')
      .replace(/köynək/gi, 'Рубашка')
      .replace(/bluz/gi, 'Блузка')
      .replace(/don/gi, 'Брюки')
      .replace(/yubka/gi, 'Юбка')
      .replace(/kurtka/gi, 'Куртка')
      .replace(/ceket/gi, 'Жакет')
      .replace(/sviter/gi, 'Свитер')
      .replace(/kardiqan/gi, 'Кардиган')
      .replace(/t-shirt/gi, 'Футболка')
      .replace(/aksesuar/gi, 'Аксессуар')
      .replace(/çanta/gi, 'Сумка')
      .replace(/ayaqqabı/gi, 'Обувь')
      .replace(/bot/gi, 'Ботинки')
      .replace(/tufli/gi, 'Туфли')
      .replace(/idman ayaqqabısı/gi, 'Кроссовки')
      .replace(/iç geyim/gi, 'Нижнее белье')
      .replace(/korset/gi, 'Корсет')
      .replace(/büstqalter/gi, 'Бюстгальтер')
      .replace(/cins/gi, 'Джинсы')
      .replace(/şal/gi, 'Шарф')
      .replace(/qalstuk/gi, 'Галстук')
      .replace(/qolbaq/gi, 'Кошелек')
      .replace(/gündəlik/gi, 'Повседневный')
      .replace(/gecə/gi, 'Вечерний')
      .replace(/ofis/gi, 'Офисный')
      .replace(/idman/gi, 'Спортивный')
      .replace(/yay/gi, 'Летний')
      .replace(/qış/gi, 'Зимний')
      .replace(/payız/gi, 'Осенний')
      .replace(/yaz/gi, 'Весенний')
      .replace(/pamuk/gi, 'Хлопок')
      .replace(/ipək/gi, 'Шелк')
      .replace(/yün/gi, 'Шерсть')
      .replace(/sintetik/gi, 'Синтетический')
      .replace(/rahat/gi, 'Удобный')
      .replace(/stil/gi, 'Стильный')
      .replace(/müasir/gi, 'Современный')
      .replace(/klassik/gi, 'Классический')
      .replace(/trend/gi, 'Трендовый')
      .replace(/keyfiyyət/gi, 'Качество')
      .replace(/yüksək/gi, 'Высокое')
      .replace(/\bvə\b/gi, 'и')
      .replace(/\bvə ya\b/gi, 'или')
      .replace(/\büçün\b/gi, 'для')
  }

  return translated
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Bütün alt kateqoriyaları yüklə
    const subcategories = await prisma.category.findMany({
      where: {
        parentId: { not: null },
        deletedAt: null,
      },
      include: {
        products: {
          where: {
            deletedAt: null,
          },
        },
      },
    })

    let translatedCategories = 0
    let translatedProducts = 0
    let errors: string[] = []

    for (const subcategory of subcategories) {
      // Kateqoriyanı tərcümə et
      const categoryTranslation = categoryTranslations[subcategory.name]
      
      // Description-u tərcümə et
      let translatedDescription = subcategory.description
      if (subcategory.description) {
        translatedDescription = translateProductDescription(subcategory.description)
      }
      
      if (categoryTranslation) {
        try {
          await prisma.category.update({
            where: { id: subcategory.id },
            data: {
              name: categoryTranslation.name,
              description: categoryTranslation.description || translatedDescription,
            },
          })
          translatedCategories++
        } catch (error: any) {
          errors.push(`Категория ${subcategory.name}: ${error.message}`)
        }
      } else if (translatedDescription !== subcategory.description) {
        // Əgər kateqoriya adı tərcümə olunmayıbsa, amma description tərcümə olunubsa, yalnız description-u yenilə
        try {
          await prisma.category.update({
            where: { id: subcategory.id },
            data: {
              description: translatedDescription,
            },
          })
          translatedCategories++
        } catch (error: any) {
          errors.push(`Категория ${subcategory.name}: ${error.message}`)
        }
      }

      // Məhsulları tərcümə et
      for (const product of subcategory.products) {
        // Əgər məhsul artıq rus dilindədirsə, keç
        if (/[а-яё]/i.test(product.name)) {
          continue
        }

        try {
          const translatedName = translateProductName(product.name)
          const translatedDescription = translateProductDescription(product.description || '')

          await prisma.product.update({
            where: { id: product.id },
            data: {
              name: translatedName,
              description: translatedDescription,
            },
          })
          translatedProducts++
        } catch (error: any) {
          errors.push(`Товар ${product.name}: ${error.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      translatedCategories,
      translatedProducts,
      totalCategories: subcategories.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error("Error translating categories and products:", error)
    return NextResponse.json(
      { error: error.message || "Failed to translate categories and products" },
      { status: 500 }
    )
  }
}

