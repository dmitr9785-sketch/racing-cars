import * as THREE from 'three';

const ROAD_WIDTH = 14;
const ROAD_LENGTH = 120;
const LANE_COUNT = 3;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;
const LANE_POSITIONS = [-LANE_WIDTH, 0, LANE_WIDTH];

export function getLanePositions() {
  return LANE_POSITIONS;
}

export class Road {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    this._createRoadSurface();
    this._createLaneMarkings();
    this._createBarriers();
    this._createEdgeMarkings();
    this._createGrass();

    scene.add(this.group);
  }

  _createRoadSurface() {
    this._roadCanvas = document.createElement('canvas');
    this._roadCanvas.width = 512;
    this._roadCanvas.height = 512;
    this._roadCtx = this._roadCanvas.getContext('2d');

    const texture = new THREE.CanvasTexture(this._roadCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 30);
    this.surfaceTexture = texture;

    this._paintRoad(0x3a3a4a, 0x454558);

    const geometry = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_LENGTH);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0,
    });
    this._roadMat = material;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, -0.05, ROAD_LENGTH / 2 - 5);
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  _paintRoad(fill, stroke) {
    const r = (fill >> 16) & 0xff;
    const g = (fill >> 8) & 0xff;
    const b = fill & 0xff;
    this._roadCtx.fillStyle = `rgb(${r},${g},${b})`;
    this._roadCtx.fillRect(0, 0, 512, 512);

    const sr = (stroke >> 16) & 0xff;
    const sg = (stroke >> 8) & 0xff;
    const sb = stroke & 0xff;
    this._roadCtx.strokeStyle = `rgb(${sr},${sg},${sb})`;
    this._roadCtx.lineWidth = 3;
    for (let i = 0; i < 512; i += 20) {
      this._roadCtx.beginPath();
      this._roadCtx.moveTo(0, i);
      this._roadCtx.lineTo(512, i + 6);
      this._roadCtx.stroke();
    }
    this.surfaceTexture.needsUpdate = true;
  }

  _createLaneMarkings() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 64, 512);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 512; i += 40) {
      ctx.fillRect(24, i + 4, 16, 24);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 10);

    const boundaries = [
      -LANE_WIDTH + LANE_WIDTH / 2,
      LANE_WIDTH / 2,
    ];

    for (const x of boundaries) {
      const geo = new THREE.PlaneGeometry(0.3, ROAD_LENGTH);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.01, ROAD_LENGTH / 2 - 5);
      this.group.add(mesh);
    }

    this.laneTexture = texture;
  }

  _createBarriers() {
    this.barriersGroup = new THREE.Group();
    this._barrierMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 });
    const mat = this._barrierMat;
    this._postMat = new THREE.MeshStandardMaterial({ color: 0xcc3333 });

    for (const side of [-1, 1]) {
      const x = side * (ROAD_WIDTH / 2 + 0.5);
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, ROAD_LENGTH), mat);
      wall.position.set(x, 0.25, ROAD_LENGTH / 2 - 5);
      wall.receiveShadow = true;
      this.barriersGroup.add(wall);

      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6);
      const instanced = new THREE.InstancedMesh(postGeo, this._postMat, 24);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 24; i++) {
        dummy.position.set(x, 0.6, i * 5);
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
      }
      instanced.instanceMatrix.needsUpdate = true;
      this.barriersGroup.add(instanced);
    }
    this.group.add(this.barriersGroup);
  }

  _createEdgeMarkings() {
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    for (const side of [-1, 1]) {
      const x = side * (ROAD_WIDTH / 2 - 0.1);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, ROAD_LENGTH), mat);
      mesh.position.set(x, 0.01, ROAD_LENGTH / 2 - 5);
      this.group.add(mesh);
    }
  }

  _createGrass() {
    this._grassMats = [];
    for (const side of [-1, 1]) {
      const centerX = side * (ROAD_WIDTH / 2 + 15);
      const mat = new THREE.MeshStandardMaterial({ color: 0x4a8c3f, roughness: 1, metalness: 0 });
      this._grassMats.push(mat);
      const geo = new THREE.PlaneGeometry(30, ROAD_LENGTH);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(centerX, -0.05, ROAD_LENGTH / 2 - 5);
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
  }

  setBiome(colors) {
    const road = colors.roadColor;
    const rd = new THREE.Color(road.r * 255, road.g * 255, road.b * 255);
    const stroke = rd.clone().multiplyScalar(1.15);
    this._paintRoad(rd.getHex(), stroke.getHex());

    for (const mat of this._grassMats) {
      mat.color.copy(colors.grassColor);
    }

    this._barrierMat.color.copy(colors.barrierColor);
    this._postMat.color.copy(colors.postColor);
  }

  update(speed, delta) {
    const factor = 4 + speed * 0.3;
    const offset = this.surfaceTexture.offset.y + speed * delta * factor;
    this.surfaceTexture.offset.y = offset % 1;
    this.laneTexture.offset.y = offset % 1;

    const scroll = speed * delta * factor;
    this.barriersGroup.position.z -= scroll;
    if (this.barriersGroup.position.z < -25) {
      this.barriersGroup.position.z += 25;
    }
  }
}
