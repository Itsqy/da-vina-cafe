"use client";
import { useEffect, useRef, useCallback, useState } from 'react';
import { useScroll, useSpring, useMotionValueEvent, useTransform } from 'framer-motion';

export default function ScrollWebPPlayer({
    sequencePath = '/avocado-salmon-frame/frame_',
    frameCount = 142,
    startIndex = 0,
    extension = 'webp',
    onProgress,
    containerRef // Add this prop
}) {
    const canvasRef = useRef(null);
    const imagesRef = useRef(new Array(frameCount).fill(null));
    const [isLoaded, setIsLoaded] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });
    const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 20, restDelta: 0.001 });
    const frameIndex = useTransform(smoothScroll, [0, 1], [0, frameCount - 1]);

    // Reset images when sequencePath changes
    useEffect(() => {
        imagesRef.current = new Array(frameCount).fill(null);
        setIsLoaded(false);
        if (onProgress) onProgress(0);
    }, [sequencePath, frameCount, startIndex, extension]); // eslint-disable-line react-hooks/exhaustive-deps

    const drawImage = useCallback((index) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let img = imagesRef.current[index];

        if (!img || !img.complete) {
            for (let i = 1; i < 50; i++) {
                if (index - i >= 0 && imagesRef.current[index - i] && imagesRef.current[index - i].complete) {
                    img = imagesRef.current[index - i];
                    break;
                }
                if (index + i < frameCount && imagesRef.current[index + i] && imagesRef.current[index + i].complete) {
                    img = imagesRef.current[index + i];
                    break;
                }
            }
        }

        if (!img || !img.complete) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const canvasWidth = canvas.width / dpr;
        const canvasHeight = canvas.height / dpr;

        const imgRatio = img.width / img.height;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        // Custom responsive logic: "Better Fit" for mobile
        const isMobileView = canvasWidth <= 768;

        if (isMobileView) {
            // On mobile, prioritize showing the full width of the dish 
            // even if it doesn't cover the full height (it will blend with background)
            drawWidth = canvasWidth * 1.1; // Slight overflow for edge blending
            drawHeight = drawWidth / imgRatio;
            offsetX = (canvasWidth - drawWidth) / 2;
            offsetY = (canvasHeight - drawHeight) / 2;
        } else {
            // Desktop: standard cover logic
            if (canvasRatio > imgRatio) {
                drawWidth = canvasWidth;
                drawHeight = canvasWidth / imgRatio;
                offsetX = 0;
                offsetY = (canvasHeight - drawHeight) / 2;
            } else {
                drawWidth = canvasHeight * imgRatio;
                drawHeight = canvasHeight;
                offsetX = (canvasWidth - drawWidth) / 2;
                offsetY = 0;
            }
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }, [frameCount]);

    useEffect(() => {
        let isMounted = true;
        let loadedCount = 0;
        let failedCount = 0;

        const updateProgress = () => {
            if (onProgress) {
                const totalProcessed = loadedCount + failedCount;
                onProgress(Math.floor((totalProcessed / frameCount) * 100));
            }
        };

        const loadImages = async () => {
            // Priority Strategy:
            const p1 = []; // Immediate: First 20 frames (Essential for initial view)
            for (let i = 0; i < Math.min(20, frameCount); i++) p1.push(i);

            const p2 = []; // High: Every 4th frame (Ensures smooth basic animation)
            for (let i = 0; i < frameCount; i += 4) if (!p1.includes(i)) p2.push(i);

            const p3 = []; // Normal: Every 2nd frame
            for (let i = 0; i < frameCount; i += 2) if (!p1.includes(i) && !p2.includes(i)) p3.push(i);

            const p4 = []; // Background: All others
            for (let i = 0; i < frameCount; i++) if (!p1.includes(i) && !p2.includes(i) && !p3.includes(i)) p4.push(i);

            const allIndices = [...p1, ...p2, ...p3, ...p4];

            const loadBatch = async (indices) => {
                const batchSize = 8; // Slightly increased for faster concurrent fetching
                for (let i = 0; i < indices.length; i += batchSize) {
                    if (!isMounted) return;
                    const batch = indices.slice(i, i + batchSize);

                    await Promise.all(batch.map(idx => new Promise(resolve => {
                        if (imagesRef.current[idx]) { resolve(); return; }

                        const img = new Image();
                        img.onload = () => {
                            if (!isMounted) return;
                            imagesRef.current[idx] = img;
                            loadedCount++;
                            updateProgress();

                            // Draw if near current scroll
                            const currentTarget = Math.floor(frameIndex.get());
                            if (Math.abs(currentTarget - idx) < 5) drawImage(currentTarget);
                            resolve();
                        };
                        img.onerror = () => {
                            if (!isMounted) return;
                            failedCount++;
                            updateProgress();
                            resolve();
                        };
                        // Use startIndex to offset the filename index
                        const fileIdx = idx + startIndex;
                        img.src = `${sequencePath}${String(fileIdx).padStart(3, '0')}.${extension}`;
                    })));

                    // Yield for main thread optimization
                    if (i % (batchSize * 2) === 0) await new Promise(r => setTimeout(r, 0));
                }
            };

            await loadBatch(allIndices);
        };

        loadImages();

        return () => { isMounted = false; };
    }, [sequencePath, frameCount, startIndex, extension, drawImage, frameIndex, onProgress]);

    const [isMobile, setIsMobile] = useState(false);

    // Handle Resize & Mobile Detection
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            if (canvas) {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                canvas.style.width = `${window.innerWidth}px`;
                canvas.style.height = `${window.innerHeight}px`;

                const ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr);

                drawImage(Math.floor(frameIndex.get()));
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [drawImage, frameIndex]);

    useMotionValueEvent(frameIndex, "change", (latest) => {
        const idx = Math.min(frameCount - 1, Math.max(0, Math.floor(latest)));
        window.requestAnimationFrame(() => drawImage(idx));
    });

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                zIndex: 0,
                transform: isMobile ? 'scale(1.05)' : 'scale(1.08)',
                transition: 'transform 0.5s ease'
            }}
        />
    );
}
