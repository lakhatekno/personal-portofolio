import React from 'react';

const STICKERS = [
  'anomali-1',
  'anomali-2',
  'anomali-3',
  'light-fury-sit-outline',
  'toothless-fire-breath-outline',
  'toothless-flying-outline',
  'toothless-front-face-outline'
];

interface StickerGalleryProps {
  onAddSticker: (src: string) => void;
  className?: string;
}

export const StickerGallery: React.FC<StickerGalleryProps> = ({ onAddSticker, className }) => {
  return (
    <div className={`w-full ${className}`}>
        <div className="flex justify-center gap-4 p-2 w-fit">
            {STICKERS.map((name) => (
                <button
                    key={name}
                    onClick={() => onAddSticker(`/images/stickers/${name}.png`)}
                    className="group relative w-20 h-20 bg-zinc-800/50 rounded-xl border border-zinc-700 hover:border-purple-500 hover:bg-zinc-800 transition-all overflow-hidden flex items-center justify-center"
                >
                    <img 
                        src={`/images/stickers/${name}.png`} 
                        alt={name}
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-200"
                    />
                </button>
            ))}
        </div>
        <p className="text-center text-zinc-500 text-[10px] mt-1">Tap to add sticker</p>
    </div>
  );
};