import { Box3, Group, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three'

function getMeshBounds(object: Object3D): Box3 {
  object.updateMatrixWorld(true)
  const box = new Box3()
  const part = new Box3()
  let hasMesh = false

  object.traverse((child) => {
    if (child instanceof Mesh && child.visible) {
      part.setFromObject(child)
      if (!hasMesh) {
        box.copy(part)
        hasMesh = true
      } else {
        box.union(part)
      }
    }
  })

  return hasMesh ? box : new Box3().setFromObject(object)
}

function wrapScaled(object: Object3D, scaleFactor: number, alignBottom: boolean): Object3D {
  const bounds = getMeshBounds(object)
  const center = bounds.getCenter(new Vector3())

  object.position.sub(center)

  const wrapper = new Group()
  wrapper.add(object)
  wrapper.scale.setScalar(scaleFactor)

  if (alignBottom) {
    wrapper.updateMatrixWorld(true)
    const aligned = new Box3().setFromObject(wrapper)
    wrapper.position.y = -aligned.min.y
  }

  return wrapper
}

export function applyMeshNameFilter(object: Object3D, meshName?: string): void {
  if (!meshName) return

  const meshes: Mesh[] = []
  object.traverse((child) => {
    if (child instanceof Mesh) meshes.push(child)
  })

  const needle = meshName.toLowerCase()
  const matched = meshes.filter((mesh) => {
    const name = mesh.name.toLowerCase()
    return name === needle || name.includes(needle)
  })

  if (matched.length === 0) return

  for (const mesh of meshes) {
    mesh.visible = matched.includes(mesh)
  }
}

export function applyOrganMaterial(object: Object3D): void {
  object.traverse((child) => {
    if (child instanceof Mesh) {
      child.material = new MeshStandardMaterial({
        color: '#f87171',
        roughness: 0.55,
        metalness: 0.05,
      })
    }
  })
}

export function prepareOrganModel(
  object: Object3D,
  meshName: string | undefined,
  targetSize: number,
): Object3D {
  applyMeshNameFilter(object, meshName)
  applyOrganMaterial(object)

  const bounds = getMeshBounds(object)
  const size = bounds.getSize(new Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim <= 0) return object

  return wrapScaled(object, targetSize / maxDim, false)
}

export function prepareBodyModel(object: Object3D, targetHeight: number): Object3D {
  object.traverse((child) => {
    if (child instanceof Mesh) {
      child.material = new MeshStandardMaterial({
        color: '#93c5fd',
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        roughness: 0.85,
        metalness: 0.05,
      })
    }
  })

  const bounds = getMeshBounds(object)
  const size = bounds.getSize(new Vector3())
  if (size.y <= 0) return object

  return wrapScaled(object, targetHeight / size.y, true)
}
