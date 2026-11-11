import * as THREE from 'three';

export function openPanorama(host, tour) {
  if (!tour.thumbnail) throw new Error('No panorama image is registered for this tour.');
  const image = new URL(tour.thumbnail, location.href);
  if (image.username || image.password || (image.protocol !== 'https:' && image.origin !== location.origin)) {
    throw new Error('The panorama must use an approved HTTPS image URL.');
  }
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  host.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.setAttribute('aria-label', 'Interactive 360 degree panorama');
  const scene = new THREE.Scene();
  const initialFov = Math.max(40, Math.min(130, Number(tour.fov) || 90));
  const camera = new THREE.PerspectiveCamera(initialFov, 1, 1, 1100);
  const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(500, 64, 40), material));
  const message = document.createElement('div');
  message.className = 'preview-status';
  message.textContent = 'Loading panorama…';
  host.appendChild(message);
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  loader.load(image.href, texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    material.map = texture;
    material.needsUpdate = true;
    message.remove();
  }, undefined, () => { message.textContent = 'Could not load the panorama. Check image availability and cross-origin permissions.'; });
  let heading = Number(tour.hlookat) || 0;
  let tilt = Number(tour.vlookat) || 0;
  let pointer = null;
  renderer.domElement.addEventListener('pointerdown', event => {
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    renderer.domElement.setPointerCapture(event.pointerId);
  });
  renderer.domElement.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    heading += (pointer.x - event.clientX) * 0.17;
    tilt += (event.clientY - pointer.y) * 0.17;
    pointer.x = event.clientX; pointer.y = event.clientY;
  });
  for (const name of ['pointerup', 'pointercancel']) renderer.domElement.addEventListener(name, () => { pointer = null; });
  const zoom = delta => { camera.fov = Math.max(40, Math.min(130, camera.fov + delta)); camera.updateProjectionMatrix(); };
  renderer.domElement.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY * 0.025); }, { passive: false });
  const controls = document.createElement('div');
  controls.className = 'preview-controls';
  for (const [label, action] of [
    ['Zoom in', () => zoom(-10)], ['Zoom out', () => zoom(10)],
    ['Reset view', () => { heading = Number(tour.hlookat) || 0; tilt = Number(tour.vlookat) || 0; camera.fov = initialFov; camera.updateProjectionMatrix(); }],
    ['Fullscreen', () => host.requestFullscreen?.()],
  ]) {
    const button = document.createElement('button'); button.textContent = label;
    button.addEventListener('click', action); controls.appendChild(button);
  }
  host.appendChild(controls);
  const resize = () => { renderer.setSize(host.clientWidth, host.clientHeight); camera.aspect = host.clientWidth / Math.max(1, host.clientHeight); camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(host); resize();
  renderer.setAnimationLoop(() => {
    tilt = Math.max(-85, Math.min(85, tilt));
    const phi = THREE.MathUtils.degToRad(90 - tilt);
    const theta = THREE.MathUtils.degToRad(heading);
    camera.lookAt(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta));
    renderer.render(scene, camera);
  });
}
