import { useMemo } from 'react'
import { OrbitControls } from '@react-three/drei'
import type { OrganModelState, AnatomyModelsManifest } from '../types'
import { resolveOrganLayout } from './organLayout'
import { BodyShell } from './BodyShell'
import { OrganMeshLoader } from './OrganMeshLoader'

export function AnatomyScene({
  manifest,
  bodyGlbAvailable,
  organModels,
  selectedId,
  onSelect,
}: {
  manifest: AnatomyModelsManifest
  bodyGlbAvailable: boolean
  organModels: OrganModelState[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const placed = useMemo(
    () =>
      organModels.map((om) => ({
        ...om,
        ...resolveOrganLayout(om),
      })),
    [organModels],
  )

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <directionalLight position={[-2, 2, -3]} intensity={0.4} />

      <BodyShell config={manifest.body} glbAvailable={bodyGlbAvailable} />

      {placed.map((om) => (
        <OrganMeshLoader
          key={om.id}
          organId={om.id}
          url={om.url}
          meshName={om.meshName}
          fallback={om.fallback}
          position={om.position}
          scale={om.scale}
          rotation={om.rotation}
          glbAvailable={om.glbAvailable}
          selected={selectedId === om.id}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={5}
        target={[0, 0.875, 0]}
        makeDefault
      />
    </>
  )
}
