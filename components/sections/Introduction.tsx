'use client';
import { useEffect, useRef } from 'react';
import { Sailing } from '@mui/icons-material';
import gsap from 'gsap';

export default function Introduction() {
  const underlineRef = useRef<HTMLDivElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const rotatingTextRef = useRef<HTMLDivElement>(null!);

  // === Hover underline animation ===
  const handleMouseEnter = () => {
    gsap.fromTo(
      underlineRef.current,
      { width: '0%', x: '0%' },
      { width: '100%', x: '0%', duration: 0.8, ease: 'bounce.out' }
    );
  };

  const handleMouseLeave = () => {
    gsap.to(underlineRef.current, {
      width: '0%',
      x: '0%',
      duration: 0.4,
      ease: 'bounce.out'
    });
  };

  // === Rolling text animation ===
  const initRollingText = () => {
    const textItems = Array.from(rotatingTextRef.current.children) as HTMLElement[];
    const total = textItems.length;
    let index = 0;

    // Pastikan container punya 3D context
    gsap.set(rotatingTextRef.current, {
      position: 'relative',
      height: textItems[0].offsetHeight,
      transformStyle: 'preserve-3d'
    });

    gsap.set(textItems, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
      opacity: 0
    });

    // Tampilkan item pertama
    gsap.set(textItems[0], { opacity: 1 });

    const rotateTexts = () => {
      const current = textItems[index];
      const next = textItems[(index + 1) % total];

      // keluar
      gsap.to(current, {
        duration: 0.6,
        rotationX: 90,
        opacity: 0,
        transformOrigin: '50% 50% -20px',
        ease: 'power2.in'
      });

      // masuk
      gsap.fromTo(
        next,
        { rotationX: -90, opacity: 0, transformOrigin: '50% 50% -20px' },
        {
          duration: 0.6,
          rotationX: 0,
          opacity: 1,
          ease: 'power2.out',
          delay: 0.6
        }
      );

      index = (index + 1) % total;
    };

    return setInterval(rotateTexts, 2500);
  };

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    const rollingInterval = initRollingText();

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(rollingInterval);
    };
  }, []);

  return (
    <section className="flex mt-2 h-96 items-center justify-center">
      <div className="w-fit mx-auto flex flex-col items-start justify-center">
        <h1 className="text-5xl font-bold text-slate-100">
          Welcome Aboard{' '}
          <Sailing className="scale-150 text-cyan-500" />
        </h1>

        {/* Hover underline */}
        <div
          ref={containerRef}
          className="text-3xl text-slate-100 flex gap-2"
        >
          <p>I'm </p>
          <div className="flex flex-col">
            <h2 className="font-bold text-cyan-500">Lakha Tekno</h2>
            <div
              ref={underlineRef}
              className="w-0 border-b-4 border-cyan-500 self-end -mt-0.5"
            ></div>
          </div>
        </div>

        {/* Rotating text */}
        <div
          className="relative h-8 mt-1 w-64 text-slate-100"
          style={{ perspective: '500px' }}
        >
          <div
            ref={rotatingTextRef}
            className="relative h-full text-lg font-bold"
          >
            <span>a Front-End Developer</span>
            <span>a Software Engineer</span>
            <span>a Data Analyst</span>
            <span>an LLM Enthusiast</span>
          </div>
        </div>
      </div>
    </section>
  );
}
