"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TrackCtaLink from "@/components/analytics/TrackCtaLink";

interface Slide {
  id: number;
  tagline: string;
  title: string;
  description: string;
  image: string;
}

export default function DynamicHero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 0,
      tagline: "Builders & Infrastructure",
      title: "Building civil infrastructure designed to endure.",
      description: "Specializing in high-precision land development, residential construction, and public engineering with multidecade scaling.",
      image: "/images/builders_infrastructure.jpg",
    },
    {
      id: 1,
      tagline: "Contracting Services",
      title: "Executing high-scale corporate & public projects.",
      description: "Disciplined procurement management and structural contracting across key industrial zones with absolute integrity.",
      image: "/images/contracting_services.jpg",
    },
    {
      id: 2,
      tagline: "ICH Dine Academia",
      title: "Training the future leaders of hospitality.",
      description: "A vocational academy specializing in culinary excellence, event coordination, and professional skill empowerment.",
      image: "/images/ich_dine_academia.jpg",
    },
    {
      id: 3,
      tagline: "Healthcare Division",
      title: "Distributing pharmacy & medical supply lines.",
      description: "Coordinating clinical supply chains, pharmaceutical retail, and future medical care consulting under Shanti Medical Hall.",
      image: "/images/healthcare_division.jpg",
    },
    {
      id: 4,
      tagline: "Digital Media & Marketing",
      title: "Designing creative digital strategies.",
      description: "Leading brands into the future through high-performance marketing, e-commerce support, and software consulting.",
      image: "/images/digital_media.jpg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [slides.length]);

  const listItems = [
    ...slides,
    {
      id: 5,
      tagline: slides[0].tagline,
      title: slides[0].title,
      description: slides[0].description,
      image: slides[0].image,
    }
  ];

  return (
    <section className="relative bg-slate-950 text-white min-h-[640px] md:min-h-[700px] flex items-center px-6 sm:px-8 border-b border-slate-900 overflow-hidden pt-28 pb-20">

      {/* Background Slideshow images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-55 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
          {/* Zoom effect on current active slide */}
          <div
            className={`w-full h-full bg-cover bg-center transition-transform duration-[6000ms] ease-out ${index === currentSlide ? "scale-105" : "scale-100"
              }`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
        </div>
      ))}

      {/* Dim Overlay (Uniform overlay to keep background images bright but readable) */}
      <div className="absolute inset-0 bg-slate-950/45 pointer-events-none z-1" />

      {/* Content Area */}
      <div className="container mx-auto px-5 w-full relative z-10 font-sans flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full gap-y-3 lg:gap-y-0 lg:gap-x-8 items-center">

          {/* Left Column: Brand Prefix */}
          <div className="w-full text-center lg:text-right text-white text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl uppercase font-[300] pb-3 lg:pb-0 lg:flex lg:justify-end lg:items-center tracking-wide select-none lg:col-span-4 xl:col-span-5 whitespace-nowrap">
            <span>Rubinsons Group</span>
            <span className="hidden lg:inline mx-4 text-slate-500 font-light">|</span>
          </div>

          {/* Right Column: Sliding Taglines */}
          <div className="relative h-15 sm:h-20 xl:h-25 overflow-hidden flex justify-center lg:justify-start w-full lg:col-span-8 xl:col-span-7">
            <div
              className="transition-transform duration-700 ease-in-out w-full h-fit"
              style={{ transform: `translateY(-${currentSlide * (100 / 6)}%)` }}
            >
              {listItems.map((slide, index) => {
                const isActive = index === currentSlide;

                return (
                  <div
                    key={`${slide.id}-${index}`}
                    className="h-15 sm:h-20 xl:h-25 flex flex-col justify-center items-center lg:items-start transition-all duration-500"
                  >
                    <span
                      className={`text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-sans tracking-wide uppercase transition-all duration-500 whitespace-nowrap text-center lg:text-left ${isActive
                        ? "text-white font-[800] opacity-100 scale-100"
                        : "text-white/0 font-[800] opacity-0 scale-95 pointer-events-none"
                        }`}
                    >
                      {slide.tagline}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Mouse Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-70 select-none pointer-events-none">
        <span className="text-[9.5px] uppercase tracking-widest text-slate-400 font-bold">Explore Rubinsons</span>
        <div className="w-7 h-10 border-2 border-slate-400 rounded-full flex justify-center p-1.5">
          <div className="w-1.5 h-2 bg-brand-bronze rounded-full animate-bounce" />
        </div>
      </div>

    </section>
  );
}
