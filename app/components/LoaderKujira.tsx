"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoaderKujira() {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [depth, setDepth] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const duration = 3000; // 3 seconds
        const interval = 30; // Update every 30ms
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min((currentStep / steps) * 100, 100);
            setProgress(newProgress);
            setDepth(newProgress); // Depth increases with progress

            if (currentStep >= steps) {
                clearInterval(timer);
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <>
                    {/* Blurred background layer */}
                    <motion.div
                        className="fixed inset-0 z-50 overflow-hidden"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `linear-gradient(to bottom, 
                                    #4da8da ${Math.max(-30, 100 - depth * 1.3)}%, 
                                    #3a8fc4 ${Math.max(-20, 100 - depth * 1.2)}%, 
                                    #2a75a8 ${Math.max(-10, 100 - depth * 1.1)}%, 
                                    #1e6b9f ${Math.max(0, 100 - depth * 1.0)}%, 
                                    #1a5c8c ${Math.max(10, 100 - depth * 0.9)}%, 
                                    #154d79 ${Math.max(20, 100 - depth * 0.8)}%, 
                                    #0f4066 ${Math.max(30, 100 - depth * 0.7)}%, 
                                    #0a3d5c ${Math.max(40, 100 - depth * 0.6)}%, 
                                    #073354 ${Math.max(50, 100 - depth * 0.5)}%, 
                                    #05294b ${Math.max(60, 100 - depth * 0.4)}%, 
                                    #031f42 ${Math.max(70, 100 - depth * 0.3)}%, 
                                    #021939 ${Math.max(80, 100 - depth * 0.2)}%, 
                                    #001A33 ${Math.max(90, 100 - depth * 0.1)}%, 
                                    #001A33 100%)`,
                                backgroundColor: '#001A33',
                                filter: 'blur(60px)',
                                transform: 'scale(1.1)',
                                willChange: 'transform'
                            }}
                        />
                    </motion.div>

                    {/* Content layer - sharp and clear */}
                    <motion.div
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                    {/* Darkening overlay as we dive deeper */}
                    <motion.div
                        className="absolute inset-0 bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: Math.min(depth / 100 * 0.5, 0.5) }}
                        transition={{ duration: 0.1 }}
                    />

                    {/* Surface waves effect */}
                    <motion.div
                        className="absolute inset-0 opacity-30"
                        initial={{ y: 0 }}
                        animate={{ y: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                        style={{
                            background: `repeating-linear-gradient(
                                0deg,
                                transparent,
                                transparent 50px,
                                rgba(255, 255, 255, 0.03) 50px,
                                rgba(255, 255, 255, 0.03) 51px
                            )`
                        }}
                    />

                    {/* Diving text */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8 text-center"
                    >
                        <p className="text-sm font-light tracking-widest text-white/60 md:text-base">
                            DIVING INTO THE DEEP
                        </p>
                    </motion.div>

                    {/* Progress percentage */}
                    <motion.div
                        className="relative mb-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h1 className="text-7xl font-light tracking-wider text-white md:text-9xl">
                            {Math.floor(progress)}
                            <span className="text-5xl text-white/60 md:text-7xl">%</span>
                        </h1>
                    </motion.div>

                    {/* Depth indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-center"
                    >
                        <p className="text-xs font-light tracking-widest text-white/40 md:text-sm">
                            DEPTH: {Math.floor(depth * 2)}m
                        </p>
                    </motion.div>

                    {/* Bubbles effect */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute h-2 w-2 rounded-full bg-white/20"
                                style={{
                                    left: `${15 + i * 10}%`,
                                    bottom: -10
                                }}
                                animate={{
                                    y: [-10, -window.innerHeight - 20],
                                    opacity: [0, 0.6, 0],
                                    scale: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 2 + i * 0.3,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeOut"
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
