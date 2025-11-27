import Link from "next/link";

export default function Contact() {
    return (
        <main className="min-h-screen w-full bg-deepSea px-6 py-20 text-white md:px-20">
            <div className="mx-auto max-w-4xl">
                <div className="mb-12">
                    <Link href="/" className="text-sm tracking-widest text-white/60 hover:text-white">
                        ← BACK TO TOP
                    </Link>
                </div>

                <h1 className="mb-12 text-4xl font-light tracking-widest md:text-6xl">
                    CONTACT
                </h1>

                <div className="space-y-8 text-lg font-light leading-relaxed tracking-wide text-white/80">
                    <p>
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
            </div>
        </main>
    );
}
