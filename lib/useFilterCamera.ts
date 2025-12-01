import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

// --- Configuration Types ---
export interface CameraConfig {
  modelUrl: string;
  referenceImages: string[];
  maskImages: {
    personA: string; // Image X
    others: string; // Image Y
  };
  threshold: number;
}

// --- Internal State Interface ---
interface DetectionState {
  lastDetections: any[];
  missingFrames: number;
}

const MAX_MISSING_FRAMES = 10;

export const useFilterCamera = (config: CameraConfig) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState<string>('Initializing...');
  const [isReady, setIsReady] = useState(false);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  
  // Overlay Images Refs
  const imgRefA = useRef<HTMLImageElement | null>(null);
  const imgRefB = useRef<HTMLImageElement | null>(null);

  // --- 1. Load Resources (Models & Images) ---
  useEffect(() => {
    let isMounted = true;

    const loadResources = async () => {
      try {
        setStatus('Loading AI Models...');
        
        // Load FaceAPI Models
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(config.modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(config.modelUrl),
          faceapi.nets.faceRecognitionNet.loadFromUri(config.modelUrl),
        ]);

        // Preload Overlay Images
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
        videoRef.current.onloadedmetadata = () => {
           videoRef.current?.play();
        };
      }
    } catch (err) {
      setStatus('Camera Access Denied');
    }
  };

  // --- 4. Detection Loop (useEffect) ---
  useEffect(() => {
    if (!isModelLoaded || !faceMatcher || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    let intervalId: NodeJS.Timeout;
    
    // Stabilization State
    let detectionState: DetectionState = {
      lastDetections: [],
      missingFrames: 0,
    };

    const startDetection = () => {
      // Set dimensions
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      setIsReady(true);
      setStatus(''); // Clear status text on success

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

        // --- Logic Anti-Flicker ---
        let renderList = [];
        if (resizedDetections.length > 0) {
          renderList = resizedDetections;
          detectionState.lastDetections = resizedDetections;
          detectionState.missingFrames = 0;
        } else if (detectionState.missingFrames < MAX_MISSING_FRAMES && detectionState.lastDetections.length > 0) {
          renderList = detectionState.lastDetections;
          detectionState.missingFrames++;
        } else {
          renderList = [];
        }

        // Draw Logic
        renderList.forEach(detection => {
          const { descriptor } = detection;
          const box = detection.detection.box;
          const match = faceMatcher.findBestMatch(descriptor);
          const isPersonA = match.label === 'Person A';

          const overlayImg = isPersonA ? imgRefA.current : imgRefB.current;
          
          if (overlayImg) {
             const scaleWidth = 1.5;
             const drawWidth = box.width * scaleWidth;
             const ratio = overlayImg.naturalWidth / overlayImg.naturalHeight;
             
             if (ratio) {
               const drawHeight = drawWidth / ratio;
               const drawX = box.x + (box.width / 2) - (drawWidth / 2);
               // Offset calculation to sit on head/face
               const drawY = box.y - drawHeight + (box.height * 0.6); 

               ctx.drawImage(overlayImg, drawX, drawY, drawWidth, drawHeight);
             }
          }
        });

      }, 33); // ~30 FPS
    };

    video.addEventListener('play', startDetection);

    return () => {
      clearInterval(intervalId);
      video.removeEventListener('play', startDetection);
    };
  }, [isModelLoaded, faceMatcher]);

  // --- 5. Capture Function ---
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Create temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');

    if (ctx) {
      // Draw Video
      ctx.drawImage(video, 0, 0);
      // Draw Overlay
      ctx.drawImage(canvas, 0, 0);
      
      // Download
      const link = document.createElement('a');
      link.download = `magic-face-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    }
  }, []);

  return { videoRef, canvasRef, status, isReady, capturePhoto };
};