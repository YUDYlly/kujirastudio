"use client";

import LoaderKujira from "./components/LoaderKujira";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect, memo } from "react";

const SceneKujira = dynamic(() => import("./components/SceneKujira"), {
  ssr: false,
});

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate depth based on scroll progress (200m to 3000m)
  const [currentDepth, setCurrentDepth] = useState(200);

  useEffect(() => {
    let rafId: number;
    let lastUpdate = 0;
    const throttleDelay = 100; // Update depth every 100ms max
    
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const now = Date.now();
      
      // Throttle updates to reduce re-renders
      if (now - lastUpdate < throttleDelay) {
        return;
      }
      
      lastUpdate = now;
      
      // Use requestAnimationFrame to batch DOM updates
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const depth = 200 + (latest * 2800); // 200m to 3000m
        const roundedDepth = depth >= 2995 ? 3000 : Math.round(depth);
        
        // Only update if value actually changed
        setCurrentDepth(prev => prev !== roundedDepth ? roundedDepth : prev);
      });
    });

    return () => {
      unsubscribe();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [scrollYProgress]);

  // Calculate darkness based on scroll progress (smoother steps)
  const darknessOpacity = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.4, 0.6, 0.8, 1], 
    [0, 0.15, 0.35, 0.6, 0.85, 1]
  );

  return (
    <main
      ref={containerRef}
      className="relative w-full"
      style={{ backgroundColor: "#001A33" }}
    >
      {/* Loader */}
      <LoaderKujira />

      {/* 3D Background */}
      <div
        className="fixed inset-0 z-0"
        style={{ backgroundColor: "#001A33" }}
      >
        <SceneKujira />
      </div>

      {/* Darkness overlay - simulates loss of light in deep sea */}
      <motion.div
        className="fixed inset-0 z-5 pointer-events-none"
        style={{
          backgroundColor: `rgb(0, 0, 0)`,
          opacity: darknessOpacity,
          willChange: 'opacity'
        }}
      />
      
      {/* Noise overlay for dithering effect */}
      <motion.div
        className="fixed inset-0 z-5 pointer-events-none"
        style={{
          opacity: darknessOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Depth Indicator and Scale */}
      <motion.div 
        className="fixed top-8 right-8 z-50 text-right pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5 }}
      >
        <p className="text-xs font-light tracking-widest text-white/40 md:text-sm">
          DEPTH
        </p>
        <div className="text-2xl md:text-3xl font-light tracking-wider text-white/60">
          {currentDepth}
          <span className="text-lg text-white/40">m</span>
        </div>
      </motion.div>

      {/* Depth Scale on Right Side */}
      <motion.div
        className="fixed right-4 top-[15vh] md:right-8 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.5 }}
      >
        {/* Vertical Line */}
        <div className="relative h-[70vh] bg-white/20" style={{ width: '1px' }}>
          {/* Progress Indicator - linked to currentDepth */}
          <motion.div
            className="absolute rounded-full bg-white/80"
            style={{
              width: '8px',
              height: '8px',
              left: '50%',
              top: `${Math.max(0, Math.min(100, ((currentDepth - 200) / (3000 - 200)) * 100))}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 12px rgba(255, 255, 255, 0.5)'
            }}
          />
          
          {/* Depth Markers */}
          {[
            { depth: 200, label: '200' },
            { depth: 500, label: '500' },
            { depth: 1000, label: '1000' },
            { depth: 1500, label: '1500' },
            { depth: 2000, label: '2000' },
            { depth: 2500, label: '2500' },
            { depth: 3000, label: '3000' }
          ].map((marker, idx) => {
            const position = ((marker.depth - 200) / (3000 - 200)) * 100;
            const isMainMarker = marker.depth % 1000 === 0 || marker.depth === 200;
            
            return (
              <div
                key={idx}
                className="absolute flex items-center"
                style={{ 
                  top: `${position}%`,
                  right: '0',
                  transform: 'translateY(-50%)'
                }}
              >
                {/* Tick Mark - extends to the right */}
                <div 
                  style={{
                    width: isMainMarker ? '12px' : '6px',
                    height: '1px',
                    backgroundColor: isMainMarker ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'
                  }}
                />
                {/* Label - all markers show depth */}
                <span 
                  className="hidden md:inline"
                  style={{
                    fontSize: '10px',
                    fontWeight: '300',
                    letterSpacing: '0.05em',
                    color: isMainMarker ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)',
                    marginLeft: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {marker.label}m
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Bubbles effect - reduced count for performance */}
      <div className="fixed inset-0 z-5 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: `${Math.random() * 100}%`,
              bottom: -20,
              willChange: 'transform, opacity'
            }}
            animate={{
              y: [-20, -window.innerHeight - 100],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0, 0.3, 0.6, 0.3, 0],
              scale: [0.5, 1, 1.2, 0.8, 0.5]
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Section 1: Hero */}
      <Section1 />

      {/* Section 2: About */}
      <Section2 scrollYProgress={scrollYProgress} />

      {/* Section 3: Services */}
      <Section3 scrollYProgress={scrollYProgress} />

      {/* Section 4: Works */}
      <Section4 scrollYProgress={scrollYProgress} />

      {/* Section 5: Contact */}
      <Section5 scrollYProgress={scrollYProgress} />
    </main>
  );
}

// Section 1: Hero
const Section1 = memo(function Section1() {
  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 md:px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 4.5 }}
        className="space-y-6"
      >
        <h1 className="text-5xl font-light tracking-[0.2em] text-white md:text-7xl lg:text-8xl">
          KUJIRA studio.
        </h1>
        <p className="text-lg font-light tracking-widest text-white/70 md:text-xl">
          ゆらぎ続ける今に、確かな創造を。
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 5.5 }}
          className="mt-16"
        >
          <p className="text-sm tracking-widest text-white/50">SCROLL DOWN</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mt-4"
          >
            <svg className="w-6 h-6 mx-auto text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
});

type ScrollSectionProps = {
  scrollYProgress: MotionValue<number>;
};

// Section 2: About
const Section2 = memo(function Section2({ scrollYProgress }: ScrollSectionProps) {
  const opacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], [100, 0, 0, -100]);

  return (
    <motion.section
      style={{ opacity, y }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 md:px-4 text-center"
    >
      <div className="max-w-4xl space-y-8">
        <h2 className="text-4xl font-light tracking-[0.2em] text-white md:text-6xl">
          ABOUT
        </h2>
        <div className="space-y-6 text-lg font-light leading-relaxed tracking-wide text-white/80">
          <p>
            KUJIRA studio は、深海のような静寂と、
          </p>
          <p>
            その奥にある未知の可能性を探求するクリエイティブスタジオです。
          </p>
          <p>
            私たちは、目に見える派手さよりも、心に沈殿するような「深さ」を大切にしています。
          </p>
          <p>
            静謐なデザイン、没入感のあるインタラクション、そして物語を感じさせる世界観。
          </p>
          <p>
            デジタルの海を泳ぐクジラのように、雄大で、かつ繊細な体験を創造します。
          </p>
        </div>
        <Link href="/about" className="inline-block mt-8 text-sm tracking-widest text-white/60 hover:text-white transition-colors border-b border-white/30 pb-1">
          READ MORE →
        </Link>
      </div>
    </motion.section>
  );
});

// Section 3: Services
const Section3 = memo(function Section3({ scrollYProgress }: ScrollSectionProps) {
  const opacity = useTransform(scrollYProgress, [0.35, 0.45, 0.55, 0.65], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.35, 0.45, 0.55, 0.65], [100, 0, 0, -100]);

  return (
    <motion.section
      style={{ opacity, y }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 md:px-4"
    >
      <div className="max-w-5xl w-full">
        <h2 className="text-4xl font-light tracking-[0.2em] text-white md:text-6xl text-center mb-16">
          SERVICES
        </h2>
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-light tracking-wider text-white">Web Design & Development</h3>
            <p className="text-white/70 font-light leading-relaxed">
              Next.js や React を用いたモダンなWebサイト構築。
              ブランドの世界観を体現する、没入感のあるWeb体験を提供します。
            </p>
          </div>

          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-light tracking-wider text-white">3D Experience</h3>
            <p className="text-white/70 font-light leading-relaxed">
              React Three Fiber を活用した WebGL 実装。
              ブラウザ上で動作する軽量かつ印象的な3D表現を実現します。
            </p>
          </div>

          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-light tracking-wider text-white">UI/UX Design</h3>
            <p className="text-white/70 font-light leading-relaxed">
              ユーザーの心を動かすインターフェースデザイン。
              美しさと使いやすさを両立させた、洗練されたUIを設計します。
            </p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Link href="/services" className="inline-block text-sm tracking-widest text-white/60 hover:text-white transition-colors border-b border-white/30 pb-1">
            VIEW ALL SERVICES →
          </Link>
        </div>
      </div>
    </motion.section>
  );
});

// Section 4: Works
const Section4 = memo(function Section4({ scrollYProgress }: ScrollSectionProps) {
  const opacity = useTransform(scrollYProgress, [0.6, 0.7, 0.8, 0.9], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.6, 0.7, 0.8, 0.9], [100, 0, 0, -100]);

  return (
    <motion.section
      style={{ opacity, y }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 md:px-4"
    >
      <div className="max-w-4xl w-full">
        <h2 className="text-4xl font-light tracking-[0.2em] text-white md:text-6xl text-center mb-16">
          WORKS
        </h2>
        <div className="space-y-12">
          <div className="group border-b border-white/10 pb-8">
            <h3 className="mb-2 text-2xl font-light tracking-wider text-white group-hover:text-blue-300 transition-colors">
              Deep Sea Explorer
            </h3>
            <p className="mb-4 text-sm text-white/50">Web Application / 3D</p>
            <p className="text-white/70 font-light leading-relaxed">
              深海探査をテーマにしたインタラクティブなWebサイト。
              スクロールに合わせて深海へと潜っていく体験を実装。
            </p>
          </div>

          <div className="group border-b border-white/10 pb-8">
            <h3 className="mb-2 text-2xl font-light tracking-wider text-white group-hover:text-blue-300 transition-colors">
              Blue Horizon
            </h3>
            <p className="mb-4 text-sm text-white/50">Corporate Site</p>
            <p className="text-white/70 font-light leading-relaxed">
              海洋保護団体のコーポレートサイトリニューアル。
              透明感のある配色と流体的なアニメーションで海の豊かさを表現。
            </p>
          </div>

          <div className="group border-b border-white/10 pb-8">
            <h3 className="mb-2 text-2xl font-light tracking-wider text-white group-hover:text-blue-300 transition-colors">
              Abyss Gallery
            </h3>
            <p className="mb-4 text-sm text-white/50">Digital Art Gallery</p>
            <p className="text-white/70 font-light leading-relaxed">
              デジタルアート作品を展示するバーチャルギャラリー。
              静謐な空間で作品と向き合える没入型UI。
            </p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Link href="/works" className="inline-block text-sm tracking-widest text-white/60 hover:text-white transition-colors border-b border-white/30 pb-1">
            VIEW ALL WORKS →
          </Link>
        </div>
      </div>
    </motion.section>
  );
});

// Section 5: Contact
const Section5 = memo(function Section5({ scrollYProgress }: ScrollSectionProps) {
  const opacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const y = useTransform(scrollYProgress, [0.85, 0.95], [100, 0]);

  return (
    <motion.section
      style={{ opacity, y }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 md:px-4 text-center"
    >
      <div className="max-w-3xl space-y-8">
        <h2 className="text-4xl font-light tracking-[0.2em] text-white md:text-6xl">
          CONTACT
        </h2>
        <p className="text-lg font-light leading-relaxed tracking-wide text-white/80">
          制作のご依頼、ご相談は以下のメールアドレスまでお問い合わせください。
        </p>

        <div className="mt-12">
          <a href="mailto:hello@kujirastudio.com" className="text-2xl md:text-4xl hover:text-blue-300 transition-colors border-b border-white/30 pb-2">
            hello@kujirastudio.com
          </a>
        </div>

        <p className="mt-12 text-sm text-white/50">
          ※ 現在、多くのお問い合わせをいただいており、返信までにお時間をいただく場合がございます。
        </p>
      </div>
    </motion.section>
  );
});
