import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh } from 'three'
import type { BodyModelConfig } from '../types'
import { prepareBodyModel } from './normalizeGltf'

const BODY_TARGET_HEIGHT = 1.75

function GltfBody({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    const prepared = prepareBodyModel(clone, BODY_TARGET_HEIGHT)
    prepared.traverse((child) => {
      if (child instanceof Mesh) {
        child.renderOrder = 0
      }
    })
    return prepared
  }, [scene])

  return <primitive object={model} />
}

function FallbackBody({
  fallback,
  opacity,
  scale,
}: {
  fallback: BodyModelConfig['fallback']
  opacity: number
  scale: [number, number, number]
}) {
  const height = (fallback === 'capsule' ? 2 : 1) * scale[1]
  return (
    <mesh position={[0, height / 2, 0]} scale={scale}>
      {fallback === 'capsule' ? (
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial
        color="#93c5fd"
        transparent
        opacity={opacity}
        depthWrite={false}
        roughness={0.8}
      />
    </mesh>
  )
}

export function BodyShell({
  config,
  glbAvailable,
}: {
  config: BodyModelConfig
  glbAvailable: boolean
}) {
  const scale = config.scale ?? [0.55, 1.05, 0.35]

  if (!glbAvailable) {
    return <FallbackBody fallback={config.fallback} opacity={config.opacity} scale={scale} />
  }

  return <GltfBody url={config.url} />
}
