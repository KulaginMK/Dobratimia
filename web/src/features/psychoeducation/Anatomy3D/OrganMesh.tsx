import { useMemo } from 'react'
import type { FallbackShape } from '../types'
import { OrganOutlineGroup } from './OrganSelectionOutline'

const REST_COLOR = '#fca5a5'
const SELECTED_COLOR = '#34d399'
const EMISSIVE_REST = '#7f1d1d'
const EMISSIVE_SELECTED = '#065f46'

function PrimitiveGeometry({ shape }: { shape: FallbackShape }) {
  if (shape === 'box') return <boxGeometry args={[1, 1, 1]} />
  if (shape === 'capsule') return <capsuleGeometry args={[0.5, 0.8, 4, 12]} />
  return <sphereGeometry args={[0.5, 24, 24]} />
}

export function OrganMesh({
  organId,
  fallback,
  position,
  scale,
  rotation,
  selected,
  onSelect,
}: {
  organId: string
  fallback: FallbackShape
  position: [number, number, number]
  scale: number
  rotation?: [number, number, number]
  selected: boolean
  onSelect: (id: string) => void
}) {
  const color = selected ? SELECTED_COLOR : REST_COLOR
  const emissive = selected ? EMISSIVE_SELECTED : EMISSIVE_REST

  const meshScale = useMemo(() => {
    if (fallback === 'box') {
      return [scale * 1.2, scale * 0.8, scale * 0.6] as [number, number, number]
    }
    if (fallback === 'capsule') {
      return [scale, scale * 1.4, scale] as [number, number, number]
    }
    return [scale, scale, scale] as [number, number, number]
  }, [fallback, scale])

  return (
    <group
      rotation={rotation ?? [0, 0, 0]}
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelect(organId)
      }}
    >
      <mesh scale={meshScale} renderOrder={5}>
        <PrimitiveGeometry shape={fallback} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={selected ? 0.55 : 0.12}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      {selected && <OrganOutlineGroup shape={fallback} meshScale={meshScale} />}
    </group>
  )
}
