import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh } from 'three'
import type { FallbackShape } from '../types'
import { prepareOrganModel } from './normalizeGltf'
import { GlbOutlineLayer } from './OrganSelectionOutline'
import { OrganMesh } from './OrganMesh'

function GltfOrgan({
  url,
  meshName,
  organId,
  position,
  scale,
  selected,
  onSelect,
}: {
  url: string
  meshName?: string
  organId: string
  position: [number, number, number]
  scale: number
  selected: boolean
  onSelect: (id: string) => void
}) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    const prepared = prepareOrganModel(clone, meshName, scale)
    prepared.traverse((child) => {
      if (child instanceof Mesh) {
        child.renderOrder = 5
      }
    })
    return prepared
  }, [scene, meshName, scale])

  return (
    <group
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelect(organId)
      }}
    >
      <primitive object={model} />
      {selected && <GlbOutlineLayer source={model} />}
    </group>
  )
}

export function OrganMeshLoader({
  organId,
  url,
  meshName,
  fallback,
  position,
  scale,
  rotation,
  glbAvailable,
  selected,
  onSelect,
}: {
  organId: string
  url: string
  meshName?: string
  fallback: FallbackShape
  position: [number, number, number]
  scale: number
  rotation?: [number, number, number]
  glbAvailable: boolean
  selected: boolean
  onSelect: (id: string) => void
}) {
  if (!glbAvailable) {
    return (
      <OrganMesh
        organId={organId}
        fallback={fallback}
        position={position}
        scale={scale}
        rotation={rotation}
        selected={selected}
        onSelect={onSelect}
      />
    )
  }

  return (
    <GltfOrgan
      url={url}
      meshName={meshName}
      organId={organId}
      position={position}
      scale={scale}
      selected={selected}
      onSelect={onSelect}
    />
  )
}
