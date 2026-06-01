import * as THREE from 'three';

const BIOMES = [
  {
    name: 'Highway',
    distanceStart: 0,
    roadColor: new THREE.Color(0x3a3a4a),
    grassColor: new THREE.Color(0x4a8c3f),
    grass2Color: new THREE.Color(0x3d7a35),
    fogColor: new THREE.Color(0x87CEEB),
    skyColor: new THREE.Color(0x87CEEB),
    barrierColor: new THREE.Color(0xcccccc),
    postColor: new THREE.Color(0xcc3333),
    ambientColor: new THREE.Color(0x404060),
    hemiSkyColor: new THREE.Color(0x87CEEB),
    hemiGroundColor: new THREE.Color(0x3a3a5a),
    sunColor: new THREE.Color(0xffeedd),
    fogNear: 25,
    fogFar: 45,
  },
  {
    name: 'Savanna',
    distanceStart: 800,
    roadColor: new THREE.Color(0x6a6a4a),
    grassColor: new THREE.Color(0x8a9a4a),
    grass2Color: new THREE.Color(0x7a8a3a),
    fogColor: new THREE.Color(0xccbb88),
    skyColor: new THREE.Color(0xccbb88),
    barrierColor: new THREE.Color(0xbbaa88),
    postColor: new THREE.Color(0xaa6633),
    ambientColor: new THREE.Color(0x504030),
    hemiSkyColor: new THREE.Color(0xccbb88),
    hemiGroundColor: new THREE.Color(0x5a4a2a),
    sunColor: new THREE.Color(0xffdd99),
    fogNear: 20,
    fogFar: 40,
  },
  {
    name: 'Desert',
    distanceStart: 2000,
    roadColor: new THREE.Color(0xc4a46a),
    grassColor: new THREE.Color(0xd4b87a),
    grass2Color: new THREE.Color(0xc4a86a),
    fogColor: new THREE.Color(0xf0d8a0),
    skyColor: new THREE.Color(0xf0d8a0),
    barrierColor: new THREE.Color(0xccaa66),
    postColor: new THREE.Color(0xaa7744),
    ambientColor: new THREE.Color(0x806040),
    hemiSkyColor: new THREE.Color(0xf0d8a0),
    hemiGroundColor: new THREE.Color(0x8a7050),
    sunColor: new THREE.Color(0xffcc66),
    fogNear: 18,
    fogFar: 38,
  },
  {
    name: 'Winter',
    distanceStart: 5000,
    roadColor: new THREE.Color(0x8a8a9a),
    grassColor: new THREE.Color(0xddeeff),
    grass2Color: new THREE.Color(0xcceeff),
    fogColor: new THREE.Color(0xccddee),
    skyColor: new THREE.Color(0xccddee),
    barrierColor: new THREE.Color(0xddeeff),
    postColor: new THREE.Color(0x88aacc),
    ambientColor: new THREE.Color(0x506080),
    hemiSkyColor: new THREE.Color(0xccddee),
    hemiGroundColor: new THREE.Color(0x5a6a8a),
    sunColor: new THREE.Color(0xeeeeff),
    fogNear: 22,
    fogFar: 42,
  },
  {
    name: 'Bridge',
    distanceStart: 6500,
    roadColor: new THREE.Color(0x5a6a7a),
    grassColor: new THREE.Color(0x2a6a9a),
    grass2Color: new THREE.Color(0x1a5a8a),
    fogColor: new THREE.Color(0x88bbdd),
    skyColor: new THREE.Color(0x88bbdd),
    barrierColor: new THREE.Color(0x8899aa),
    postColor: new THREE.Color(0x667788),
    ambientColor: new THREE.Color(0x305070),
    hemiSkyColor: new THREE.Color(0x88bbdd),
    hemiGroundColor: new THREE.Color(0x3a5a7a),
    sunColor: new THREE.Color(0xffffcc),
    fogNear: 30,
    fogFar: 55,
  },
  {
    name: 'Highway Night',
    distanceStart: 8000,
    roadColor: new THREE.Color(0x2a2a3a),
    grassColor: new THREE.Color(0x2a4a2a),
    grass2Color: new THREE.Color(0x1a3a1a),
    fogColor: new THREE.Color(0x1a1a2a),
    skyColor: new THREE.Color(0x0a0a1a),
    barrierColor: new THREE.Color(0x666677),
    postColor: new THREE.Color(0x993333),
    ambientColor: new THREE.Color(0x202040),
    hemiSkyColor: new THREE.Color(0x1a1a3a),
    hemiGroundColor: new THREE.Color(0x1a1a2a),
    sunColor: new THREE.Color(0x444466),
    fogNear: 15,
    fogFar: 30,
  },
];

const PONY_BIOMES = [
  {
    name: 'Pony-Field',
    distanceStart: 0,
    roadColor: new THREE.Color(0x4a8c3f),
    grassColor: new THREE.Color(0x6ab84a),
    grass2Color: new THREE.Color(0x58a83a),
    fogColor: new THREE.Color(0x88ddff),
    skyColor: new THREE.Color(0x88ddff),
    barrierColor: new THREE.Color(0x4a8c3f),
    postColor: new THREE.Color(0x4a8c3f),
    ambientColor: new THREE.Color(0x406050),
    hemiSkyColor: new THREE.Color(0x88ddff),
    hemiGroundColor: new THREE.Color(0x4a6a3a),
    sunColor: new THREE.Color(0xffeecc),
    fogNear: 30,
    fogFar: 60,
  },
  {
    name: 'Pony-Sky',
    distanceStart: 2000,
    roadColor: new THREE.Color(0xaaccff),
    grassColor: new THREE.Color(0xaaccff),
    grass2Color: new THREE.Color(0x99bbff),
    fogColor: new THREE.Color(0xccddff),
    skyColor: new THREE.Color(0xccddff),
    barrierColor: new THREE.Color(0xaaccff),
    postColor: new THREE.Color(0xaaccff),
    ambientColor: new THREE.Color(0x8090c0),
    hemiSkyColor: new THREE.Color(0xccddff),
    hemiGroundColor: new THREE.Color(0x6688aa),
    sunColor: new THREE.Color(0xffffcc),
    fogNear: 40,
    fogFar: 80,
  },
];

const CYCLE_LENGTH = 9800;

function lerpColor(a, b, t) {
  const c = new THREE.Color();
  c.r = a.r + (b.r - a.r) * t;
  c.g = a.g + (b.g - a.g) * t;
  c.b = a.b + (b.b - a.b) * t;
  return c;
}

export class Biome {
  constructor() {
    this._biomes = BIOMES;
    this._cycleLength = CYCLE_LENGTH;
    this.currentIndex = 0;
    this.nextIndex = 0;
    this.transitionProgress = 1;
    this.current = this._copyProps(this._biomes[0]);
    this.target = this._copyProps(this._biomes[0]);
    this._transStart = 0;
    this._transEnd = this._biomes[1] ? this._biomes[1].distanceStart : this._cycleLength;
  }

  setPonyMode(on) {
    this._biomes = on ? PONY_BIOMES : BIOMES;
    this._cycleLength = on ? 4000 : CYCLE_LENGTH;
    this.reset();
  }

  _copyProps(src) {
    return {
      name: src.name,
      roadColor: src.roadColor.clone(),
      grassColor: src.grassColor.clone(),
      grass2Color: src.grass2Color.clone(),
      fogColor: src.fogColor.clone(),
      skyColor: src.skyColor.clone(),
      barrierColor: src.barrierColor.clone(),
      postColor: src.postColor.clone(),
      ambientColor: src.ambientColor.clone(),
      hemiSkyColor: src.hemiSkyColor.clone(),
      hemiGroundColor: src.hemiGroundColor.clone(),
      sunColor: src.sunColor.clone(),
      fogNear: src.fogNear,
      fogFar: src.fogFar,
    };
  }

  update(distance, delta) {
    const d = distance % this._cycleLength;
    for (let i = this._biomes.length - 1; i >= 0; i--) {
      if (d >= this._biomes[i].distanceStart) {
        if (this.currentIndex !== i) {
          this.currentIndex = i;
          this.nextIndex = i + 1 < this._biomes.length ? i + 1 : 0;
          this.transitionProgress = 0;
          this.current = this._copyProps(this._biomes[i]);
          this.target = this._copyProps(this._biomes[this.nextIndex]);
          this._transStart = this._biomes[i].distanceStart;
          this._transEnd = this._biomes[this.nextIndex].distanceStart;
        }
        break;
      }
    }

    const range = this._transEnd - this._transStart;
    const progress = range > 0 ? (d - this._transStart) / range : 1;
    this.transitionProgress = Math.max(0, Math.min(1, progress * 3 - 2));

    const t = this.transitionProgress;
    const from = this.current;
    const to = this.target;

    return {
      name: this._biomes[this.currentIndex].name,
      roadColor: lerpColor(from.roadColor, to.roadColor, t),
      grassColor: lerpColor(from.grassColor, to.grassColor, t),
      grass2Color: lerpColor(from.grass2Color, to.grass2Color, t),
      fogColor: lerpColor(from.fogColor, to.fogColor, t),
      skyColor: lerpColor(from.skyColor, to.skyColor, t),
      barrierColor: lerpColor(from.barrierColor, to.barrierColor, t),
      postColor: lerpColor(from.postColor, to.postColor, t),
      ambientColor: lerpColor(from.ambientColor, to.ambientColor, t),
      hemiSkyColor: lerpColor(from.hemiSkyColor, to.hemiSkyColor, t),
      hemiGroundColor: lerpColor(from.hemiGroundColor, to.hemiGroundColor, t),
      sunColor: lerpColor(from.sunColor, to.sunColor, t),
      fogNear: from.fogNear + (to.fogNear - from.fogNear) * t,
      fogFar: from.fogFar + (to.fogFar - from.fogFar) * t,
    };
  }

  reset() {
    this.currentIndex = 0;
    this.nextIndex = 0;
    this.transitionProgress = 1;
    this.current = this._copyProps(this._biomes[0]);
    this.target = this._copyProps(this._biomes[0]);
    this._transStart = 0;
    this._transEnd = this._biomes[1] ? this._biomes[1].distanceStart : this._cycleLength;
  }

  getCurrentName() {
    return this._biomes[this.currentIndex].name;
  }
}
