"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

const slides = [
  {
    id: 1,
    image: "/home-banner-1.png",
    title: "",
    subtitle: "",
    tag: "",
  },
  {
    id: 2,
    image: "/home-banner-2.png",
    title: "",
    subtitle: "",
    tag: "",
  },
]

export default function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (isPaused) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide()
          return 0
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isPaused, nextSlide])

  return (
    <div className="relative w-full h-[450px] md:h-[450px] lg:h-[450px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-1000 ease-out",
            index === currentSlide 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-105"
          )}
        >
          {/* Background Image with Ken Burns effect */}
          <div 
            className={cn(
              "absolute inset-0 transition-transform duration-[8000ms] ease-out",
              index === currentSlide && "scale-110"
            )}
          >
            <img 
              src={slide.image || "/placeholder.svg"} 
              alt={slide.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Gradient Overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-r from-[#002366]/90 via-[#002366]/70 to-transparent" /> */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" /> */}
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
              <div className="max-w-2xl space-y-6">
                {/* Tag */}
                <div 
                  className={cn(
                    "inline-flex items-center px-4 py-1.5 rounded-full",
                    "bg-white/10 backdrop-blur-md border border-white/20",
                    "transition-all duration-700 delay-100",
                    index === currentSlide 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-4"
                  )}
                >
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {slide.tag}
                  </span>
                </div>

                {/* Title */}
                <h1 
                  className={cn(
                    "text-4xl md:text-5xl lg:text-6xl font-bold text-white text-balance leading-tight",
                    "transition-all duration-700 delay-200",
                    index === currentSlide 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-8"
                  )}
                >
                  {slide.title}
                </h1>
                
                {/* Subtitle */}
                <p 
                  className={cn(
                    "text-lg md:text-xl lg:text-2xl text-white/90 max-w-xl",
                    "transition-all duration-700 delay-300",
                    index === currentSlide 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-8"
                  )}
                >
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className={cn(
          "absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10",
          "w-12 h-12 rounded-full flex items-center justify-center",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "text-white hover:bg-white/20",
          "transition-all duration-300 hover:scale-110"
        )}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className={cn(
          "absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10",
          "w-12 h-12 rounded-full flex items-center justify-center",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "text-white hover:bg-white/20",
          "transition-all duration-300 hover:scale-110"
        )}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-white/10 backdrop-blur-md border border-white/20",
            "text-white hover:bg-white/20",
            "transition-all duration-300"
          )}
        >
          {isPaused ? <Play className="h-4 w-4 ml-0.5" /> : <Pause className="h-4 w-4" />}
        </button>

        {/* Progress Indicators */}
        <div className="flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index)
                setProgress(0)
              }}
              className="relative h-1 rounded-full overflow-hidden bg-white/30 transition-all duration-300"
              style={{ width: index === currentSlide ? "3rem" : "0.75rem" }}
            >
              {index === currentSlide && (
                <div 
                  className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Slide Counter */}
        {/* <div className="text-white/80 text-sm font-medium">
          <span className="text-white">{String(currentSlide + 1).padStart(2, "0")}</span>
          <span className="mx-1">/</span>
          <span>{String(slides.length).padStart(2, "0")}</span>
        </div> */}
      </div>

    </div>
  )
}
