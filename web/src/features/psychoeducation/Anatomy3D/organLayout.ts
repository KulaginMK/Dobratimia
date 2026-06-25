import type { OrganModelConfig } from '../types'

export const BODY_HEIGHT = 1.75
export const BODY_HALF_WIDTH = 0.52
export const BODY_HALF_DEPTH = 0.18

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
): { position: [number, number, number]; scale: number; anchor: [number, number, number]; scaleRatio: number } {
  const anchor = config.anchor
  const scaleRatio = config.scaleRatio
  return {
    anchor,
    scaleRatio,
    position: anchorToPosition(anchor),
    scale: scaleRatio * BODY_HEIGHT,
  }
}
