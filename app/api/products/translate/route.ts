import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Məhsul adlarının tərcümə lüğəti
const productNameTranslations: { [key: string]: string } = {
  // Qadın geyimləri
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
  'palto': 'Пальто',
  'paltolar': 'Пальто',
  'kurtka': 'Куртка',
  'kurtkalar': 'Куртки',
  'ceket': 'Жакет',
  'ceketlər': 'Жакеты',
  'sviter': 'Свитер',
  'sviterlər': 'Свитеры',
  'kardiqan': 'Кардиган',
  'kardiqanlar': 'Кардиганы',
  'hoodie': 'Худи',
  'sweatshirt': 'Свитшот',
  'sweatshirtlər': 'Свитшоты',
  't-shirt': 'Футболка',
  't-shirtlər': 'Футболки',
  'top': 'Топ',
  'toplar': 'Топы',
  'crop top': 'Кроп-топ',
  'crop toplar': 'Кроп-топы',
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
  
  // Kişi geyimləri
  'şalvar': 'Брюки',
  'şalvarlar': 'Брюки',
  'cins': 'Джинсы',
  'cinslər': 'Джинсы',
  'qolbaq': 'Кошелек',
  'qolbaqlar': 'Кошельки',
  'şal': 'Шарф',
  'şallar': 'Шарфы',
  'qalstuk': 'Галстук',
  'qalstuklar': 'Галстуки',
  
  // Uşaq geyimləri
  'uşaq paltarı': 'Детское платье',
  'uşaq paltarları': 'Детские платья',
  'uşaq köynəyi': 'Детская рубашка',
  'uşaq köynəkləri': 'Детские рубашки',
  'uşaq donu': 'Детские брюки',
  'uşaq donları': 'Детские брюки',
  'uşaq ayaqqabısı': 'Детская обувь',
  'uşaq ayaqqabıları': 'Детская обувь',
}

// Məhsul təsvirlərinin tərcümə lüğəti
const productDescriptionTranslations: { [key: string]: string } = {
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
  'yüksək keyfiyyət': 'Высокое качество',
  '100% pamuk': '100% хлопок',
  '100% ipək': '100% шелк',
  '100% yün': '100% шерсть',
}

// Tərcümə funksiyası
function translateProductName(name: string): string {
  // Əgər ad artıq rus dilindədirsə, qaytar
  if (/[а-яё]/i.test(name)) {
    return name
  }

  const nameLower = name.toLowerCase().trim()
  
  // Normalizasiya
  let normalizedName = nameLower
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
    .replace(/i̇/g, 'i')

  // Dəqiq uyğunluq
  if (productNameTranslations[normalizedName]) {
    return productNameTranslations[normalizedName]
  }

  // Qismən uyğunluq
  for (const [key, value] of Object.entries(productNameTranslations)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value
    }
  }

  // Açar sözlərə görə tərcümə
  if (normalizedName.includes('paltar') || normalizedName.includes('плать')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Платья' : 'Платье'
  } else if (normalizedName.includes('köynək') || normalizedName.includes('рубашк')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Рубашки' : 'Рубашка'
  } else if (normalizedName.includes('bluz') || normalizedName.includes('блузк')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Блузки' : 'Блузка'
  } else if (normalizedName.includes('don') || normalizedName.includes('брюк')) {
    return 'Брюки'
  } else if (normalizedName.includes('yubka') || normalizedName.includes('юбк')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Юбки' : 'Юбка'
  } else if (normalizedName.includes('palto') || normalizedName.includes('пальто')) {
    return 'Пальто'
  } else if (normalizedName.includes('kurtka') || normalizedName.includes('куртк')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Куртки' : 'Куртка'
  } else if (normalizedName.includes('sviter') || normalizedName.includes('свитер')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Свитеры' : 'Свитер'
  } else if (normalizedName.includes('kardiqan') || normalizedName.includes('кардиган')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Кардиганы' : 'Кардиган'
  } else if (normalizedName.includes('t-shirt') || normalizedName.includes('футболк')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Футболки' : 'Футболка'
  } else if (normalizedName.includes('aksesuar') || normalizedName.includes('аксессуар')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Аксессуары' : 'Аксессуар'
  } else if (normalizedName.includes('çanta') || normalizedName.includes('сумк')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Сумки' : 'Сумка'
  } else if (normalizedName.includes('ayaqqab') || normalizedName.includes('обув')) {
    return 'Обувь'
  } else if (normalizedName.includes('bot') || normalizedName.includes('ботинк')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Ботинки' : 'Ботинки'
  } else if (normalizedName.includes('tufli') || normalizedName.includes('туфл')) {
    return 'Туфли'
  } else if (normalizedName.includes('idman ayaqqab') || normalizedName.includes('кроссовк')) {
    return 'Кроссовки'
  } else if (normalizedName.includes('iç geyim') || normalizedName.includes('нижнее белье')) {
    return 'Нижнее белье'
  } else if (normalizedName.includes('korset') || normalizedName.includes('корсет')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Корсеты' : 'Корсет'
  } else if (normalizedName.includes('büstqalter') || normalizedName.includes('бюстгальтер')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Бюстгальтеры' : 'Бюстгальтер'
  } else if (normalizedName.includes('şalvar') || normalizedName.includes('шалвар')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Брюки' : 'Брюки'
  } else if (normalizedName.includes('cins') || normalizedName.includes('джинс')) {
    return 'Джинсы'
  } else if (normalizedName.includes('şal') || normalizedName.includes('шарф')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Шарфы' : 'Шарф'
  } else if (normalizedName.includes('qalstuk') || normalizedName.includes('галстук')) {
    return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Галстуки' : 'Галстук'
  } else if (normalizedName.includes('uşaq') || normalizedName.includes('детск')) {
    if (normalizedName.includes('paltar')) {
      return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Детские платья' : 'Детское платье'
    } else if (normalizedName.includes('köynək')) {
      return normalizedName.includes('lar') || normalizedName.includes('lər') ? 'Детские рубашки' : 'Детская рубашка'
    } else if (normalizedName.includes('don')) {
      return 'Детские брюки'
    } else if (normalizedName.includes('ayaqqab')) {
      return 'Детская обувь'
    }
  }

  // Tərcümə tapılmadısa, orijinal adı qaytar
  return name
}

function translateProductDescription(description: string): string {
  // Əgər təsvir artıq rus dilindədirsə, qaytar
  if (/[а-яё]/i.test(description)) {
    return description
  }

  const descLower = description.toLowerCase().trim()
  let translatedDesc = description

  // Açar sözləri tərcümə et
  for (const [key, value] of Object.entries(productDescriptionTranslations)) {
    const regex = new RegExp(key, 'gi')
    translatedDesc = translatedDesc.replace(regex, value)
  }

  // Ümumi tərcümələr
  translatedDesc = translatedDesc
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

  return translatedDesc
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
      select: {
        id: true,
      },
    })

    const subcategoryIds = subcategories.map((cat) => cat.id)

    // Alt kateqoriyalardakı məhsulları yüklə
    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: subcategoryIds },
        deletedAt: null,
      },
    })

    let translated = 0
    let skipped = 0
    let errors: string[] = []

    for (const product of products) {
      try {
        // Adı tərcümə et
        const translatedName = translateProductName(product.name)
        
        // Təsviri tərcümə et
        const translatedDescription = translateProductDescription(product.description)

        // Əgər heç bir dəyişiklik yoxdursa, keç
        if (translatedName === product.name && translatedDescription === product.description) {
          skipped++
          continue
        }

        // Slug-u yenilə (yeni ad əsasında)
        const generateSlug = (text: string) => {
          const translit: { [key: string]: string } = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          }
          
          return text
            .toLowerCase()
            .split('')
            .map(char => translit[char] || char)
            .join('')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        const newSlug = generateSlug(translatedName)
        
        // Slug-un unique olduğunu yoxla
        const existingProduct = await prisma.product.findUnique({
          where: { slug: newSlug },
          select: { id: true },
        })

        let finalSlug = product.slug
        if (!existingProduct || existingProduct.id === product.id) {
          finalSlug = newSlug
        } else {
          // Əgər slug mövcuddursa, unikal et
          finalSlug = `${newSlug}-${product.id.slice(-6)}`
        }

        // Məhsulu yenilə
        await prisma.product.update({
          where: { id: product.id },
          data: {
            name: translatedName,
            description: translatedDescription,
            slug: finalSlug,
          },
        })

        translated++
      } catch (error: any) {
        errors.push(`${product.name}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      translated,
      skipped,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error("Error translating products:", error)
    return NextResponse.json(
      { error: error.message || "Failed to translate products" },
      { status: 500 }
    )
  }
}

