"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// 1. Import the icons you chose from react-icons
import { AiFillMoon } from "react-icons/ai";
import { FaStar } from 'react-icons/fa';
import { PiFlowerTulip } from 'react-icons/pi';
import Couple from '@/src/icons/couple.svg'

// Star type definition remains the same
interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  animationDelay: string;
}

export default function ToValen() {
  const [stars, setStars] = useState<Star[]>([]);
  const starCount = 50;

  useEffect(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      newStars.push({
        id: i,
        top: `${Math.random() * 65}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 8 + 6, // Adjusted size for react-icons
        animationDelay: `${Math.random() * 5}s`,
      });
    }
    setStars(newStars);
  }, []);

  const flowers = [
    { left: '5%', size: 28 }, { left: '15%', size: 36 },
    { left: '28%', size: 28 }, { left: '60%', size: 32 },
    { left: '72%', size: 24 }, { left: '85%', size: 36 },
  ];

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-lg aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 bg-transparent shadow-2xl mt-8">
      
      {/* Stars - Now using FaStar */}
      {stars.map((star) => (
        <FaStar
          key={star.id}
          size={star.size}
          className="absolute text-slate-100 animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.animationDelay,
          }}
        />
      ))}

      {/* Moon - Now using AiFillMoon */}
      <AiFillMoon
        size={90}
        className="absolute top-[6%] left-[6%] text-slate-100"
      />

      {/* The Text - No changes here */}
      <p className="absolute top-1/5 left-1/4 translate-x-1/3 -rotate-12 font-caveat text-white text-3xl md:text-4xl text-left leading-tight text-shadow-md text-shadow-slate-50/50">
        Be my present<br />
        and future again,<br />
        Vii ♡
      </p>
      
      {/* The Couple - Now using BsPeopleFill */}
      <Image
        src={Couple}
        height={250}
        alt='Couple'
        className="absolute -bottom-6 left-1/2 -translate-x-1/2"
      />

      {/* Flowers - Now using GiTulip */}
      {flowers.map((flower, index) => (
        <PiFlowerTulip
          key={index}
          size={flower.size}
          className="absolute bottom-0 text-slate-100"
          style={{ 
            left: flower.left,
          }}
        />
      ))}
    </div>
  );
};