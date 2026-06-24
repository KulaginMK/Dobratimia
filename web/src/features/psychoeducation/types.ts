export type Organ = {
  id: string
  name: string
  emoji: string
  during: string
  coping: string
}

export type FallbackShape = 'sphere' | 'box' | 'capsule'

export type OrganModelConfig = {
  url: string
  meshName?: string
  fallback: FallbackShape
  /** Позиция относительно тела: x/y/z от 0 до 1 (x может быть <0 или >1 сбоку) */
  anchor: [number, number, number]
  /** Размер органа как доля роста тела (~1.75 м) */
  scaleRatio: number
  rotation?: [number, number, number]
  /** Всегда сфера/примитив сбоку, без GLB */
  placeholderOnly?: boolean
}

export type BodyModelConfig = {
  url: string
  fallback: 'capsule' | 'box'
  opacity: number
  position?: [number, number, number]
  scale?: [number, number, number]
}

export type AnatomyModelsManifest = {
  body: BodyModelConfig
  organs: Record<string, OrganModelConfig>
}

export type OrganModelState = OrganModelConfig & {
  id: string
  glbAvailable: boolean
}
