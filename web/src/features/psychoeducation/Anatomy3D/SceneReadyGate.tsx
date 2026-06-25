import { useEffect } from 'react'

export function SceneReadyGate({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])

  return null
}
