"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [bubbles, setBubbles] = useState<{id: number, size: number, x: number, delay: number, duration: number}[]>([]);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    
    // Generate random bubble positions and sizes only on client side
    setBubbles(Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 300 + 150, // 150-450px
      x: Math.random() * 100, // 0-100%
      delay: Math.random() * 0.3, // 0-0.3s delay
      duration: 1 + Math.random() * 0.5 // 1-1.5s duration
    })));
  }, []);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 1500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            key="page-transition"
            className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {/* Bubbles */}
            {bubbles.map((bubble) => (
              <motion.div
                key={bubble.id}
                className="absolute rounded-full"
                style={{
                  width: bubble.size,
                  height: bubble.size,
                  left: `${bubble.x}%`,
                  bottom: -bubble.size,
                  background: `radial-gradient(circle at 30% 30%, 
                    rgba(77, 168, 218, 0.3), 
                    rgba(42, 117, 168, 0.2), 
                    rgba(26, 92, 140, 0.1))`,
                  backdropFilter: 'blur(2px)',
                  boxShadow: `
                    inset -20px -20px 40px rgba(255, 255, 255, 0.1),
                    inset 20px 20px 40px rgba(0, 0, 0, 0.1),
                    0 0 30px rgba(77, 168, 218, 0.2)
                  `
                }}
                initial={{ 
                  y: 0,
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  y: windowHeight > 0 ? -(windowHeight + bubble.size + 200) : -1000,
                  scale: [0, 1, 1, 0.8],
                  opacity: [0, 0.8, 0.8, 0]
                }}
                transition={{
                  duration: bubble.duration,
                  delay: bubble.delay,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* Dark overlay */}
            <motion.div
              className="absolute inset-0 bg-deepSea"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </>
  );
}

