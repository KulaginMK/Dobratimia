import type { OrganModelConfig } from '../types'

/** После нормализации body.glb (см. prepareBodyModel). */
export const BODY_HEIGHT = 1.75
export const BODY_HALF_WIDTH = 0.52
export const BODY_HALF_DEPTH = 0.18

export type OrganOverride = {
  anchor?: [number, number, number]
  scaleRatio?: number
}

/**
 * Якорь относительно тела (0–1, можно выходить за пределы для «внешних» органов):
 * x — 0 слева, 0.5 центр, 1 справа
 * y — 0 стопы, 1 макушка
 * z — 0 спина, 0.5 центр, 1 грудь
 */
export function anchorToPosition(anchor: [number, number, number]): [number, number, number] {
  const [ax, ay, az] = anchor
  return [
    (ax - 0.5) * 2 * BODY_HALF_WIDTH,
    ay * BODY_HEIGHT,
    (az - 0.5) * 2 * BODY_HALF_DEPTH,
  ]
}

export function resolveOrganLayout(
  config: OrganModelConfig,
  override?: OrganOverride,
): { position: [number, number, number]; scale: number; anchor: [number, number, number]; scaleRatio: number } {
  const anchor = override?.anchor ?? config.anchor
  const scaleRatio = override?.scaleRatio ?? config.scaleRatio
  return {
    anchor,
    scaleRatio,
    position: anchorToPosition(anchor),
    scale: scaleRatio * BODY_HEIGHT,
  }
}

export function formatOrganJson(id: string, anchor: [number, number, number], scaleRatio: number): string {
  const a = anchor.map((v) => +v.toFixed(3))
  return `"${id}": {\n  "anchor": [${a.join(', ')}],\n  "scaleRatio": ${scaleRatio.toFixed(3)}\n}`
}
