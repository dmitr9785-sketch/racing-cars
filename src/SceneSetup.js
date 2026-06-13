import * as THREE from 'three';

export class SceneSetup {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 25, 45);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 12, -4);
    this.camera.lookAt(0, 0, 4);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.prepend(this.renderer.domElement);

    this.ambient = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(this.ambient);

    this.hemi = new THREE.HemisphereLight(0x87CEEB, 0x3a3a5a, 0.8);
    this.scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(0xffeedd, 1.4);
    this.sun.position.set(10, 20, 5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 256;
    this.sun.shadow.mapSize.height = 256;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 60;
    this.sun.shadow.camera.left = -20;
    this.sun.shadow.camera.right = 20;
    this.sun.shadow.camera.top = 40;
    this.sun.shadow.camera.bottom = -10;
    this.scene.add(this.sun);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setBiome(colors) {
    this.scene.background.copy(colors.skyColor);
    this.scene.fog.color.copy(colors.fogColor);
    this.scene.fog.near = colors.fogNear;
    this.scene.fog.far = colors.fogFar;
    this.ambient.color.copy(colors.ambientColor);
    this.hemi.color.copy(colors.hemiSkyColor);
    this.hemi.groundColor.copy(colors.hemiGroundColor);
    this.sun.color.copy(colors.sunColor);
  }
}
