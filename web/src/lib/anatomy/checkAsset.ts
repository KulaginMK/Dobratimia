async function hasGltfMagic(url: string): Promise<boolean> {
  const res = await fetch(url, { headers: { Range: 'bytes=0-3' } })
  if (!res.ok) return false
  const buf = await res.arrayBuffer()
  if (buf.byteLength < 4) return false
  return new TextDecoder().decode(new Uint8Array(buf)) === 'glTF'
}

function isHtmlContentType(type: string): boolean {
  const t = type.toLowerCase()
  return t.includes('text/html') || t.includes('text/plain')
}

export async function checkGlb(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (!res.ok) return false

    const type = res.headers.get('content-type') ?? ''
    if (isHtmlContentType(type)) return false
    if (type.includes('model/gltf') || type.includes('octet-stream')) return true

    return hasGltfMagic(url)
  } catch {
    return false
  }
}
