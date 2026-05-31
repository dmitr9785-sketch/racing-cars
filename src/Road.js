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
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#454558';
    ctx.lineWidth = 3;
    for (let i = 0; i < 512; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i + 6);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 30);

    const geometry = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_LENGTH);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, -0.05, ROAD_LENGTH / 2 - 5);
    mesh.receiveShadow = true;
    this.group.add(mesh);
    this.surfaceTexture = texture;
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
    const mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 });

    for (const side of [-1, 1]) {
      const x = side * (ROAD_WIDTH / 2 + 0.5);
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, ROAD_LENGTH), mat);
      wall.position.set(x, 0.25, ROAD_LENGTH / 2 - 5);
      wall.receiveShadow = true;
      this.barriersGroup.add(wall);

      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6);
      const postMat = new THREE.MeshStandardMaterial({ color: 0xcc3333 });
      const instanced = new THREE.InstancedMesh(postGeo, postMat, 24);
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
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4a8c3f, roughness: 1, metalness: 0 });

    for (const side of [-1, 1]) {
      const centerX = side * (ROAD_WIDTH / 2 + 15);
      const geo = new THREE.PlaneGeometry(30, ROAD_LENGTH);
      const mesh = new THREE.Mesh(geo, grassMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(centerX, -0.05, ROAD_LENGTH / 2 - 5);
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
  }

  update(speed, delta) {
    const factor = 6 + speed * 0.5;
    const offset = this.surfaceTexture.offset.y + speed * delta * factor;
    this.surfaceTexture.offset.y = offset % 1;
    this.laneTexture.offset.y = offset % 1;

    const scroll = speed * delta * factor;
    this.barriersGroup.position.z -= scroll;
    if (this.barriersGroup.position.z < -ROAD_LENGTH) {
      this.barriersGroup.position.z += ROAD_LENGTH;
    }
  }
}
