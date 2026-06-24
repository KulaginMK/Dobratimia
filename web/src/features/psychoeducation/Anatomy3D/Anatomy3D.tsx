import { Suspense, useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { AnatomyModelsManifest } from '../types'
import type { OrganOverride } from './organLayout'
import { AnatomyScene } from './AnatomyScene'
import { SceneReadyGate } from './SceneReadyGate'
import { useOrganModels } from './useOrganModels'

function LoadingBox() {
  return (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl bg-slate-200 text-muted">
      Загрузка 3D…
    </div>
  )
}

export default function Anatomy3D({
  manifest,
  organIds,
  selectedId,
  onSelect,
  overrides,
}: {
  manifest: AnatomyModelsManifest
  organIds: string[]
  selectedId: string | null
  onSelect: (id: string) => void
  overrides: Record<string, OrganOverride>
}) {
  const { bodyGlbAvailable, organModels, ready } = useOrganModels(manifest, organIds)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    setSceneReady(false)
  }, [manifest, organIds.join(',')])

  const handleSceneReady = useCallback(() => {
    setSceneReady(true)
  }, [])

  if (!ready) {
    return <LoadingBox />
  }

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-300">
      {!sceneReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-200 text-muted">
          Загрузка 3D…
        </div>
      )}
      <div
        className={`h-full w-full transition-opacity duration-300 ${
          sceneReady ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Canvas
          style={{ width: '100%', height: '100%', display: 'block' }}
          camera={{ position: [0, 0.9, 2.6], fov: 45, near: 0.01, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#cbd5e1')
          }}
        >
          <Suspense fallback={null}>
            <SceneReadyGate onReady={handleSceneReady} />
            <AnatomyScene
              manifest={manifest}
              bodyGlbAvailable={bodyGlbAvailable}
              organModels={organModels}
              selectedId={selectedId}
              onSelect={onSelect}
              overrides={overrides}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export { LoadingBox as Anatomy3DFallback }
