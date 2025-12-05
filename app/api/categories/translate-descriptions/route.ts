import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    'pencek': 'Рубашка',
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
      .replace(/pencek/gi, 'Рубашка')
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
    })

    let translated = 0
    let skipped = 0
    let errors: string[] = []

    for (const subcategory of subcategories) {
      // Description-u tərcümə et
      if (!subcategory.description) {
        skipped++
        continue
      }

      const translatedDescription = translateProductDescription(subcategory.description)
      
      // Əgər tərcümə dəyişməyibsə, keç
      if (translatedDescription === subcategory.description) {
        skipped++
        continue
      }

      try {
        await prisma.category.update({
          where: { id: subcategory.id },
          data: {
            description: translatedDescription,
          },
        })
        translated++
      } catch (error: any) {
        errors.push(`Категория ${subcategory.name}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      translated,
      skipped,
      total: subcategories.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error("Error translating category descriptions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to translate category descriptions" },
      { status: 500 }
    )
  }
}

