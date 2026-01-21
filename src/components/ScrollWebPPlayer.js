"use client";
import { useEffect, useRef, useCallback, useState } from 'react';
import { useScroll, useSpring, useMotionValueEvent, useTransform } from 'framer-motion';

export default function ScrollWebPPlayer({
    sequencePath = '/avocado-salmon-frame/frame_',
    frameCount = 192,
    onProgress
}) {
    const canvasRef = useRef(null);
    const imagesRef = useRef(new Array(frameCount).fill(null));
    const [isLoaded, setIsLoaded] = useState(false);

    const { scrollYProgress } = useScroll();
    const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 20, restDelta: 0.001 });
    const frameIndex = useTransform(smoothScroll, [0, 1], [0, frameCount - 1]);

    // Reset images when sequencePath changes
    useEffect(() => {
        imagesRef.current = new Array(frameCount).fill(null);
        setIsLoaded(false);
        if (onProgress) onProgress(0);
    }, [sequencePath, frameCount]); // eslint-disable-line react-hooks/exhaustive-deps

    const drawImage = useCallback((index) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Fallback logic: Find closest loaded image
        let img = imagesRef.current[index];

        // Exact match not found? Search outwards
        if (!img || !img.complete) {
            // Check radius 1, then 2, etc. (more efficient than full loops)
            for (let i = 1; i < 50; i++) {
                // Check previous
                if (index - i >= 0 && imagesRef.current[index - i] && imagesRef.current[index - i].complete) {
                    img = imagesRef.current[index - i];
                    break;
                }
                // Check next
                if (index + i < frameCount && imagesRef.current[index + i] && imagesRef.current[index + i].complete) {
                    img = imagesRef.current[index + i];
                    break;
                }
            }
        }

        if (!img || !img.complete) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Ensure accurate canvas sizing
        const canvasWidth = canvas.width / dpr;
        const canvasHeight = canvas.height / dpr;

        const imgRatio = img.width / img.height;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

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

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }, [frameCount]);

    useEffect(() => {
        let isMounted = true;

        const loadImages = async () => {
            // Optimized Priority Strategy:
            // 1. First 5 frames (immediate start)
            // 2. Every 4th frame (coverage)
            // 3. Every 2nd frame (detail)
            // 4. All remaining frames

            const p1 = [];
            for (let i = 0; i < Math.min(10, frameCount); i++) p1.push(i);

            const p2 = [];
            for (let i = 0; i < frameCount; i += 4) if (!p1.includes(i)) p2.push(i);

            const p3 = [];
            for (let i = 0; i < frameCount; i += 2) if (!p1.includes(i) && !p2.includes(i)) p3.push(i);

            const p4 = [];
            for (let i = 0; i < frameCount; i++) if (!p1.includes(i) && !p2.includes(i) && !p3.includes(i)) p4.push(i);

            const allIndices = [...p1, ...p2, ...p3, ...p4];
            let loadedCount = 0;

            const loadBatch = async (indices) => {
                const batchSize = 8; // Smaller concurrent requests to prevent choking
                for (let i = 0; i < indices.length; i += batchSize) {
                    if (!isMounted) return;
                    const batch = indices.slice(i, i + batchSize);

                    await Promise.all(batch.map(idx => new Promise(resolve => {
                        if (imagesRef.current[idx]) { resolve(); return; }

                        const img = new Image();
                        img.src = `${sequencePath}${String(idx).padStart(3, '0')}.webp`;
                        img.onload = () => {
                            if (!isMounted) return;
                            imagesRef.current[idx] = img;
                            loadedCount++;

                            // Report progress
                            if (onProgress) {
                                onProgress(Math.floor((loadedCount / frameCount) * 100));
                            }

                            // Redraw if this frame is near current scroll position? 
                            // Simplified: Just draw current targeted frame
                            if (isMounted) drawImage(Math.floor(frameIndex.get()));
                            resolve();
                        };
                        img.onerror = resolve;
                    })));

                    await new Promise(r => setTimeout(r, 5)); // Minimal yield
                }
            };

            await loadBatch(allIndices);
        };

        loadImages();

        return () => { isMounted = false; };
    }, [sequencePath, frameCount, drawImage, frameIndex, onProgress]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
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
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
}
