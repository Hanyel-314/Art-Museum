import * as THREE from 'three';

console.log('🚀 Starting Art Museum...');
console.log('Three.js version:', THREE.REVISION);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
console.log('✅ Scene created with sky blue background');

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.6, 5);
console.log('✅ Camera positioned at:', camera.position);

// Renderer
const canvas = document.getElementById('museum-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
console.log('✅ Renderer created, size:', window.innerWidth, 'x', window.innerHeight);

// Create a BIG colorful cube to test visibility
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // Bright red
const testCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
testCube.position.set(0, 1.6, 0);
scene.add(testCube);
console.log('✅ RED test cube added at center');

// Add a green ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 }); // Bright green
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
console.log('✅ GREEN ground added');

// Add text to page
const entranceTooltip = document.getElementById('entrance-tooltip');
if (entranceTooltip) {
    entranceTooltip.classList.remove('hidden');
    entranceTooltip.textContent = 'Click the RED CUBE';
    entranceTooltip.style.color = 'red';
    entranceTooltip.style.fontSize = '2rem';
    console.log('✅ Tooltip shown');
}

// Hide loading screen
const loadingScreen = document.getElementById('loading-screen');
if (loadingScreen) {
    loadingScreen.style.display = 'none';
    console.log('✅ Loading screen hidden');
}

// Animation loop
let frameCount = 0;
function animate() {
    requestAnimationFrame(animate);

    // Rotate cube to show it's animating
    testCube.rotation.x += 0.01;
    testCube.rotation.y += 0.01;

    renderer.render(scene, camera);

    // Log every 60 frames (about 1 second)
    frameCount++;
    if (frameCount % 60 === 0) {
        console.log('🎬 Animation running... frame:', frameCount);
    }
}

animate();
console.log('✅ Animation loop started');

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('🔄 Window resized');
});

// Click test
canvas.addEventListener('click', () => {
    console.log('🖱️ CANVAS CLICKED!');
    testCube.material.color.set(Math.random() * 0xffffff);
    console.log('Changed cube color');
});

console.log('🎉 Setup complete! You should see:');
console.log('   - Sky blue background');
console.log('   - Green ground');
console.log('   - Rotating RED CUBE in center');
console.log('   - Click cube to change its color');
