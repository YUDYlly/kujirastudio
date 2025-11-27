import Link from "next/link";

export default function About() {
    return (
        <main className="min-h-screen w-full bg-deepSea px-6 py-20 text-white md:px-20">
            <div className="mx-auto max-w-4xl">
                <div className="mb-12">
                    <Link href="/" className="text-sm tracking-widest text-white/60 hover:text-white">
                        ← BACK TO TOP
                    </Link>
                </div>

                <h1 className="mb-12 text-4xl font-light tracking-widest md:text-6xl">
                    ABOUT
                </h1>

                <div className="space-y-8 text-lg font-light leading-relaxed tracking-wide text-white/80">
                    <p>
                        KUJIRA studio は、深海のような静寂と、その奥にある未知の可能性を探求するクリエイティブスタジオです。
                    </p>
                    <p>
                        私たちは、目に見える派手さよりも、心に沈殿するような「深さ」を大切にしています。
                        静謐なデザイン、没入感のあるインタラクション、そして物語を感じさせる世界観。
                    </p>
                    <p>
                        デジタルの海を泳ぐクジラのように、雄大で、かつ繊細な体験を創造します。
                    </p>
                </div>
            </div>
        </main>
    );
}
