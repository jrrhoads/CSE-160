import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

const fov = 120;
const aspect = canvas.clientWidth / canvas.clientHeight;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

//scene setup
const scene = new THREE.Scene();

//lights

//directional light
const light = new THREE.DirectionalLight(0x9999aa, 1);
light.position.set(-1, 2, 4);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x334455, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x4444ff, 1, 50);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const hemisphereLight = new THREE.HemisphereLight(0x444466, 0x223322, 1);
scene.add(hemisphereLight);

const geometry = new THREE.BoxGeometry(1, 1, 1);

//texture loaders
const loader = new THREE.TextureLoader();
const texture = loader.load('./textures/wood.jpg');


//load skybox with repeated texture 
const skyboxLoader = new THREE.CubeTextureLoader();
const skyboxTexture = skyboxLoader.load([
  './textures/sky.png',
  './textures/sky.png',
  './textures/sky.png',
  './textures/sky.png',
  './textures/sky.png',
  './textures/sky.png',
]);
scene.background = skyboxTexture;


//init grass texture and add to new ground plane 
const grassTexture = loader.load('./textures/grass.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10);

const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshPhongMaterial({map: grassTexture});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.add(ground);

//generate trees
const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
const trunkMaterial = new THREE.MeshPhongMaterial({color: 0x8B4513});
const topGeometry = new THREE.ConeGeometry(1, 2, 8);
const topMaterial = new THREE.MeshPhongMaterial({color: 0x2d6a4f});

const treeRings = [
  {numTrees: 16, radius: 12},
  {numTrees: 22, radius: 19},
];

treeRings.forEach(({numTrees, radius}) => {
  for (let i = 0; i < numTrees; i++) {
    const angle = (i / numTrees) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, 0, z);
    scene.add(trunk);

    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(x, 2, z);
    scene.add(top);
  }
});

//model loader
const gltfLoader = new GLTFLoader();

gltfLoader.load('./models/log_cabin.glb', (gltf) => {
  const model = gltf.scene;
  model.scale.set(0.01, 0.01, 0.01);
  model.position.set(0, -1, 0);
  scene.add(model);
});

//controls
const controls = new OrbitControls(camera, canvas);
controls.update();

function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({
    map: texture,
    emissive: 0xffdd44,
    emissiveIntensity: 3,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.x = x;
    cube.position.z = 8;
    cube.position.y += 2;

    const glow = new THREE.PointLight(0xffdd44, 30, 20);
    cube.add(glow);

    return cube;
}

const cubes = [
  makeInstance(geometry, 0x44aa88,  0)
];


//particle emitter
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 200;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30 + 5;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: 0xffdd44,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);



function render(time) {
    time *= 0.001;

    controls.update();

    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * 0.1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });

    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += 0.01;
        if (pos[i * 3 + 1] > 15) pos[i * 3 + 1] = -15;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
