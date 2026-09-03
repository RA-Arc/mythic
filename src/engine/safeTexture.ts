import { Texture } from "pixi.js";

/**
 * Returns an array of guaranteed valid Textures.
 * If textures is null/empty or contains undefined/null or non-Texture items,
 * filters them out and returns [Texture.WHITE] if no valid textures remain.
 * This completely prevents:
 * TypeError: undefined is not an object (evaluating 'firstFrame.texture')
 */
export function getSafeTextures(textures?: (Texture | undefined | null)[] | null): Texture[] {
  if (!textures || !Array.isArray(textures)) {
    return [Texture.WHITE];
  }
  const valid = textures.filter((t): t is Texture => t instanceof Texture);
  return valid.length > 0 ? valid : [Texture.WHITE];
}

/**
 * Safely gets a texture from the Pixi Cache or returns null if not available.
 */
export function getSafeTexture(id: string): Texture | null {
  try {
    const tex = Texture.from(id);
    if (tex instanceof Texture) {
      return tex;
    }
  } catch {
    // ignore
  }
  return null;
}
