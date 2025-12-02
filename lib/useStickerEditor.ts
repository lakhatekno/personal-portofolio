import { useEffect, useRef, useState, useCallback } from 'react';

export interface Sticker {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in radians
  isSelected: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const useStickerEditor = (width: number, height: number) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stickersRef = useRef<Sticker[]>([]);
  const [hasStickers, setHasStickers] = useState(false);

  // Interaction State
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef<Point>({ x: 0, y: 0 });
  const activeStickerId = useRef<string | null>(null);

  // --- Helpers ---
  const getMousePos = (evt: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in evt) {
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    } else {
      clientX = (evt as MouseEvent).clientX;
      clientY = (evt as MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  // Check if point is inside a rotated rectangle
  const isPointInSticker = (p: Point, s: Sticker) => {
    // Translate point back to origin relative to sticker center
    const cx = s.x;
    const cy = s.y;
    
    // Rotate point inverse to sticker rotation
    const cos = Math.cos(-s.rotation);
    const sin = Math.sin(-s.rotation);
    
    const dx = p.x - cx;
    const dy = p.y - cy;
    
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    
    return (
      rx >= -s.width / 2 &&
      rx <= s.width / 2 &&
      ry >= -s.height / 2 &&
      ry <= s.height / 2
    );
  };

  // --- Rendering Loop ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stickersRef.current.forEach(sticker => {
      ctx.save();
      ctx.translate(sticker.x, sticker.y);
      ctx.rotate(sticker.rotation);
      ctx.drawImage(
        sticker.image, 
        -sticker.width / 2, 
        -sticker.height / 2, 
        sticker.width, 
        sticker.height
      );

      // Draw UI if selected
      if (sticker.isSelected) {
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(-sticker.width / 2, -sticker.height / 2, sticker.width, sticker.height);

        // Resize/Rotate Handle (Bottom Right)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sticker.width / 2, sticker.height / 2, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Delete Handle (Top Right)
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(sticker.width / 2, -sticker.height / 2, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // X icon
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sticker.width / 2 - 4, -sticker.height / 2 - 4);
        ctx.lineTo(sticker.width / 2 + 4, -sticker.height / 2 + 4);
        ctx.moveTo(sticker.width / 2 + 4, -sticker.height / 2 - 4);
        ctx.lineTo(sticker.width / 2 - 4, -sticker.height / 2 + 4);
        ctx.stroke();
      }

      ctx.restore();
    });
  }, []);

  // --- Actions ---
  const addSticker = (imgSrc: string) => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const baseSize = 150;
      
      const newSticker: Sticker = {
        id: Date.now().toString(),
        image: img,
        x: width / 2,
        y: height / 2,
        width: baseSize,
        height: baseSize / aspectRatio,
        rotation: 0,
        isSelected: true
      };

      // Deselect others
      stickersRef.current.forEach(s => s.isSelected = false);
      stickersRef.current.push(newSticker);
      activeStickerId.current = newSticker.id;
      setHasStickers(true);
      draw();
    };
  };

  const clearStickers = () => {
    stickersRef.current = [];
    activeStickerId.current = null;
    setHasStickers(false);
    draw();
  };

  // --- Event Handlers ---
  const handleStart = (evt: any) => {
    evt.preventDefault(); // Prevent scrolling on touch
    const pos = getMousePos(evt);
    let found = false;

    // Check handles first for active sticker
    if (activeStickerId.current) {
      const s = stickersRef.current.find(s => s.id === activeStickerId.current);
      if (s) {
        // Calculate handle positions in screen space
        const cos = Math.cos(s.rotation);
        const sin = Math.sin(s.rotation);

        // Delete Handle (Top Right relative to center)
        // x = (w/2 * cos) - (-h/2 * sin) + cx
        // y = (w/2 * sin) + (-h/2 * cos) + cy
        const delX = (s.width/2 * cos) - (-s.height/2 * sin) + s.x;
        const delY = (s.width/2 * sin) + (-s.height/2 * cos) + s.y;
        
        // Resize Handle (Bottom Right)
        const resX = (s.width/2 * cos) - (s.height/2 * sin) + s.x;
        const resY = (s.width/2 * sin) + (s.height/2 * cos) + s.y;

        const distDel = Math.hypot(pos.x - delX, pos.y - delY);
        const distRes = Math.hypot(pos.x - resX, pos.y - resY);

        if (distDel < 20) {
          // Delete
          stickersRef.current = stickersRef.current.filter(st => st.id !== s.id);
          activeStickerId.current = null;
          draw();
          return;
        }

        if (distRes < 20) {
          isResizing.current = true;
          dragStart.current = pos;
          return;
        }
      }
    }

    // Check hit on bodies (iterate backwards to select top-most)
    for (let i = stickersRef.current.length - 1; i >= 0; i--) {
      const s = stickersRef.current[i];
      if (isPointInSticker(pos, s)) {
        // Select this one
        stickersRef.current.forEach(st => st.isSelected = false);
        s.isSelected = true;
        activeStickerId.current = s.id;
        
        // Move to end of array (render on top)
        stickersRef.current.splice(i, 1);
        stickersRef.current.push(s);
        
        isDragging.current = true;
        dragStart.current = pos;
        found = true;
        draw();
        break;
      }
    }

    if (!found) {
      // Deselect all
      stickersRef.current.forEach(st => st.isSelected = false);
      activeStickerId.current = null;
      draw();
    }
  };

  const handleMove = (evt: any) => {
    evt.preventDefault();
    if (!activeStickerId.current) return;
    
    const pos = getMousePos(evt);
    const sIndex = stickersRef.current.findIndex(s => s.id === activeStickerId.current);
    if (sIndex === -1) return;
    const s = stickersRef.current[sIndex];

    if (isDragging.current) {
      const dx = pos.x - dragStart.current.x;
      const dy = pos.y - dragStart.current.y;
      
      s.x += dx;
      s.y += dy;
      
      dragStart.current = pos;
      draw();
    } else if (isResizing.current) {
      // Calculate angle and distance from center to mouse
      const dx = pos.x - s.x;
      const dy = pos.y - s.y;
      
      // Rotation
      const angle = Math.atan2(dy, dx);
      // Offset by 45 deg (pi/4) approx because handle is at corner
      // or simply align with the diagonal.
      // Let's just set rotation to the angle of the mouse relative to center.
      // But we need to account for the initial aspect ratio offset.
      // Simpler: Just use the delta angle?
      // Let's use exact angle:
      s.rotation = angle - Math.atan(s.height / s.width);

      // Scale (distance based)
      const dist = Math.hypot(dx, dy);
      // Original diagonal was hypot(w/2, h/2).
      // New diagonal is dist.
      // Keep aspect ratio
      const ratio = s.width / s.height;
      // dist represents half diagonal length roughly
      const newWidth = dist * 2 * Math.cos(Math.atan(1/ratio)); 
      
      // Simplified scaling:
      // Just map distance to width based on fixed aspect ratio
      const currentDiag = Math.hypot(s.width/2, s.height/2);
      const scaleFactor = dist / currentDiag;
      
      s.width *= scaleFactor;
      s.height *= scaleFactor;

      draw();
    }
  };

  const handleEnd = (evt: any) => {
    evt.preventDefault();
    isDragging.current = false;
    isResizing.current = false;
  };

  // Bind events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd); // Window to catch drag outs

    // Touch
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);

      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, []);

  return {
    stickerCanvasRef: canvasRef,
    addSticker,
    clearStickers,
    hasStickers,
    // Utility function to draw stickers onto another context (for capture)
    drawStickersToContext: (targetCtx: CanvasRenderingContext2D, scaleX: number = 1, scaleY: number = 1) => {
        stickersRef.current.forEach(sticker => {
            targetCtx.save();
            // Adjust position for target resolution
            targetCtx.translate(sticker.x * scaleX, sticker.y * scaleY);
            targetCtx.rotate(sticker.rotation);
            targetCtx.drawImage(
                sticker.image, 
                (-sticker.width / 2) * scaleX, 
                (-sticker.height / 2) * scaleY, 
                sticker.width * scaleX, 
                sticker.height * scaleY
            );
            targetCtx.restore();
        });
    }
  };
};