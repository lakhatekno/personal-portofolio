'use client';

import React, { useEffect, useState } from 'react';
import { useFilterCamera, CameraConfig } from '@/lib/useFilterCamera';
import { FaCamera, FaSpinner, FaExchangeAlt, FaRedo, FaTrash, FaLayerGroup } from 'react-icons/fa';
import ReactConfetti from 'react-confetti';

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

const STICKER_GALLERY = [
  '/images/stickers/anomali-1.png',
  '/images/stickers/anomali-2.png',
  '/images/stickers/anomali-3.png',
  '/images/stickers/light-fury-sit-outline.png',
  '/images/stickers/toothless-fire-breath-outline.png',
  '/images/stickers/toothless-flying-outline.png',
  '/images/stickers/toothless-front-face-outline.png',
];

export default function ValenBdayPage() {
  const [isMirrored, setIsMirrored] = useState(true);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recycleConfetti, setRecycleConfetti] = useState(true);
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);
  
  const { 
    videoRef, 
    canvasRef, 
    status, 
    isReady, 
    capturePhoto, 
    isPersonFound,
    stickersList,
    selectedStickerId,
    addSticker,
    deleteSticker,
    selectSticker,
    canvasHandlers
  } = useFilterCamera(CONFIG, isMirrored);

  useEffect(() => {
    if (isPersonFound && !hasFiredConfetti && isReady) {
      setHasFiredConfetti(true);
      setShowConfetti(true);
      setRecycleConfetti(true);
    }
  }, [isPersonFound, hasFiredConfetti, isReady]);

  useEffect(() => {
    if (recycleConfetti && showConfetti) {
      const timer = setTimeout(() => setRecycleConfetti(false), 7500);
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

  return (
    <div className="flex flex-col items-center min-h-screen text-white p-4 overflow-x-hidden">
      
      {showConfetti && (
        <ReactConfetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1000}
          height={typeof window !== 'undefined' ? window.innerHeight : 1000}
          recycle={recycleConfetti}
          numberOfPieces={350}
          onConfettiComplete={(confetti) => {
            setShowConfetti(false);
            confetti?.reset();
          }}
          style={{ position: 'fixed', pointerEvents: 'none', zIndex: 50 }}
        />
      )}

      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-stone-200 to-cyan-300 bg-clip-text text-transparent">
          It's <span className='bg-linear-to-b from-pink-200 to bg-pink-500 bg-clip-text font-semibold'>Valen</span>'s Bday!
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl justify-center items-start relative">
        
        {/* --- LEFT: Layer Manager --- */}
        <div className=" absolute left-32 self-start w-full lg:w-32 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 order-2 lg:order-1 h-fit">
          <div className="flex items-center gap-2 text-zinc-400 border-b border-zinc-800 pb-2">
            <FaLayerGroup />
            <span className="font-semibold text-sm uppercase tracking-wider">Layers</span>
          </div>
          
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {stickersList.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-4">No stickers added</p>
            )}
            {stickersList.slice().reverse().map((sticker, index) => (
              <div 
                key={sticker.id}
                onClick={() => selectSticker(sticker.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  selectedStickerId === sticker.id ? 'bg-zinc-800 border border-cyan-500/50' : 'bg-zinc-900 border border-transparent hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-950 rounded overflow-hidden p-1">
                    <img src={sticker.img.src} alt="sticker" className="w-full h-full object-contain" />
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteSticker(sticker.id); }}
                  className="text-zinc-500 hover:text-red-500 p-1"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- CENTER: Camera Viewport --- */}
        <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 ring-4 ring-zinc-900 order-1 lg:order-2">
          <div className="relative w-full aspect-video bg-zinc-900 select-none">
            
            <video
              ref={videoRef}
              muted
              playsInline
              className={`absolute top-0 left-0 w-full h-full object-cover pointer-events-none transition-transform duration-300 ${isMirrored ? 'transform -scale-x-100' : ''}`} 
            />
            
            {/* Interactive Canvas */}
            <canvas
              ref={canvasRef}
              {...canvasHandlers} // Attach Mouse/Touch events
              className="absolute top-0 left-0 w-full h-full object-cover cursor-crosshair touch-none" 
            />

            {!isReady && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm">
                <FaSpinner className="text-4xl text-purple-500 animate-spin mb-4" />
                <p className="text-white font-medium animate-pulse">{status}</p>
              </div>
            )}

            <div 
              className={`absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-150 ease-out ${
                triggerFlash ? 'opacity-100' : 'opacity-0'
              }`} 
            />
          </div>

          <div className="bg-zinc-900 p-4 flex justify-between items-center border-t border-zinc-800">
             <div className="flex gap-4">
                <button onClick={() => setIsMirrored(!isMirrored)} className="p-3 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition">
                  <FaExchangeAlt className={isMirrored ? 'rotate-180' : ''} />
                </button>
                <button onClick={resetConfetti} disabled={!hasFiredConfetti} className={`p-3 rounded-full text-white transition ${hasFiredConfetti ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-zinc-800 opacity-50'}`}>
                  <FaRedo />
                </button>
             </div>

             <button onClick={handleCapture} disabled={!isReady} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-all">
               <FaCamera className="text-2xl text-zinc-900" />
             </button>
             
             <div className="w-24"></div> 
          </div>
        </div>
      </div>

      {/* --- BOTTOM: Sticker Gallery --- */}
      <div className="w-fit max-w-5xl mt-8">
        <h3 className="text-zinc-400 text-sm font-semibold mb-3 uppercase tracking-wider">Stickers Gallery</h3>
        <div className="flex justify-center gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {STICKER_GALLERY.map((src, i) => (
            <button
              key={i}
              onClick={() => addSticker(src)}
              className="shrink-0 w-24 h-24 bg-zinc-800/50 rounded-xl p-2 border border-zinc-700 hover:border-cyan-500 hover:bg-zinc-800 transition-all group relative"
            >
              <img src={src} alt="sticker" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity">
                <span className="text-xs font-bold text-white">ADD +</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center max-w-md">
        <p className="text-zinc-500 text-xs">
          Drag to move. Top handle to rotate. <strong>Bottom-Right handle to resize.</strong>
        </p>
      </div>
    </div>
  );
}