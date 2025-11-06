
import { togglePopup, attachPopupEvents } from "./Popupmanager";

// src/renderer/viewer.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export function init3DViewer(container: HTMLElement, glbPath: string) {


  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 3);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.4));

  let mixer: THREE.AnimationMixer | null = null;
  let actions: THREE.AnimationAction[] = [];
  let isPlaying = false;
  let pendingFinishes = 0;

  function onMixerFinished(_e: THREE.Event) {
    pendingFinishes = Math.max(0, pendingFinishes - 1);
    if (pendingFinishes === 0) isPlaying = false;
  }

  function focusCameraOnObject(obj: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera.fov * Math.PI) / 180;
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5;
    camera.position.set(center.x, center.y + maxDim * 0.2, center.z + cameraZ);
    camera.near = Math.max(0.01, cameraZ / 100);
    camera.far = cameraZ * 100;
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();
    const dist = camera.position.distanceTo(controls.target);
    controls.minDistance = dist;
    controls.maxDistance = dist;
  }

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/libs/draco/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.setMeshoptDecoder(MeshoptDecoder);

  loader.load(
    encodeURI(glbPath),
    (gltf: GLTF) => {
      const model = gltf.scene;
      scene.add(model);

      model.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.frustumCulled = false;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
        }
      });
      model.updateMatrixWorld(true);

      const FIXED_MODEL_SCALE = 0.3;
      model.scale.setScalar(FIXED_MODEL_SCALE);
      model.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(model);
      const yShift = -box.min.y;
      model.position.y += yShift;
      model.updateMatrixWorld(true);

      focusCameraOnObject(model);

      mixer = new THREE.AnimationMixer(model);
      mixer.addEventListener('finished', onMixerFinished);

      gltf.animations.forEach((clip) => {
        const action = mixer!.clipAction(clip);
        action.clampWhenFinished = true;
        action.setLoop(THREE.LoopOnce, 1);
        actions.push(action);
      });

      console.info('{117.Model3d.ts} Animations trouvées :', gltf.animations.map((a) => a.name));
    },
    (xhr) => {
      if (xhr && xhr.total) {
        console.info(`{121.Model3d.ts} Chargement: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
      } else if (xhr && xhr.loaded) {
        console.info(`{123.Model3d.ts} Chargement: ${xhr.loaded} bytes`);
      } else {
        console.info('{125.Model3d.ts} Chargement en cours...');
      }
    },
    (error) => console.error('{128.Model3d.ts} Erreur de chargement GLB:', error)
  );

  attachPopupEvents(container);

  // event pour ANIMATION BUGA AI
  container.addEventListener('click', () => {
    if (!actions.length || isPlaying) return;

    pendingFinishes = 0;
    let started = 0;

    actions.forEach((action) => {
      const clip = action.getClip ? action.getClip() : (action as any)._clip;
      const duration = clip && typeof clip.duration === 'number' ? clip.duration : 0;

      action.stop();
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();

      if (duration > 0) {
        pendingFinishes++;
        started++;
      }
    });

    if (started > 0) isPlaying = true;
  
    togglePopup("open");
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}
