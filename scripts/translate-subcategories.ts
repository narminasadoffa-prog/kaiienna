import { prisma } from '../lib/prisma';

// Alt kateqoriyaların tərcümə lüğəti
const translations: { [key: string]: string } = {
  // Qadın geyimləri
  'paltarlar': 'Платья',
  'aksesuarlar': 'Аксессуары',
  'ayakkabilar': 'Обувь',
  'ayakkabılar': 'Обувь',
  'aşağı geyimlər': 'Нижняя одежда',
  'aşağı geyimler': 'Нижняя одежда',
  'xarici geyimlər': 'Верхняя одежда',
  'xarici geyimler': 'Верхняя одежда',
  'iç geyimlər': 'Нижнее белье',
  'iç geyimler': 'Нижнее белье',
  'iç geyimləri': 'Нижнее белье',
  'iç geyimleri': 'Нижнее белье',
  'iç geyimlər': 'Нижнее белье',
  'iç geyimlər': 'Нижнее белье',
  'üst geyimlər': 'Верхняя одежда',
  'üst geyimler': 'Верхняя одежда',
  'donlar': 'Брюки',
  'donlar': 'Брюки',
  'gunluk don': 'Повседневные брюки',
  'günlük don': 'Повседневные брюки',
  'köynək': 'Рубашки',
  'bluz': 'Блузки',
  'top': 'Топы',
  'crop top': 'Кроп-топы',
  't-shirt': 'Футболки',
  'sviter': 'Свитеры',
  'kardiqan': 'Кардиганы',
  'hoodie': 'Худи',
  'sweatshirt': 'Свитшоты',
  'palto': 'Пальто',
  'gece geyimi': 'Ночная одежда',
  'nightzoom': 'Ночная одежда',
  'ofis donlari': 'Офисная одежда',
  'ofis donları': 'Офисная одежда',
  'yubka': 'Юбки',
  'yubkalar': 'Юбки',
  
  // Uşaq geyimləri
  'qız geyimləri': 'Детская одежда для девочек',
  'qiz geyimleri': 'Детская одежда для девочек',
  'oğlan geyimləri': 'Детская одежда для мальчиков',
  'oglan geyimleri': 'Детская одежда для мальчиков',
  '0-2 yaş': '0-2 года',
  '0-2 yas': '0-2 года',
  '3-6 yaş': '3-6 лет',
  '3-6 yas': '3-6 лет',
  '7-12 yaş': '7-12 лет',
  '7-12 yas': '7-12 лет',
  '13-15 yaş': '13-15 лет',
  '13-15 yas': '13-15 лет',
  '16-18 yaş': '16-18 лет',
  '16-18 yas': '16-18 лет',
};

async function translateSubcategories() {
  try {
    console.log('Начинаем перевод подкатегорий...');
    
    // Bütün alt kateqoriyaları yüklə
    const subcategories = await prisma.category.findMany({
      where: {
        parentId: { not: null },
        deletedAt: null,
      },
    });

    console.log(`Найдено ${subcategories.length} подкатегорий`);

    let translated = 0;
    let skipped = 0;

    for (const subcategory of subcategories) {
      // Əgər ad artıq rus dilindədirsə, keç
      if (/[а-яё]/i.test(subcategory.name)) {
        console.log(`Пропущено (уже на русском): ${subcategory.name}`);
        skipped++;
        continue;
      }

      // Azərbaycan əlifbasındakı xüsusi hərfləri dəyişdir
      let nameLower = subcategory.name.toLowerCase().trim();
      // Unicode normalizasiyası
      nameLower = nameLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      nameLower = nameLower.replace(/ı/g, 'i').replace(/ə/g, 'e').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c');
      // İ hərfini i ilə əvəz et
      nameLower = nameLower.replace(/İ/g, 'i').replace(/i̇/g, 'i');
      
      // Tərcüməni tap
      let translatedName = translations[nameLower] || translations[subcategory.name.toLowerCase().trim()];
      
      // Əgər dəqiq uyğun yoxdursa, qismən uyğunluq axtar
      if (!translatedName) {
        // Əvvəlcə tam uyğunluq axtar
        for (const [key, value] of Object.entries(translations)) {
          if (nameLower === key || nameLower.includes(key) || key.includes(nameLower)) {
            translatedName = value;
            break;
          }
        }
      }
      
      // Əgər hələ də tərcümə tapılmadısa, açar sözlərə görə tərcümə et
      if (!translatedName) {
        if (nameLower.includes('aksesuar') || nameLower.includes('аксессуар')) {
          translatedName = 'Аксессуары';
        } else if (nameLower.includes('ayakkab') || nameLower.includes('ayaqqab') || nameLower.includes('обув')) {
          translatedName = 'Обувь';
        } else if (nameLower.includes('iç geyim') || nameLower.includes('нижнее белье') || nameLower.includes('iç geyimlər') || nameLower.includes('iç geyimler')) {
          translatedName = 'Нижнее белье';
        } else if (nameLower.includes('paltar') || nameLower.includes('плать')) {
          translatedName = 'Платья';
        } else if (nameLower.includes('don') || nameLower.includes('брюк')) {
          translatedName = 'Брюки';
        } else if (nameLower.includes('yubka') || nameLower.includes('юбк')) {
          translatedName = 'Юбки';
        } else if (nameLower.includes('köynək') || nameLower.includes('рубашк')) {
          translatedName = 'Рубашки';
        } else if (nameLower.includes('bluz') || nameLower.includes('блузк')) {
          translatedName = 'Блузки';
        } else if (nameLower.includes('palto') || nameLower.includes('пальто')) {
          translatedName = 'Пальто';
        } else if (nameLower.includes('qız') || nameLower.includes('девочк')) {
          translatedName = 'Детская одежда для девочек';
        } else if (nameLower.includes('oğlan') || nameLower.includes('мальчик')) {
          translatedName = 'Детская одежда для мальчиков';
        } else if (nameLower.includes('yaş') || nameLower.includes('yas') || nameLower.includes('лет') || nameLower.includes('год')) {
          // Yaş qrupları üçün
          if (nameLower.includes('0-2')) {
            translatedName = '0-2 года';
          } else if (nameLower.includes('3-6')) {
            translatedName = '3-6 лет';
          } else if (nameLower.includes('7-12')) {
            translatedName = '7-12 лет';
          } else if (nameLower.includes('13-15')) {
            translatedName = '13-15 лет';
          } else if (nameLower.includes('16-18')) {
            translatedName = '16-18 лет';
          }
        }
      }

      // Əgər hələ də tərcümə tapılmadısa, xüsusi hallar üçün yoxla
      if (!translatedName) {
        const originalName = subcategory.name.toLowerCase().trim();
        const normalizedName = originalName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/İ/g, 'i').replace(/i̇/g, 'i');
        if (normalizedName.includes('ic') && normalizedName.includes('geyim')) {
          translatedName = 'Нижнее белье';
        } else if (normalizedName.includes('iç') && normalizedName.includes('geyim')) {
          translatedName = 'Нижнее белье';
        }
      }

      if (translatedName) {
        await prisma.category.update({
          where: { id: subcategory.id },
          data: { name: translatedName },
        });
        console.log(`✓ ${subcategory.name} → ${translatedName}`);
        translated++;
      } else {
        console.log(`✗ Не найдено перевода для: ${subcategory.name}`);
        skipped++;
      }
    }

    console.log(`\nГотово!`);
    console.log(`Переведено: ${translated}`);
    console.log(`Пропущено: ${skipped}`);
  } catch (error) {
    console.error('Ошибка при переводе:', error);
  } finally {
    await prisma.$disconnect();
  }
}

translateSubcategories();

