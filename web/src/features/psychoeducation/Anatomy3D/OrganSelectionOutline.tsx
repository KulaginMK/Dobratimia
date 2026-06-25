import { useMemo } from 'react'
import { BackSide, Mesh, MeshBasicMaterial, Object3D } from 'three'
import type { FallbackShape } from '../types'

export const OUTLINE_COLOR = '#10b981'
export const OUTLINE_SCALE = 1.14

const outlineMaterial = new MeshBasicMaterial({
  color: OUTLINE_COLOR,
  side: BackSide,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
})

export function createOutlineShell(source: Object3D): Object3D {
  const clone = source.clone(true)
  clone.traverse((child) => {
    if (child instanceof Mesh && child.visible) {
      child.material = outlineMaterial
      child.renderOrder = 10
    }
  })
  return clone
}

function PrimitiveGeometry({ shape }: { shape: FallbackShape }) {
  if (shape === 'box') return <boxGeometry args={[1, 1, 1]} />
  if (shape === 'capsule') return <capsuleGeometry args={[0.5, 0.8, 4, 12]} />
  return <sphereGeometry args={[0.5, 24, 24]} />
}

export function OrganOutlineGroup({
  shape,
  meshScale,
}: {
  shape: FallbackShape
  meshScale: [number, number, number]
}) {
  return (
    <group scale={OUTLINE_SCALE} raycast={() => null}>
      <mesh scale={meshScale} renderOrder={10}>
        <PrimitiveGeometry shape={shape} />
        <meshBasicMaterial
          color={OUTLINE_COLOR}
          side={BackSide}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export function GlbOutlineLayer({ source }: { source: Object3D }) {
  const shell = useMemo(() => createOutlineShell(source), [source])

  return (
    <group scale={OUTLINE_SCALE} raycast={() => null}>
      <primitive object={shell} />
    </group>
  )
}
