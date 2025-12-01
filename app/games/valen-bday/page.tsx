'use client';

import React, { useEffect, useState } from 'react';
import { useFilterCamera, CameraConfig } from '@/lib/useFilterCamera';
import { FaCamera, FaSpinner, FaExchangeAlt, FaRedo } from 'react-icons/fa';
import ReactConfetti from 'react-confetti';

// --- Configuration ---
const CONFIG: CameraConfig = {
  modelUrl: '/models',
  referenceImages: [
    '/images/orang-a-1.jpg',
    '/images/orang-a-2.jpeg',
    '/images/orang-a-3.jpg',
  ],
  maskImages: {
    personA: '/images/mask-x.png',
    others: '/images/mask-y.png',
  },
  threshold: 0.6,
};

export default function ValenBdayPage() {
  const [isMirrored, setIsMirrored] = useState(true); // Default to mirror for selfie feel
  const [triggerFlash, setTriggerFlash] = useState(false);

  // Confetti State
  const [showConfetti, setShowConfetti] = useState(false); // Controls visibility/rendering
  const [recycleConfetti, setRecycleConfetti] = useState(true); // Controls if it keeps raining
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false); // Lock to ensure it only happens once
  
  // Pass mirror state to hook
  const { videoRef, canvasRef, status, isReady, capturePhoto, isPersonFound } = useFilterCamera(CONFIG, isMirrored);

  // --- Confetti Logic ---
  // --- Logic 1: Trigger the Celebration ---
  useEffect(() => {
    // Only fire if found, haven't fired yet, and isReady
    if (isPersonFound && !hasFiredConfetti && isReady) {
      setHasFiredConfetti(true);   // Lock it
      setShowConfetti(true);       // Mount component
      setRecycleConfetti(true);    // Start raining
    }
  }, [isPersonFound, hasFiredConfetti, isReady]);

  // --- Logic 2: Stop the Rain (The Timer) ---
  useEffect(() => {
    if (recycleConfetti && showConfetti) {
      const timer = setTimeout(() => {
        setRecycleConfetti(false); // Gracefully stop generating new pieces
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [recycleConfetti, showConfetti]);

  const resetConfetti = () => {
    setHasFiredConfetti(false);
    setShowConfetti(false);
  };

  const handleCapture = () => {
    setTriggerFlash(true);
    capturePhoto();
    setTimeout(() => setTriggerFlash(false), 150);
  };

  const toggleMirror = () => {
    setIsMirrored(prev => !prev);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      
      {/* Confetti Overlay */}
      {showConfetti && (
        <ReactConfetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1000}
          height={typeof window !== 'undefined' ? window.innerHeight : 1000}
          recycle={recycleConfetti}
          numberOfPieces={350}
          onConfettiComplete={(confetti) => {
            // Optional: Unmount completely when all particles are off-screen
            setShowConfetti(false);
            confetti?.reset();
          }}
          style={{ position: 'fixed', pointerEvents: 'none', zIndex: 50 }}
        />
      )}

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-stone-200 to-cyan-300 bg-clip-text text-transparent">
          Its <span className='bg-gradient-to-b from-pink-200 to bg-pink-500 bg-clip-text font-semibold'>Valen</span>'s Bday, everyone!
        </h1>
      </div>

      {/* Main Container: Flex Row for Desktop, Col for Mobile */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full max-w-5xl">
        
        {/* --- Camera Viewport --- */}
        <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 ring-4 ring-zinc-900">
          <div className="relative w-full aspect-video bg-zinc-900">
            
            {/* Video: Apply CSS transform based on state */}
            <video
              ref={videoRef}
              muted
              playsInline
              className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ${isMirrored ? 'transform -scale-x-100' : ''}`} 
            />
            
            {/* Canvas: NEVER mirror with CSS. We handle coordinates in JS to keep text readable. */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full object-cover" 
            />

            {/* Loading Overlay */}
            {!isReady && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm transition-opacity duration-500">
                <FaSpinner className="text-4xl text-purple-500 animate-spin mb-4" />
                <p className="text-white font-medium tracking-wide animate-pulse">
                  {status}
                </p>
              </div>
            )}

            {/* Flash Effect */}
            <div 
              className={`absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-150 ease-out ${
                triggerFlash ? 'opacity-100' : 'opacity-0'
              }`} 
            />
          </div>
        </div>

        {/* --- Controls Sidebar --- */}
        <div className="flex flex-row md:flex-col gap-6 items-center justify-center p-4">
          
          {/* Mirror Toggle Button */}
          <button
            onClick={toggleMirror}
            disabled={!isReady}
            className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 border border-zinc-700"
            title="Mirror Camera"
          >
            <FaExchangeAlt className={`text-lg transition-transform duration-300 ${isMirrored ? 'rotate-180' : ''}`} />
          </button>

          {/* Reset Confetti Button */}
          <button
            onClick={resetConfetti}
            disabled={!hasFiredConfetti} 
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 border border-zinc-700 ${
              hasFiredConfetti 
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white cursor-pointer' 
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
            title="Reset Confetti"
          >
            <FaRedo className={`text-lg ${!hasFiredConfetti ? 'opacity-50' : ''}`} />
          </button>

          {/* Shutter Button */}
          <button
            onClick={handleCapture}
            disabled={!isReady}
            className="group relative flex items-center justify-center"
            aria-label="Take Photo"
          >
            {/* Button Outer Ring */}
            <div className="w-20 h-20 rounded-full border-4 border-white/30 group-hover:border-white transition-all duration-300 absolute" />
            
            {/* Button Inner Circle */}
            <div className="w-16 h-16 bg-white rounded-full text-zinc-900 flex items-center justify-center shadow-lg transform group-active:scale-90 transition-transform duration-200">
              <FaCamera className="text-2xl" />
            </div>
          </button>
        </div>

      </div>

      <div className="mt-8 text-center max-w-md">
        <p className="text-zinc-500 text-xs">
          Ensure you are in a well-lit area.
        </p>
      </div>
    </div>
  );
}