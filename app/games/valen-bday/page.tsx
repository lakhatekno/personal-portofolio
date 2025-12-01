'use client';

import React, { useState } from 'react';
import { useFilterCamera, CameraConfig } from '@/lib/useFilterCamera';
import { FaCamera, FaSpinner } from 'react-icons/fa';

// --- Configuration ---
const CONFIG: CameraConfig = {
  modelUrl: '/models',
  referenceImages: [
    '/images/orang-a-1.jpg',
    '/images/orang-a-2.jpeg', // Assuming jpeg based on your info
    '/images/orang-a-3.jpg',
  ],
  maskImages: {
    personA: '/images/mask-x.png',
    others: '/images/mask-y.png',
  },
  threshold: 0.6,
};

export default function ValenBdayPage() {
  const [triggerFlash, setTriggerFlash] = useState(false);
  const { videoRef, canvasRef, status, isReady, capturePhoto } = useFilterCamera(CONFIG);

  const handleCapture = () => {
    setTriggerFlash(true);
    capturePhoto();
    setTimeout(() => setTriggerFlash(false), 150);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
          
        </h1>
      </div>

      {/* Camera Container (Card) */}
      <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 ring-4 ring-zinc-900">
        
        {/* Wrapper to maintain aspect ratio logic if needed, or just relative stacking */}
        <div className="relative w-full aspect-video bg-zinc-900">
          
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100" // Mirror effect
          />
          
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100" // Mirror canvas too
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

        {/* Controls Bar */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-end z-10">
          <button
            onClick={handleCapture}
            disabled={!isReady}
            className="group relative flex items-center justify-center"
            aria-label="Take Photo"
          >
            {/* Button Outer Ring */}
            <div className="w-16 h-16 rounded-full border-4 border-white/30 group-hover:border-white transition-all duration-300 absolute" />
            
            {/* Button Inner Circle */}
            <div className="w-12 h-12 bg-white rounded-full text-zinc-900 flex items-center justify-center shadow-lg transform group-active:scale-90 transition-transform duration-200">
              <FaCamera className="text-xl" />
            </div>
          </button>
        </div>
      </div>

      {/* Footer / Instructions */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-zinc-500 text-xs">
          Ensure you are in a well-lit area.
        </p>
      </div>
    </div>
  );
}