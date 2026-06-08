export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen">

      {/* HERO */}
      <header className="pt-40 pb-32 max-w-5xl mx-auto px-6 text-center">
        <img src="/frameflow-logo.png" alt="FrameFlow logo" className="mx-auto mb-8 w-56" />
        <h1 className="text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent drop-shadow-xl">
          Configureer ramen.  
          <br />
          Zie direct de prijs.
        </h1>

        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
          FrameFlow helpt ramenbedrijven sneller offertes maken met een realtime configurator.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/configurator"
            className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition shadow-lg hover:shadow-white/20"
          >
            Start configurator
          </a>

          <a
            href="/installers"
            className="px-8 py-4 border border-white/30 rounded-xl font-semibold hover:bg-white/10 transition"
          >
            Voor installateurs
          </a>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section className="py-28 bg-white/5 border-t border-white/10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">Hoe FrameFlow werkt</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">

            <div className="p-8 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition">
              <div className="text-5xl mb-4">🪟</div>
              <h3 className="text-2xl font-semibold mb-2">1. Kies je raamtype</h3>
              <p className="text-white/70">
                Klanten selecteren het juiste raam in een intuïtieve wizard.
              </p>
            </div>

            <div className="p-8 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition">
              <div className="text-5xl mb-4">📏</div>
              <h3 className="text-2xl font-semibold mb-2">2. Voer afmetingen in</h3>
              <p className="text-white/70">
                Breedte, hoogte en opties worden realtime gevalideerd.
              </p>
            </div>

            <div className="p-8 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition">
              <div className="text-5xl mb-4">📨</div>
              <h3 className="text-2xl font-semibold mb-2">3. Ontvang een offerte</h3>
              <p className="text-white/70">
                Jij krijgt alle details direct in je mailbox.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 text-center">
        <h2 className="text-4xl font-bold mb-6">Klaar om slimmer offertes te maken?</h2>
        <p className="text-white/70 mb-10">Start vandaag nog met FrameFlow.</p>

        <a
          href="/configurator"
          className="px-10 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition shadow-lg hover:shadow-white/20"
        >
          Start configurator
        </a>
      </section>

      <footer className="py-10 text-center text-white/40 border-t border-white/10">
        © {new Date().getFullYear()} FrameFlow — Alle rechten voorbehouden
      </footer>
    </div>
  )
}
