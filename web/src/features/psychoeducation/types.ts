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
  anchor: [number, number, number]
  scaleRatio: number
  rotation?: [number, number, number]
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
