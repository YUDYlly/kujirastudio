import Link from "next/link";

export default function Services() {
    return (
        <main className="min-h-screen w-full bg-deepSea px-6 py-20 text-white md:px-20">
            <div className="mx-auto max-w-4xl">
                <div className="mb-12">
                    <Link href="/" className="text-sm tracking-widest text-white/60 hover:text-white">
                        ← BACK TO TOP
                    </Link>
                </div>

                <h1 className="mb-12 text-4xl font-light tracking-widest md:text-6xl">
                    SERVICES
                </h1>

                <div className="grid gap-12 md:grid-cols-2">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-light tracking-wider text-white">Web Design & Development</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            Next.js や React を用いたモダンなWebサイト構築。
                            ブランドの世界観を体現する、没入感のあるWeb体験を提供します。
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-light tracking-wider text-white">3D Experience</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            React Three Fiber を活用した WebGL 実装。
                            ブラウザ上で動作する軽量かつ印象的な3D表現を実現します。
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-light tracking-wider text-white">UI/UX Design</h2>
                        <p className="text-white/70 font-light leading-relaxed">
                            ユーザーの心を動かすインターフェースデザイン。
                            美しさと使いやすさを両立させた、洗練されたUIを設計します。
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
