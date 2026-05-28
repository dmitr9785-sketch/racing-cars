import * as THREE from 'three';

export class SceneSetup {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 60, 120);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 5, -8);
    this.camera.lookAt(0, 0, 4);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.prepend(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x87CEEB, 0x3a3a5a, 0.8);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffeedd, 1.4);
    sun.position.set(10, 20, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 60;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -10;
    this.scene.add(sun);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}
