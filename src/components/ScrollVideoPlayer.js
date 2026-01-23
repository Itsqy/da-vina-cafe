"use client";
import { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';

export default function ScrollVideoPlayer({
    videoPath = '/hero-video-4k.mp4', // Default to a video file
    containerRef
}) {
    const videoRef = useRef(null);
    const [duration, setDuration] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Track scroll progress of the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Smooth out the scroll value for less "jittery" video scrubbing
    const smoothScroll = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 30,
        restDelta: 0.001
    });

    // Handle Mobile/Resize logic
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Set video duration when metadata loads
    const onLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    // Sync video time with smooth scroll progress
    useMotionValueEvent(smoothScroll, "change", (latest) => {
        if (videoRef.current && duration > 0) {
            // Calculate target time (clamp between 0 and duration)
            const targetTime = Math.max(0, Math.min(latest * duration, duration));

            // Optimization: check if time difference is significant enough to update
            // (Setting currentTime is expensive in some browsers)
            if (Math.abs(videoRef.current.currentTime - targetTime) > 0.05) {
                videoRef.current.currentTime = targetTime;
            }
        }
    });

    return (
        <div
            style={{
                position: 'absolute', // Changed to absolute to respect parent container
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none', // Allow clicks to pass through
            }}
        >
            <video
                ref={videoRef}
                src={videoPath}
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={onLoadedMetadata}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: isMobile ? 'scale(1.2)' : 'scale(1.0)', // Slight zoom for mobile if needed
                    transition: 'transform 0.5s ease'
                }}
            />

            {/* Optional Overlay to dim video if needed for text readability */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)'
            }} />
        </div>
    );
}
