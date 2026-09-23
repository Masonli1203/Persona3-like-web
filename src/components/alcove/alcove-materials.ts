import * as THREE from 'three';
import { FINISHES, type Finish, type PartMaterial } from '@/lib/alcove-config';

/** Small deterministic texture tiles, generated once. No image requests or texture assets. */
function surfaceTexture(kind: 'timber' | 'linen' | 'stone') {
  const size = kind === 'timber' ? 256 : 128;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const noise = ((x * 173 + y * 917 + ((x * y) % 71)) % 97) / 97;
      const wave = y + Math.sin(x / 43) * 2.7 + Math.sin(x / 17 + y / 29) * 0.6;
      const value =
        kind === 'timber'
          ? 235 -
            Math.pow(Math.abs(Math.sin(wave * 0.61)), 16) * 48 -
            noise * 13 -
            Math.sin(wave * 0.09) * 9
          : kind === 'linen'
            ? 230 + (x % 4 < 2 === y % 4 < 2 ? 13 : -13) - noise * 10
            : 234 - noise * 28 - Math.sin(x * 0.13 + Math.sin(y * 0.18)) * 5;
      const offset = (y * size + x) * 4;
      pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = value;
      pixels[offset + 3] = 255;
    }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export function createAlcoveMaterials(finish: Finish, anisotropy: number) {
  const timber = surfaceTexture('timber');
  const deck = timber.clone();
  deck.center.set(0.5, 0.5);
  deck.rotation = Math.PI / 2;
  const linen = surfaceTexture('linen');
  linen.repeat.set(3, 3);
  const stone = surfaceTexture('stone');
  const textures = [timber, deck, linen, stone];
  textures.forEach((texture) => {
    texture.anisotropy = Math.min(anisotropy, 4);
  });
  const make = (
    color: string,
    roughness = 0.8,
    metalness = 0,
    map?: THREE.Texture,
    bumpScale = 0.002,
  ) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      ...(map ? { map, bumpMap: map, bumpScale } : {}),
    });
  const materials: Record<PartMaterial, THREE.MeshStandardMaterial> = {
    frame: make(FINISHES[finish].color, 0.42, 0.28),
    wood: make('#ba9061', 0.7, 0, timber),
    woodEdge: make('#987046', 0.74, 0, timber),
    deck: make('#b18b5b', 0.8, 0, deck),
    fabric: make('#e5ddc9', 0.94, 0, linen, 0.001),
    fabricEdge: make('#b8b49f', 0.94, 0, linen, 0.001),
    accent: make('#9b6753', 0.94, 0, linen, 0.001),
    dark: make('#252e2c', 0.56, 0.2),
    metal: make('#7d827c', 0.36, 0.65),
    stone: make('#c6bdad', 0.92, 0, stone),
    ceramic: make('#dfd9c9', 0.56),
    leaf: make('#405d42', 0.65),
    light: make('#fff1c8'),
    heat: make('#e87b42'),
  };
  materials.light.emissive.set('#ffdb9a');
  materials.light.emissiveIntensity = 3;
  materials.heat.emissive.set('#ff632d');
  materials.heat.emissiveIntensity = 1.4;
  return {
    materials,
    dispose: () => {
      Object.values(materials).forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
    },
  };
}
