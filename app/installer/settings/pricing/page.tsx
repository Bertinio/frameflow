import { getInstallerSettings, updateInstallerSettings } from "@/app/installer/rolluiken/actions";

export default async function InstallerPricingSettingsPage() {
  const settings = await getInstallerSettings();

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Instellingen</p>
          <h1 className="mt-3 text-4xl font-semibold">Pricing instellingen</h1>
          <p className="mt-2 text-slate-400">
            Stel marge, uurloon, klein materiaal en standaard uren in voor rolluikoffertes.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
          <form action={updateInstallerSettings} className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Marge (%)</span>
                <input
                  name="marginPercent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  defaultValue={settings.marginPercent}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Uurloon (EUR)</span>
                <input
                  name="hourlyRate"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={settings.hourlyRate}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Klein materiaal (EUR)</span>
                <input
                  name="smallMaterialCost"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={settings.smallMaterialCost}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Standaard uren</span>
                <input
                  name="defaultLaborHours"
                  type="number"
                  min={0}
                  step="0.25"
                  defaultValue={settings.defaultLaborHours}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-fit rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black transition hover:bg-sky-400"
            >
              Opslaan
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
