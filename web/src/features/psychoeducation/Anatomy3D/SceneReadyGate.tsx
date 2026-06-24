import { useEffect } from 'react'

/** Вызывается только когда все Suspense-потомки (GLB) уже загружены. */
export function SceneReadyGate({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])

  return null
}
