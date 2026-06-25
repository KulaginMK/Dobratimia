import { useEffect, useState } from 'react'
import { checkGlb } from '@/lib/anatomy/checkAsset'
import type { AnatomyModelsManifest, OrganModelState } from '../types'

export function useOrganModels(manifest: AnatomyModelsManifest | null, organIds: string[]) {
  const [bodyGlbAvailable, setBodyGlbAvailable] = useState(false)
  const [organModels, setOrganModels] = useState<OrganModelState[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!manifest) return

    let cancelled = false

    async function probe() {
      const bodyOk = await checkGlb(manifest!.body.url)
      const organs = await Promise.all(
        organIds.map(async (id) => {
          const cfg = manifest!.organs[id]
          if (!cfg) return null
          const glbAvailable = cfg.placeholderOnly ? false : await checkGlb(cfg.url)
          return { id, ...cfg, glbAvailable } satisfies OrganModelState
        }),
      )

      if (cancelled) return
      setBodyGlbAvailable(bodyOk)
      setOrganModels(organs.filter(Boolean) as OrganModelState[])
      setReady(true)
    }

    setReady(false)
    probe()

    return () => {
      cancelled = true
    }
  }, [manifest, organIds])

  return { bodyGlbAvailable, organModels, ready }
}
