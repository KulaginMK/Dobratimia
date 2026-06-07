export async function playScreamReleaseSound() {
  const paths = ['/assets/sounds/scream/release.mp3', '/assets/sounds/scream/whoosh.mp3']

  for (const src of paths) {
    const played = await new Promise<boolean>((resolve) => {
      const audio = new Audio(src)
      audio.volume = 0.7
      const done = (ok: boolean) => resolve(ok)
      audio.oncanplaythrough = () => audio.play().then(() => done(true)).catch(() => done(false))
      audio.onerror = () => done(false)
      window.setTimeout(() => done(false), 400)
      audio.load()
    })
    if (played) return
  }

  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return

  const ctx = new Ctx()
  if (ctx.state === 'suspended') await ctx.resume()

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.6)
  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.95)
}
