import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

// --- Configuration Types ---
export interface CameraConfig {
  modelUrl: string;
  referenceImages: string[];
  maskImages: {
    personA: string; 
    others: string;
  };
  threshold: number;
}

export interface Sticker {
  id: string;
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in radians
  aspectRatio: number; // To maintain ratio during resize
}

// --- Internal State Interface ---
interface DetectionState {
  lastDetections: any[];
  missingFrames: number;
}

const MAX_MISSING_FRAMES = 10;
const MIN_STICKER_SIZE = 40;

export const useFilterCamera = (config: CameraConfig, isMirrored: boolean) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMirroredRef = useRef(isMirrored); 

  // --- Sticker State (Refs for animation loop) ---
  const stickersRef = useRef<Sticker[]>([]);
  const selectedStickerIdRef = useRef<string | null>(null);
  
  // Interaction State
  const isDraggingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const isResizingRef = useRef(false); // NEW: Resize state

  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const activeStickerOffsetRef = useRef({ x: 0, y: 0 }); // For drag offset
  
  // React State for UI
  const [stickersList, setStickersList] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState<string>('Initializing...');
  const [isReady, setIsReady] = useState(false);
  const [isPersonFound, setIsPersonFound] = useState(false);
  const isPersonFoundRef = useRef(false);

  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const imgRefA = useRef<HTMLImageElement | null>(null);
  const imgRefB = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    isMirroredRef.current = isMirrored;
  }, [isMirrored]);

  // --- 1. Load Resources ---
  useEffect(() => {
    let isMounted = true;
    const loadResources = async () => {
      try {
        setStatus('Loading AI Models...');
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(config.modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(config.modelUrl),
          faceapi.nets.faceRecognitionNet.loadFromUri(config.modelUrl),
        ]);

        // Preload Mask Images
        const imgA = new Image(); imgA.src = config.maskImages.personA;
        const imgB = new Image(); imgB.src = config.maskImages.others;
        imgRefA.current = imgA;
        imgRefB.current = imgB;

        if (isMounted) {
          setStatus('Learning Faces...');
          // We don't await this blocking the camera start anymore
          // to ensure camera works even if images fail.
          loadReferenceFaces().then(() => {
             console.log("Faces Loaded");
          }).catch(e => {
             console.warn("Face Reference Load Failed", e);
          });

          setIsModelLoaded(true);
          startCamera();
        }
      } catch (error) {
        console.error("Setup Error:", error);
        if (isMounted) setStatus('Error loading resources.');
      }
    };

    loadResources();
    return () => { 
      isMounted = false; 
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const loadReferenceFaces = async () => {
    const descriptors: Float32Array[] = [];
    for (const imagePath of config.referenceImages) {
      try {
        const img = await faceapi.fetchImage(imagePath);
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if (detection) descriptors.push(detection.descriptor);
      } catch (e) { console.warn(`Could not load ref image: ${imagePath}`); }
    }

    if (descriptors.length > 0) {
      setFaceMatcher(new faceapi.FaceMatcher([
        new faceapi.LabeledFaceDescriptors('Person A', descriptors)
      ], config.threshold));
    }
  };

  const startCamera = async () => {
    setStatus('Starting Camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
      }
    } catch (err) {
      setStatus('Camera Access Denied');
    }
  };

  // --- 2. Sticker Management Functions ---
  const addSticker = useCallback((imgUrl: string) => {
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      
      const baseSize = 150;
      const ratio = img.naturalWidth / img.naturalHeight;
      const width = baseSize;
      const height = baseSize / ratio;

      const newSticker: Sticker = {
        id: Date.now().toString(),
        img,
        x: (canvas.width / 2) - (width / 2),
        y: (canvas.height / 2) - (height / 2),
        width,
        height,
        rotation: 0,
        aspectRatio: ratio
      };

      stickersRef.current = [...stickersRef.current, newSticker];
      selectedStickerIdRef.current = newSticker.id;
      setStickersList([...stickersRef.current]);
      setSelectedStickerId(newSticker.id);
    };
  }, []);

  const deleteSticker = useCallback((id: string) => {
    stickersRef.current = stickersRef.current.filter(s => s.id !== id);
    if (selectedStickerIdRef.current === id) {
      selectedStickerIdRef.current = null;
      setSelectedStickerId(null);
    }
    setStickersList([...stickersRef.current]);
  }, []);

  const selectSticker = useCallback((id: string) => {
    selectedStickerIdRef.current = id;
    setSelectedStickerId(id);
  }, []);

  // --- 3. Interaction Helpers ---
  const getMousePos = (evt: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in evt) {
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    } else {
      clientX = (evt as React.MouseEvent).clientX;
      clientY = (evt as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const isPointInSticker = (px: number, py: number, s: Sticker) => {
    const cx = s.x + s.width / 2;
    const cy = s.y + s.height / 2;
    const cos = Math.cos(-s.rotation);
    const sin = Math.sin(-s.rotation);
    const dx = px - cx;
    const dy = py - cy;
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return (rx > -s.width / 2 && rx < s.width / 2 && ry > -s.height / 2 && ry < s.height / 2);
  };

  const transformPointToLocal = (px: number, py: number, s: Sticker) => {
    const cx = s.x + s.width / 2;
    const cy = s.y + s.height / 2;
    const cos = Math.cos(-s.rotation);
    const sin = Math.sin(-s.rotation);
    const dx = px - cx;
    const dy = py - cy;
    return {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getMousePos(e);
    
    // Check controls for selected sticker
    if (selectedStickerIdRef.current) {
      const s = stickersRef.current.find(st => st.id === selectedStickerIdRef.current);
      if (s) {
        // Transform mouse to local sticker space
        const local = transformPointToLocal(x, y, s);
        
        // 1. Check Rotate Handle (Top Center, 30px above)
        // Local coord: (0, -height/2 - 30)
        // We give it a generous hit radius
        const rotateHitX = 0;
        const rotateHitY = -s.height / 2 - 30;
        const distRotate = Math.sqrt(Math.pow(local.x - rotateHitX, 2) + Math.pow(local.y - rotateHitY, 2));
        
        if (distRotate < 25) {
          isRotatingRef.current = true;
          isDraggingRef.current = false;
          isResizingRef.current = false;
          lastMousePosRef.current = { x, y };
          return;
        }

        // 2. Check Resize Handle (Bottom Right)
        // Local coord: (width/2, height/2)
        const resizeHitX = s.width / 2;
        const resizeHitY = s.height / 2;
        const distResize = Math.sqrt(Math.pow(local.x - resizeHitX, 2) + Math.pow(local.y - resizeHitY, 2));

        if (distResize < 25) {
          isResizingRef.current = true;
          isDraggingRef.current = false;
          isRotatingRef.current = false;
          lastMousePosRef.current = { x, y };
          return;
        }
      }
    }

    // Check Hit on Stickers Body (Select & Drag)
    for (let i = stickersRef.current.length - 1; i >= 0; i--) {
      const s = stickersRef.current[i];
      if (isPointInSticker(x, y, s)) {
        selectedStickerIdRef.current = s.id;
        setSelectedStickerId(s.id);
        
        isDraggingRef.current = true;
        isRotatingRef.current = false;
        isResizingRef.current = false;
        // activeStickerOffsetRef.current = { x: x - s.x, y: y - s.y }; // Not used in relative drag, but good to have
        lastMousePosRef.current = { x, y };
        return;
      }
    }

    selectedStickerIdRef.current = null;
    setSelectedStickerId(null);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current && !isRotatingRef.current && !isResizingRef.current) return;
    if (!selectedStickerIdRef.current) return;

    const { x, y } = getMousePos(e);
    const stickers = [...stickersRef.current];
    const index = stickers.findIndex(s => s.id === selectedStickerIdRef.current);
    if (index === -1) return;

    const s = { ...stickers[index] };

    if (isDraggingRef.current) {
      const dx = x - lastMousePosRef.current.x;
      const dy = y - lastMousePosRef.current.y;
      s.x += dx;
      s.y += dy;
    } else if (isRotatingRef.current) {
      const cx = s.x + s.width / 2;
      const cy = s.y + s.height / 2;
      const angle = Math.atan2(y - cy, x - cx) + Math.PI / 2;
      s.rotation = angle;
    } else if (isResizingRef.current) {
      // Resize Logic
      // 1. Transform mouse to local space (un-rotated)
      const local = transformPointToLocal(x, y, s);
      
      // 2. Determine new dimensions based on distance from center
      // Since handle is at bottom-right, we treat local.x and local.y as half-extents
      // We take the max of x/y to drive the scale to maintain aspect ratio
      
      // Simple approach: Use X distance to drive width
      let newHalfWidth = Math.max(local.x, MIN_STICKER_SIZE / 2);
      
      // Calculate new width
      s.width = newHalfWidth * 2;
      // Maintain ratio
      s.height = s.width / s.aspectRatio;

      // Position needs to adjust so center stays same? 
      // Yes, (x,y) is top-left. If we change width/height around center, we must update x,y.
      const oldW = stickers[index].width;
      const oldH = stickers[index].height;
      
      // The dragging logic essentially expands from center because we used local coords from center
      // But s.x/s.y define top-left.
      // So new top-left is center - newWidth/2
      const cx = s.x + oldW / 2; // Old center (which shouldn't move ideally)
      const cy = s.y + oldH / 2;
      
      s.x = cx - s.width / 2;
      s.y = cy - s.height / 2;
    }

    stickers[index] = s;
    stickersRef.current = stickers;
    lastMousePosRef.current = { x, y };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isRotatingRef.current = false;
    isResizingRef.current = false;
    setStickersList([...stickersRef.current]);
  };

  // --- 4. Main Loop ---
  useEffect(() => {
    // FIX: Removed `!faceMatcher` from the guard. Loop runs even if recognition fails.
    if (!isModelLoaded || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    let intervalId: NodeJS.Timeout;
    
    let detectionState: DetectionState = { lastDetections: [], missingFrames: 0 };

    const startDetection = () => {
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      setIsReady(true);
      setStatus('');

      intervalId = setInterval(async () => {
        if (video.paused || video.ended) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // A. Face Detection
        let resizedDetections: any = [];
        try {
            // We still try to detect faces
            const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
            .withFaceLandmarks().withFaceDescriptors();
            resizedDetections = faceapi.resizeResults(detections, displaySize);
        } catch (e) {
            // Silently fail detection frame if busy
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // B. Draw Face Masks
        let renderList = [];
        if (resizedDetections.length > 0) {
          renderList = resizedDetections;
          detectionState.lastDetections = resizedDetections;
          detectionState.missingFrames = 0;
        } else if (detectionState.missingFrames < MAX_MISSING_FRAMES && detectionState.lastDetections.length > 0) {
          renderList = detectionState.lastDetections;
          detectionState.missingFrames++;
        }

        let personASeenInFrame = false;

        renderList.forEach((detection: { detection?: any; descriptor?: any; }) => {
          const { descriptor } = detection;
          const box = detection.detection.box;
          
          let isPersonA = false;
          // Only check match if matcher exists
          if (faceMatcher) {
              const match = faceMatcher.findBestMatch(descriptor);
              if (match.label === 'Person A') isPersonA = true;
          } else {
              // Fallback if no matcher: Treat everyone as 'others' or 'Person A' depending on preference?
              // Let's default to false (Others)
          }

          if (isPersonA) personASeenInFrame = true;

          const overlayImg = isPersonA ? imgRefA.current : imgRefB.current;
          
          // Ensure image is actually loaded (naturalWidth > 0)
          if (overlayImg && overlayImg.naturalWidth > 0) {
             const scaleWidth = 1.5;
             const drawWidth = box.width * scaleWidth;
             const ratio = overlayImg.naturalWidth / overlayImg.naturalHeight;
             if (ratio) {
               const drawHeight = drawWidth / ratio;
               let drawX = box.x + (box.width / 2) - (drawWidth / 2);
               if (isMirroredRef.current) {
                 drawX = canvas.width - drawX - drawWidth;
               }
               const drawY = box.y - drawHeight + (box.height * 0.6); 
               ctx.drawImage(overlayImg, drawX, drawY, drawWidth, drawHeight);
             }
          }
        });

        if (personASeenInFrame !== isPersonFoundRef.current) {
          isPersonFoundRef.current = personASeenInFrame;
          setIsPersonFound(personASeenInFrame);
        }

        // C. Draw Stickers
        stickersRef.current.forEach(sticker => {
          ctx.save();
          const cx = sticker.x + sticker.width / 2;
          const cy = sticker.y + sticker.height / 2;
          ctx.translate(cx, cy);
          ctx.rotate(sticker.rotation);
          
          // Draw Image
          ctx.drawImage(sticker.img, -sticker.width / 2, -sticker.height / 2, sticker.width, sticker.height);
          
          // Selection UI
          if (sticker.id === selectedStickerIdRef.current) {
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(-sticker.width / 2, -sticker.height / 2, sticker.width, sticker.height);
            
            // 1. Rotation Handle (Top)
            ctx.beginPath();
            ctx.moveTo(0, -sticker.height / 2);
            ctx.lineTo(0, -sticker.height / 2 - 30);
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(0, -sticker.height / 2 - 30, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 2. Resize Handle (Bottom Right)
            // Position: (width/2, height/2)
            ctx.fillStyle = '#00FFFF'; // Cyan square
            ctx.fillRect((sticker.width / 2) - 8, (sticker.height / 2) - 8, 16, 16);
          }
          ctx.restore();
        });

      }, 33);
    };

    video.addEventListener('play', startDetection);
    return () => {
      clearInterval(intervalId);
      video.removeEventListener('play', startDetection);
    };
  }, [isModelLoaded, faceMatcher]); // Loop restarts if matcher finally loads, which is fine

  // --- 5. Capture ---
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Temporarily Deselect
    const prevSelection = selectedStickerIdRef.current;
    selectedStickerIdRef.current = null;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');

    if (ctx) {
      if (isMirroredRef.current) {
        ctx.save();
        ctx.translate(tempCanvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0);
      }
      ctx.drawImage(canvas, 0, 0);
      
      const link = document.createElement('a');
      link.download = `valen-bday-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    }
    
    selectedStickerIdRef.current = prevSelection;
  }, []);

  const canvasHandlers = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onTouchStart: handleMouseDown,
    onTouchMove: handleMouseMove,
    onTouchEnd: handleMouseUp
  };

  return { 
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
  };
};