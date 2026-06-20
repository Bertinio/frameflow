export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen">

      {/* HERO */}
      <header className="py-32 max-w-5xl mx-auto px-6 text-center">
        <img
          src="/frameflow-logo.png"
          alt="FrameFlow logo"
          className="mx-auto mb-10 w-120 opacity-90"
        />

        <h1 className="text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Maak sneller offertes.
          <br />
          Verdien meer per dag.
        </h1>

        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
          FrameFlow geeft installateurs een realtime configurator waarmee je foutloos,
          sneller en professioneler offertes maakt — met je eigen marges.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition shadow-lg"
          >
            Login
          </a>

          <a
            href="/register"
            className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition"
          >
            Registreren
          </a>
        </div>
      </header>

      {/* HOW IT WORKS – INSTALLATEUR FOCUS */}
      <section className="py-32 bg-white/5 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">Hoe FrameFlow werkt</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

            <div className="p-8 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition">
              <h3 className="text-2xl font-semibold mb-2">1. Configureer ramen & deuren</h3>
              <p className="text-white/70">
                Kies het product, de afmetingen en opties. Alles wordt realtime gevalideerd zodat je geen fouten maakt.
              </p>
            </div>

            <div className="p-8 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition">
              <h3 className="text-2xl font-semibold mb-2">2. Jouw marges automatisch toegepast</h3>
              <p className="text-white/70">
                Je eigen marge, uurloon en klein materiaal worden automatisch verrekend in elke offerte.
              </p>
            </div>

            <div className="p-8 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition">
              <h3 className="text-2xl font-semibold mb-2">3. Offerte klaar in 30 seconden</h3>
              <p className="text-white/70">
                Je krijgt een professionele PDF‑offerte die je meteen naar je klant kunt sturen.
              </p>
            </div>

          </div>
        </div>
      </section>

{/* STORYTELLING – COMPACT */}
<section className="py-28 bg-black text-white border-t border-white/10">
  <div className="max-w-4xl mx-auto px-6 text-center">

    <h2 className="text-4xl font-bold mb-8">
      Van avonden administratie naar offertes in minuten
    </h2>

    <p className="text-white/70 text-lg leading-relaxed mb-6">
      Veel installateurs kennen het: overdag op de baan, ’s avonds nog offertes maken.
      Maten opzoeken, prijzen vergelijken, opties dubbelchecken — en hopen dat je geen fout maakt.
    </p>

    <p className="text-white/70 text-lg leading-relaxed mb-6">
      Met FrameFlow draait dat om. Je configureert, je marges worden automatisch toegepast,
      en je offerte is klaar in 30 seconden.
    </p>

    <p className="text-white/70 text-lg leading-relaxed">
      Minder avondwerk, minder stress en meer tijd voor andere professionele taken — of gewoon voor jezelf.
      FrameFlow geeft installateurs niet alleen snelheid, maar ook rust en controle.
    </p>

  </div>
</section>

      {/* WHY INSTALLERS LOVE FRAMEFLOW */}
<section className="py-32 max-w-6xl mx-auto px-6">
  <h2 className="text-4xl font-bold mb-16 text-center">Waarom installateurs FrameFlow kiezen</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

    <div className="p-8 bg-gray-900 rounded-2xl border border-white/10">
      <h3 className="text-2xl font-semibold mb-3">Enorme tijdswinst</h3>
      <p className="text-white/70">
        Offertes maak je in minuten in plaats van uren. Meer tijd voor andere professionele taken — én meer tijd voor jezelf.
      </p>
    </div>

    <div className="p-8 bg-gray-900 rounded-2xl border border-white/10">
      <h3 className="text-2xl font-semibold mb-3">Minder fouten</h3>
      <p className="text-white/70">
        Automatische validatie voorkomt verkeerde maten, verkeerde opties en dure fouten. Minder herwerk, minder stress.
      </p>
    </div>

    <div className="p-8 bg-gray-900 rounded-2xl border border-white/10">
      <h3 className="text-2xl font-semibold mb-3">Meer winst per dag</h3>
      <p className="text-white/70">
        Door marges, uurloon en klein materiaal automatisch te verrekenen, verdien je meer per werkdag.
      </p>
    </div>

  </div>
</section>


      {/* CTA */}
      <section className="py-32 text-center">
        <h2 className="text-4xl font-bold mb-6">Start vandaag nog met FrameFlow</h2>
        <p className="text-white/70 mb-10">Maak offertes sneller, foutloos en met je eigen marges.</p>

        <a
          href="/register"
          className="px-10 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition shadow-lg"
        >
          Registreren
        </a>
      </section>

      <footer className="py-10 text-center text-white/40 border-t border-white/10">
        © {new Date().getFullYear()} FrameFlow — Alle rechten voorbehouden
      </footer>
    </div>
  )
}
