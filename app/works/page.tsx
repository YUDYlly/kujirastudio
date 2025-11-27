import Link from "next/link";

export default function Works() {
    return (
        <main className="min-h-screen w-full bg-deepSea px-6 py-20 text-white md:px-20">
            <div className="mx-auto max-w-4xl">
                <div className="mb-12">
                    <Link href="/" className="text-sm tracking-widest text-white/60 hover:text-white">
                        ← BACK TO TOP
                    </Link>
                </div>

                <h1 className="mb-12 text-4xl font-light tracking-widest md:text-6xl">
                    WORKS
                </h1>

                <div className="space-y-12">
                    {/* Work Item 1 */}
                    <div className="group border-b border-white/10 pb-12">
                        <h2 className="mb-2 text-2xl font-light tracking-wider text-white group-hover:text-blue-300 transition-colors">
                            Deep Sea Explorer
                        </h2>
                        <p className="mb-4 text-sm text-white/50">Web Application / 3D</p>
                        <p className="text-white/70 font-light leading-relaxed">
                            深海探査をテーマにしたインタラクティブなWebサイト。
                            スクロールに合わせて深海へと潜っていく体験を実装。
                        </p>
                    </div>

                    {/* Work Item 2 */}
                    <div className="group border-b border-white/10 pb-12">
                        <h2 className="mb-2 text-2xl font-light tracking-wider text-white group-hover:text-blue-300 transition-colors">
                            Blue Horizon
                        </h2>
                        <p className="mb-4 text-sm text-white/50">Corporate Site</p>
                        <p className="text-white/70 font-light leading-relaxed">
                            海洋保護団体のコーポレートサイトリニューアル。
                            透明感のある配色と流体的なアニメーションで海の豊かさを表現。
                        </p>
                    </div>

                    {/* Work Item 3 */}
                    <div className="group border-b border-white/10 pb-12">
                        <h2 className="mb-2 text-2xl font-light tracking-wider text-white group-hover:text-blue-300 transition-colors">
                            Abyss Gallery
                        </h2>
                        <p className="mb-4 text-sm text-white/50">Digital Art Gallery</p>
                        <p className="text-white/70 font-light leading-relaxed">
                            デジタルアート作品を展示するバーチャルギャラリー。
                            静謐な空間で作品と向き合える没入型UI。
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
