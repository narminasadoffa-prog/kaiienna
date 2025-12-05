'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  link: string;
  buttonText: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    title: 'Новая коллекция 2024',
    description: 'Откройте для себя стиль и комфорт в каждой детали',
    link: '/women',
    buttonText: 'Смотреть коллекцию',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
    title: 'Скидки до 50%',
    description: 'На всю коллекцию распродажи. Успейте купить по выгодным ценам!',
    link: '/sale',
    buttonText: 'Перейти к распродаже',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80',
    title: 'Детская коллекция',
    description: 'Яркая и комфортная одежда для ваших детей',
    link: '/kids',
    buttonText: 'Смотреть детскую одежду',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1920&q=80',
    title: 'Мужская мода',
    description: 'Стильная и качественная одежда для современного мужчины',
    link: '/men',
    buttonText: 'Смотреть мужскую одежду',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Автоматическое переключение слайдов
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Переключение каждые 5 секунд

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Обработка свайпов
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Возобновляем автоплей через 10 секунд после ручного переключения
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  return (
    <section 
      className="relative w-full h-[calc(100vh-80px)] min-h-[600px] overflow-hidden -mt-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-contain"
                sizes="100vw"
                style={{ objectPosition: 'center center', maxHeight: '100%', width: 'auto', margin: '0 auto' }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/5"></div>
              
              {/* Content */}
              <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-delay">
                    {slide.description}
                  </p>
                  <Link
                    href={slide.link}
                    className="btn-primary bg-white text-primary-600 hover:bg-gray-100 inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105 animate-fade-in-delay-2"
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
        aria-label="Предыдущий слайд"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
        aria-label="Следующий слайд"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentSlide
                ? 'w-12 h-3 bg-white'
                : 'w-3 h-3 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-white transition-all duration-5000 ease-linear"
            style={{
              width: '100%',
              animation: 'progress 5s linear',
            }}
          />
        </div>
      )}
    </section>
  );
}

