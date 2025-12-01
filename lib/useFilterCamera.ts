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

// --- Internal State Interface ---
interface DetectionState {
  lastDetections: any[];
  missingFrames: number;
}

const MAX_MISSING_FRAMES = 10;

export const useFilterCamera = (config: CameraConfig, isMirrored: boolean) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // We use a ref for mirroring inside the loop to avoid dependency staleness
  const isMirroredRef = useRef(isMirrored); 
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState<string>('Initializing...');
  const [isReady, setIsReady] = useState(false);

  // NEW: State to expose detection status to the Page
  const [isPersonFound, setIsPersonFound] = useState(false);
  // NEW: Ref to track detection inside the setInterval closure to avoid re-render floods
  const isPersonFoundRef = useRef(false);

  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  
  const imgRefA = useRef<HTMLImageElement | null>(null);
  const imgRefB = useRef<HTMLImageElement | null>(null);

  // Update ref when prop changes
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

        const imgA = new Image(); imgA.src = config.maskImages.personA;
        const imgB = new Image(); imgB.src = config.maskImages.others;
        imgRefA.current = imgA;
        imgRefB.current = imgB;

        if (isMounted) {
          setStatus('Learning Faces...');
          await loadReferenceFaces();
          setIsModelLoaded(true);
          startCamera();
        }
      } catch (error) {
        console.error("Setup Error:", error);
        if (isMounted) setStatus('Error loading resources.');
      }
    };

    loadResources();
    return () => { isMounted = false; };
  }, []);

  // --- 2. One-Shot Learning ---
  const loadReferenceFaces = async () => {
    const descriptors: Float32Array[] = [];
    for (const imagePath of config.referenceImages) {
      const img = await faceapi.fetchImage(imagePath);
      const detection = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (detection) descriptors.push(detection.descriptor);
    }

    if (descriptors.length > 0) {
      setFaceMatcher(new faceapi.FaceMatcher([
        new faceapi.LabeledFaceDescriptors('Person A', descriptors)
      ], config.threshold));
    }
  };

  // --- 3. Start Webcam ---
  const startCamera = async () => {
    setStatus('Starting Camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
      }
    } catch (err) {
      setStatus('Camera Access Denied');
    }
  };

  // --- 4. Detection Loop ---
  useEffect(() => {
    if (!isModelLoaded || !faceMatcher || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    let intervalId: NodeJS.Timeout;
    
    let detectionState: DetectionState = {
      lastDetections: [],
      missingFrames: 0,
    };

    const startDetection = () => {
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      setIsReady(true);
      setStatus('');

      intervalId = setInterval(async () => {
        if (video.paused || video.ended) return;

        // Detect
        const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Anti-Flicker Logic
        let renderList = [];
        if (resizedDetections.length > 0) {
          renderList = resizedDetections;
          detectionState.lastDetections = resizedDetections;
          detectionState.missingFrames = 0;
        } else if (detectionState.missingFrames < MAX_MISSING_FRAMES && detectionState.lastDetections.length > 0) {
          renderList = detectionState.lastDetections;
          detectionState.missingFrames++;
        }

        // Track if Person A is seen in this specific frame
        let personASeenInFrame = false;

        // Draw Logic
        renderList.forEach(detection => {
          const { descriptor } = detection;
          const box = detection.detection.box;
          const match = faceMatcher.findBestMatch(descriptor);
          const isPersonA = match.label === 'Person A';

          if (isPersonA) {
            personASeenInFrame = true;
          }

          const overlayImg = isPersonA ? imgRefA.current : imgRefB.current;
          
          if (overlayImg) {
             const scaleWidth = 1.5;
             const drawWidth = box.width * scaleWidth;
             const ratio = overlayImg.naturalWidth / overlayImg.naturalHeight;
             
             if (ratio) {
               const drawHeight = drawWidth / ratio;
               
               // Calculate X position based on Mirror State
               let drawX = box.x + (box.width / 2) - (drawWidth / 2);

               // If Mirrored: Flip the X coordinate relative to canvas width
               if (isMirroredRef.current) {
                 drawX = canvas.width - drawX - drawWidth;
               }

               const drawY = box.y - drawHeight + (box.height * 0.6); 

               // We draw the image normally. 
               // Since we adjusted X manually, the text remains readable.
               ctx.drawImage(overlayImg, drawX, drawY, drawWidth, drawHeight);
             }
          }
        });

        // Update State Logic: 
        // Only update React state if the detection status actually CHANGED compared to our Ref.
        // This prevents re-rendering the Page component 30 times a second.
        if (personASeenInFrame !== isPersonFoundRef.current) {
          isPersonFoundRef.current = personASeenInFrame;
          setIsPersonFound(personASeenInFrame);
        }

      }, 33);
    };

    video.addEventListener('play', startDetection);

    return () => {
      clearInterval(intervalId);
      video.removeEventListener('play', startDetection);
    };
  }, [isModelLoaded, faceMatcher]); // Removed isMirrored from dep array to prevent loop restart

  // --- 5. Capture Function ---
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');

    if (ctx) {
      // 1. Draw Video
      if (isMirroredRef.current) {
        // If mirrored, flip the context to draw the video backwards (like a mirror)
        ctx.save();
        ctx.translate(tempCanvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0);
      }

      // 2. Draw Overlay
      // The canvas is already drawn with the correct "visual" coordinates in the loop
      // so we just layer it on top normally.
      ctx.drawImage(canvas, 0, 0);
      
      const link = document.createElement('a');
      link.download = `valen-bday-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    }
  }, []);

  return { videoRef, canvasRef, status, isReady, capturePhoto, isPersonFound };
};