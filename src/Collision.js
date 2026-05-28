import * as THREE from 'three';

export function checkCollision(playerBox, trafficBoxes) {
  for (const entry of trafficBoxes) {
    if (playerBox.intersectsBox(entry.box)) {
      return entry.mesh;
    }
  }
  return null;
}
