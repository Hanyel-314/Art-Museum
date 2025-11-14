import * as THREE from 'three';

// ============================================
// ART MUSEUM - COMPLETE REBUILD
// ============================================

console.log('🎨 Art Museum Starting...');

// Global variables
let scene, camera, renderer;
let currentView = 'ENTRANCE'; // ENTRANCE, CORRIDOR, WALL_LEFT, WALL_RIGHT, DETAIL
let isAnimating = false;
let selectedPainting = null;

// Objects
let entranceDoor;
let leftDoor, rightDoor; // Individual door panels
let corridorObjects = [];
let leftWallPaintings = [];
let rightWallPaintings = [];
let detailArtwork = null;
let hoveredPainting = null;

// Mouse interaction
let raycaster, mouse;
let isDragging = false;
let previousMouse = { x: 0, y: 0 };

// Lighting
let detailKeyLight, detailRimLight;

// UI Elements
const tooltip = document.getElementById('entrance-tooltip');
const backBtn = document.getElementById('back-button');
const infoPanel = document.getElementById('artwork-info');
const wallHintLeft = document.getElementById('wall-hint-left');
const wallHintRight = document.getElementById('wall-hint-right');

// Painting data
const PAINTINGS = {
    left: [
        {
            title: "Starry Night",
            artist: "Vincent van Gogh",
            year: "1889",
            medium: "Oil on canvas",
            description: "An iconic post-impressionist masterpiece depicting a swirling night sky.",
            color: 0x4169E1
        },
        {
            title: "The Great Wave",
            artist: "Katsushika Hokusai",
            year: "1831",
            medium: "Woodblock print",
            description: "A stunning Japanese woodblock print featuring an enormous wave.",
            color: 0x1E90FF
        },
        {
            title: "Girl with a Pearl Earring",
            artist: "Johannes Vermeer",
            year: "1665",
            medium: "Oil on canvas",
            description: "Often called the 'Mona Lisa of the North.'",
            color: 0xDAA520
        }
    ],
    right: [
        {
            title: "The Scream",
            artist: "Edvard Munch",
            year: "1893",
            medium: "Oil and pastel",
            description: "An expressionist masterpiece depicting universal anxiety.",
            color: 0xFF6347
        },
        {
            title: "The Birth of Venus",
            artist: "Sandro Botticelli",
            year: "1485",
            medium: "Tempera on canvas",
            description: "Venus emerging from the sea as a fully grown woman.",
            color: 0xFFB6C1
        },
        {
            title: "The Kiss",
            artist: "Gustav Klimt",
            year: "1908",
            medium: "Oil and gold leaf",
            description: "A couple embraced in elaborate golden robes.",
            color: 0xFFD700
        }
    ]
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('Initializing Three.js...');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);
    camera.lookAt(0, 2, 0); // Look at the door

    // Renderer
    const canvas = document.getElementById('museum-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lights - bright for visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Additional front light for entrance
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.6);
    frontLight.position.set(0, 3, 10);
    scene.add(frontLight);

    console.log('✅ Scene, camera, renderer ready');

    // Create all scenes
    createEntranceScene();
    createCorridorScene();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    backBtn.addEventListener('click', goBack);

    console.log('✅ Event listeners attached');

    // Hide loading screen
    document.getElementById('loading-screen').style.display = 'none';
    tooltip.classList.remove('hidden');

    // Start animation
    animate();
    console.log('🎉 Museum ready!');
    console.log('Camera position:', camera.position);
    console.log('Camera rotation:', camera.rotation);
    console.log('Scene background:', scene.background);
}

// ============================================
// SCENE CREATION
// ============================================

function createEntranceScene() {
    console.log('Creating entrance...');

    // Ground - stone pathway
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshLambertMaterial({ color: 0xC0C0C0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Museum facade wall
    const facade = new THREE.Mesh(
        new THREE.BoxGeometry(8, 6, 0.5),
        new THREE.MeshLambertMaterial({ color: 0xD3D3D3 })
    );
    facade.position.set(0, 3, -0.3);
    scene.add(facade);

    // Door container
    entranceDoor = new THREE.Group();
    entranceDoor.position.z = 0;

    // LEFT DOOR PANEL
    leftDoor = new THREE.Group();
    leftDoor.position.set(-0.05, 2, 0);

    const leftPanel = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 4, 0.15),
        new THREE.MeshLambertMaterial({
            color: 0x8B4513  // Brighter brown for visibility
        })
    );
    leftPanel.position.x = -0.75;
    leftPanel.userData.clickable = true;
    leftPanel.userData.type = 'door';
    leftDoor.add(leftPanel);

    // Left door brass handle
    const leftHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8),
        new THREE.MeshLambertMaterial({
            color: 0xFFD700  // Bright gold
        })
    );
    leftHandle.rotation.z = Math.PI / 2;
    leftHandle.position.set(-0.3, 0, 0.1);
    leftDoor.add(leftHandle);

    // RIGHT DOOR PANEL
    rightDoor = new THREE.Group();
    rightDoor.position.set(0.05, 2, 0);

    const rightPanel = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 4, 0.15),
        new THREE.MeshLambertMaterial({
            color: 0x8B4513  // Brighter brown for visibility
        })
    );
    rightPanel.position.x = 0.75;
    rightPanel.userData.clickable = true;
    rightPanel.userData.type = 'door';
    rightDoor.add(rightPanel);

    // Right door brass handle
    const rightHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8),
        new THREE.MeshLambertMaterial({
            color: 0xFFD700  // Bright gold
        })
    );
    rightHandle.rotation.z = Math.PI / 2;
    rightHandle.position.set(0.3, 0, 0.1);
    rightDoor.add(rightHandle);

    entranceDoor.add(leftDoor);
    entranceDoor.add(rightDoor);

    // Door frame
    const frameMat = new THREE.MeshLambertMaterial({
        color: 0xFFD700  // Bright gold
    });

    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(3.3, 0.15, 0.2),
        frameMat
    );
    topFrame.position.set(0, 4.05, 0.05);
    entranceDoor.add(topFrame);

    scene.add(entranceDoor);

    // DEBUG: Add a bright test cube to verify rendering
    const testCube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xFF0000 })
    );
    testCube.position.set(2, 2, 0);
    scene.add(testCube);

    console.log('✅ Entrance created with dual doors');
    console.log('Door position:', entranceDoor.position);
    console.log('Scene children count:', scene.children.length);
}

function createCorridorScene() {
    console.log('Creating corridor...');

    // Floor - marble appearance
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 30),
        new THREE.MeshStandardMaterial({
            color: 0xF0F0F0,
            roughness: 0.3,
            metalness: 0.2
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.visible = false;
    floor.receiveShadow = true;
    corridorObjects.push(floor);
    scene.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 30),
        new THREE.MeshStandardMaterial({
            color: 0xFAFAFA,
            roughness: 0.8,
            metalness: 0
        })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4;
    ceiling.visible = false;
    corridorObjects.push(ceiling);
    scene.add(ceiling);

    // Recessed ceiling lights (warm 3500-4000K)
    const warmColor = 0xFFF4E6; // Warm white
    for (let i = -12; i <= 12; i += 6) {
        const ceilingLight = new THREE.PointLight(warmColor, 0.4, 8);
        ceilingLight.position.set(0, 3.8, i);
        ceilingLight.visible = false;
        corridorObjects.push(ceilingLight);
        scene.add(ceilingLight);
    }

    // Left wall
    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 4),
        new THREE.MeshStandardMaterial({
            color: 0xE5E5E5,
            roughness: 0.9,
            metalness: 0
        })
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-5, 2, 0);
    leftWall.userData.clickable = true;
    leftWall.userData.type = 'wall';
    leftWall.userData.side = 'left';
    leftWall.visible = false;
    leftWall.receiveShadow = true;
    corridorObjects.push(leftWall);
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 4),
        new THREE.MeshStandardMaterial({
            color: 0xE5E5E5,
            roughness: 0.9,
            metalness: 0
        })
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(5, 2, 0);
    rightWall.userData.clickable = true;
    rightWall.userData.type = 'wall';
    rightWall.userData.side = 'right';
    rightWall.visible = false;
    rightWall.receiveShadow = true;
    corridorObjects.push(rightWall);
    scene.add(rightWall);

    // Create paintings
    createPaintings('left', -4.9, leftWallPaintings);
    createPaintings('right', 4.9, rightWallPaintings);

    console.log('✅ Corridor created with enhanced lighting');
}

function createPaintings(side, xPos, storageArray) {
    const paintings = PAINTINGS[side];
    const rotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

    paintings.forEach((data, i) => {
        const zPos = -8 + (i * 8);
        const frame = new THREE.Group();
        frame.position.set(xPos, 2, zPos);
        frame.rotation.y = rotation;
        frame.visible = false;
        frame.userData.clickable = true;
        frame.userData.type = 'painting';
        frame.userData.data = data;
        frame.userData.originalScale = 1;

        // Canvas
        const canvas = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.8,
                metalness: 0
            })
        );
        canvas.position.z = 0.02;
        frame.add(canvas);

        // Anti-reflection glass
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(2.1, 2.1),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.05,
                roughness: 0.1,
                metalness: 0.1,
                envMapIntensity: 0.3
            })
        );
        glass.position.z = 0.06;
        frame.add(glass);

        // Dark wood frame
        const frameThickness = 0.1;
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x3D2817,
            roughness: 0.7,
            metalness: 0
        });

        const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, frameThickness), frameMat);
        top.position.y = 1.05;
        frame.add(top);

        const bottom = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, frameThickness), frameMat);
        bottom.position.y = -1.05;
        frame.add(bottom);

        const left = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, frameThickness), frameMat);
        left.position.x = -1.05;
        frame.add(left);

        const right = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, frameThickness), frameMat);
        right.position.x = 1.05;
        frame.add(right);

        // Brass plaque
        const plaque = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.1, 0.02),
            new THREE.MeshStandardMaterial({
                color: 0xB8860B,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        plaque.position.set(0, -1.3, 0.05);
        frame.add(plaque);

        // Wall wash light above painting
        const wallLight = new THREE.SpotLight(0xFFF4E6, 0.6, 5, Math.PI / 6, 0.3);
        wallLight.position.copy(frame.position);
        wallLight.position.y += 1.5;
        wallLight.position.z += (side === 'left' ? -0.3 : 0.3);
        wallLight.target.position.copy(frame.position);
        wallLight.visible = false;
        wallLight.castShadow = true;
        corridorObjects.push(wallLight);
        corridorObjects.push(wallLight.target);
        scene.add(wallLight);
        scene.add(wallLight.target);

        storageArray.push(frame);
        corridorObjects.push(frame);
        scene.add(frame);
    });

    console.log(`✅ Created ${paintings.length} paintings on ${side} with glass & lighting`);
}

// ============================================
// VIEW TRANSITIONS
// ============================================

function enterCorridor() {
    if (isAnimating) return;
    isAnimating = true;
    console.log('🚶 Entering corridor...');

    tooltip.classList.add('hidden');

    // Animate doors opening
    const doorDuration = 1200;
    const doorStartTime = Date.now();

    function animateDoors() {
        const elapsed = Date.now() - doorStartTime;
        const t = Math.min(elapsed / doorDuration, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        // Left door swings left
        leftDoor.rotation.y = eased * Math.PI / 2;
        // Right door swings right
        rightDoor.rotation.y = -eased * Math.PI / 2;

        if (t < 1) {
            requestAnimationFrame(animateDoors);
        } else {
            // Doors fully open, hide entrance and show corridor
            setTimeout(() => {
                entranceDoor.visible = false;
                corridorObjects.forEach(obj => obj.visible = true);
            }, 200);
        }
    }

    animateDoors();

    // Move camera through doorway
    setTimeout(() => {
        animateCamera(
            camera.position.clone(),
            new THREE.Vector3(0, 1.6, 0),
            camera.rotation.clone(),
            new THREE.Euler(0, 0, 0),
            1000,
            () => {
                currentView = 'CORRIDOR';
                isAnimating = false;
                backBtn.classList.remove('hidden');
                backBtn.textContent = '← Exit Museum';
                wallHintLeft.classList.remove('hidden');
                wallHintRight.classList.remove('hidden');
                console.log('✅ In corridor');
            }
        );
    }, 400);
}

function viewWall(side) {
    if (isAnimating) return;
    isAnimating = true;
    console.log(`👀 Viewing ${side} wall...`);

    wallHintLeft.classList.add('hidden');
    wallHintRight.classList.add('hidden');

    const targetRot = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const targetPos = side === 'left' ? new THREE.Vector3(-3, 1.6, 0) : new THREE.Vector3(3, 1.6, 0);

    animateCamera(
        camera.position.clone(),
        targetPos,
        camera.rotation.clone(),
        new THREE.Euler(0, targetRot, 0),
        800,
        () => {
            currentView = side === 'left' ? 'WALL_LEFT' : 'WALL_RIGHT';
            isAnimating = false;
            backBtn.textContent = '← Back to Corridor';
            console.log(`✅ Viewing ${side} wall`);
        }
    );
}

function viewPaintingDetail(paintingData) {
    if (isAnimating) return;
    isAnimating = true;
    console.log(`🖼️ Viewing: ${paintingData.title}`);

    // Hide corridor
    corridorObjects.forEach(obj => obj.visible = false);

    // Dim background
    scene.background = new THREE.Color(0x1a1a1a);

    // Create detail view
    detailArtwork = new THREE.Group();
    detailArtwork.position.set(0, 1.6, 0);

    const size = 3;
    const depth = 0.15;

    // Canvas front (painted surface)
    const front = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshStandardMaterial({
            color: paintingData.color,
            roughness: 0.7,
            metalness: 0
        })
    );
    front.position.z = depth / 2;
    detailArtwork.add(front);

    // Canvas edges (for 3D depth)
    const edgeMat = new THREE.MeshStandardMaterial({
        color: 0xE8E0D5,
        roughness: 0.9
    });

    const topEdge = new THREE.Mesh(new THREE.BoxGeometry(size, 0.02, depth), edgeMat);
    topEdge.position.set(0, size / 2, 0);
    detailArtwork.add(topEdge);

    const bottomEdge = new THREE.Mesh(new THREE.BoxGeometry(size, 0.02, depth), edgeMat);
    bottomEdge.position.set(0, -size / 2, 0);
    detailArtwork.add(bottomEdge);

    const leftEdge = new THREE.Mesh(new THREE.BoxGeometry(0.02, size, depth), edgeMat);
    leftEdge.position.set(-size / 2, 0, 0);
    detailArtwork.add(leftEdge);

    const rightEdge = new THREE.Mesh(new THREE.BoxGeometry(0.02, size, depth), edgeMat);
    rightEdge.position.set(size / 2, 0, 0);
    detailArtwork.add(rightEdge);

    // Back of canvas (raw linen texture)
    const back = new THREE.Mesh(
        new THREE.PlaneGeometry(size - 0.1, size - 0.1),
        new THREE.MeshStandardMaterial({
            color: 0xD4C5A9,
            roughness: 0.95
        })
    );
    back.position.z = -depth / 2;
    back.rotation.y = Math.PI;
    detailArtwork.add(back);

    // Wooden support bars on back
    const barMat = new THREE.MeshStandardMaterial({
        color: 0x5D4E37,
        roughness: 0.8
    });
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(size - 0.4, 0.1, 0.04), barMat);
    bar1.position.set(0, size / 3, -depth / 2 - 0.02);
    detailArtwork.add(bar1);

    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(size - 0.4, 0.1, 0.04), barMat);
    bar2.position.set(0, -size / 3, -depth / 2 - 0.02);
    detailArtwork.add(bar2);

    // Dark wood frame
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0x3D2817,
        roughness: 0.6,
        metalness: 0.05
    });
    const frameThick = 0.18;
    const frameDepth = depth + 0.1;

    const topF = new THREE.Mesh(new THREE.BoxGeometry(size + 0.4, frameThick, frameDepth), frameMat);
    topF.position.y = size / 2 + frameThick / 2;
    detailArtwork.add(topF);

    const bottomF = new THREE.Mesh(new THREE.BoxGeometry(size + 0.4, frameThick, frameDepth), frameMat);
    bottomF.position.y = -(size / 2 + frameThick / 2);
    detailArtwork.add(bottomF);

    const leftF = new THREE.Mesh(new THREE.BoxGeometry(frameThick, size, frameDepth), frameMat);
    leftF.position.x = -(size / 2 + frameThick / 2);
    detailArtwork.add(leftF);

    const rightF = new THREE.Mesh(new THREE.BoxGeometry(frameThick, size, frameDepth), frameMat);
    rightF.position.x = size / 2 + frameThick / 2;
    detailArtwork.add(rightF);

    // Glass protection
    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(size + 0.2, size + 0.2),
        new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.03,
            roughness: 0.05,
            metalness: 0.1
        })
    );
    glass.position.z = depth / 2 + 0.05;
    detailArtwork.add(glass);

    scene.add(detailArtwork);
    selectedPainting = paintingData;

    // Add key light (main light from front-left)
    detailKeyLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    detailKeyLight.position.set(-3, 3, 5);
    detailKeyLight.target.position.set(0, 1.6, 0);
    scene.add(detailKeyLight);
    scene.add(detailKeyLight.target);

    // Add rim light (subtle back-right highlight)
    detailRimLight = new THREE.PointLight(0xFFF4E6, 0.4, 10);
    detailRimLight.position.set(2, 2, -2);
    scene.add(detailRimLight);

    animateCamera(
        camera.position.clone(),
        new THREE.Vector3(0, 1.6, 5),
        camera.rotation.clone(),
        new THREE.Euler(0, 0, 0),
        800,
        () => {
            currentView = 'DETAIL';
            isAnimating = false;
            backBtn.textContent = '← Back to Gallery';
            showInfo(paintingData);
            renderer.domElement.style.cursor = 'grab';
            console.log('✅ Detail view with enhanced lighting ready');
        }
    );
}

function goBack() {
    if (isAnimating) return;
    console.log('⬅️ Going back...');

    if (currentView === 'DETAIL') {
        // Return to wall
        if (detailArtwork) {
            scene.remove(detailArtwork);
            detailArtwork = null;
        }

        // Remove detail lights
        if (detailKeyLight) {
            scene.remove(detailKeyLight);
            scene.remove(detailKeyLight.target);
            detailKeyLight = null;
        }
        if (detailRimLight) {
            scene.remove(detailRimLight);
            detailRimLight = null;
        }

        // Restore corridor background
        scene.background = new THREE.Color(0x87CEEB);

        hideInfo();
        corridorObjects.forEach(obj => obj.visible = true);
        renderer.domElement.style.cursor = 'default';

        const side = camera.position.x < 0 ? 'left' : 'right';
        const targetRot = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
        const targetPos = side === 'left' ? new THREE.Vector3(-3, 1.6, 0) : new THREE.Vector3(3, 1.6, 0);

        isAnimating = true;
        animateCamera(
            camera.position.clone(),
            targetPos,
            camera.rotation.clone(),
            new THREE.Euler(0, targetRot, 0),
            800,
            () => {
                currentView = side === 'left' ? 'WALL_LEFT' : 'WALL_RIGHT';
                isAnimating = false;
                backBtn.textContent = '← Back to Corridor';
            }
        );
    } else if (currentView === 'WALL_LEFT' || currentView === 'WALL_RIGHT') {
        // Return to corridor
        isAnimating = true;
        animateCamera(
            camera.position.clone(),
            new THREE.Vector3(0, 1.6, 0),
            camera.rotation.clone(),
            new THREE.Euler(0, 0, 0),
            800,
            () => {
                currentView = 'CORRIDOR';
                isAnimating = false;
                backBtn.textContent = '← Exit Museum';
                wallHintLeft.classList.remove('hidden');
                wallHintRight.classList.remove('hidden');
            }
        );
    } else if (currentView === 'CORRIDOR') {
        // Return to entrance
        isAnimating = true;
        corridorObjects.forEach(obj => obj.visible = false);
        entranceDoor.visible = true;

        // Reset door positions
        leftDoor.rotation.y = 0;
        rightDoor.rotation.y = 0;

        animateCamera(
            camera.position.clone(),
            new THREE.Vector3(0, 1.6, 5),
            camera.rotation.clone(),
            new THREE.Euler(0, 0, 0),
            1000,
            () => {
                currentView = 'ENTRANCE';
                isAnimating = false;
                backBtn.classList.add('hidden');
                tooltip.classList.remove('hidden');
                wallHintLeft.classList.add('hidden');
                wallHintRight.classList.add('hidden');
            }
        );
    }
}

// ============================================
// ANIMATION & HELPERS
// ============================================

function animateCamera(fromPos, toPos, fromRot, toRot, duration, callback) {
    const startTime = Date.now();
    const startPos = fromPos.clone();
    const startRot = fromRot.clone();

    function update() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(startPos, toPos, eased);
        camera.rotation.x = THREE.MathUtils.lerp(startRot.x, toRot.x, eased);
        camera.rotation.y = THREE.MathUtils.lerp(startRot.y, toRot.y, eased);
        camera.rotation.z = THREE.MathUtils.lerp(startRot.z, toRot.z, eased);

        if (t < 1) {
            requestAnimationFrame(update);
        } else {
            if (callback) callback();
        }
    }

    update();
}

function animate() {
    requestAnimationFrame(animate);

    // Animate hovered painting (subtle zoom and glow)
    if (hoveredPainting && (currentView === 'WALL_LEFT' || currentView === 'WALL_RIGHT')) {
        const targetScale = 1.08;
        const currentScale = hoveredPainting.scale.x;
        hoveredPainting.scale.setScalar(THREE.MathUtils.lerp(currentScale, targetScale, 0.1));
    }

    // Reset scale for non-hovered paintings
    const allPaintings = [...leftWallPaintings, ...rightWallPaintings];
    allPaintings.forEach(painting => {
        if (painting !== hoveredPainting && painting.scale.x > 1.001) {
            painting.scale.setScalar(THREE.MathUtils.lerp(painting.scale.x, 1, 0.1));
        }
    });

    renderer.render(scene, camera);
}

// ============================================
// EVENT HANDLERS
// ============================================

function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Drag to rotate in detail view
    if (currentView === 'DETAIL' && isDragging && detailArtwork) {
        const deltaX = event.clientX - previousMouse.x;
        const deltaY = event.clientY - previousMouse.y;

        detailArtwork.rotation.y += deltaX * 0.01;
        detailArtwork.rotation.x += deltaY * 0.01;
        detailArtwork.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, detailArtwork.rotation.x));

        previousMouse = { x: event.clientX, y: event.clientY };
    }

    // Hover cursor and effects
    if (!isDragging && !isAnimating) {
        raycaster.setFromCamera(mouse, camera);
        let cursor = 'default';
        let foundHover = null;

        if (currentView === 'ENTRANCE') {
            const hits = raycaster.intersectObject(entranceDoor, true);
            if (hits.length > 0) cursor = 'pointer';
        } else if (currentView === 'CORRIDOR') {
            const hits = raycaster.intersectObjects(scene.children, true);
            for (let h of hits) {
                if (h.object.userData.clickable && h.object.userData.type === 'wall') {
                    cursor = 'pointer';
                    break;
                }
            }
        } else if (currentView === 'WALL_LEFT' || currentView === 'WALL_RIGHT') {
            const hits = raycaster.intersectObjects(scene.children, true);
            for (let h of hits) {
                let obj = h.object;
                while (obj.parent && !obj.userData.clickable) obj = obj.parent;
                if (obj.userData.type === 'painting') {
                    cursor = 'pointer';
                    foundHover = obj;
                    break;
                }
            }
        }

        hoveredPainting = foundHover;
        renderer.domElement.style.cursor = cursor;
    }
}

function onClick(event) {
    if (isAnimating) return;

    raycaster.setFromCamera(mouse, camera);

    if (currentView === 'ENTRANCE') {
        const hits = raycaster.intersectObject(entranceDoor, true);
        if (hits.length > 0) {
            console.log('🚪 Door clicked');
            enterCorridor();
        }
    } else if (currentView === 'CORRIDOR') {
        const hits = raycaster.intersectObjects(scene.children, true);
        for (let h of hits) {
            if (h.object.userData.clickable && h.object.userData.type === 'wall') {
                console.log(`Wall clicked: ${h.object.userData.side}`);
                viewWall(h.object.userData.side);
                break;
            }
        }
    } else if (currentView === 'WALL_LEFT' || currentView === 'WALL_RIGHT') {
        const hits = raycaster.intersectObjects(scene.children, true);
        for (let h of hits) {
            let obj = h.object;
            while (obj.parent && !obj.userData.clickable) obj = obj.parent;
            if (obj.userData.type === 'painting') {
                viewPaintingDetail(obj.userData.data);
                break;
            }
        }
    }
}

function onMouseDown(event) {
    if (currentView === 'DETAIL') {
        isDragging = true;
        previousMouse = { x: event.clientX, y: event.clientY };
        renderer.domElement.style.cursor = 'grabbing';
    }
}

function onMouseUp(event) {
    if (currentView === 'DETAIL') {
        isDragging = false;
        renderer.domElement.style.cursor = 'grab';
    }
}

function onWheel(event) {
    if (currentView === 'DETAIL') {
        event.preventDefault();
        const delta = event.deltaY * 0.002;
        camera.position.z = Math.max(2, Math.min(8, camera.position.z + delta));
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// UI FUNCTIONS
// ============================================

function showInfo(data) {
    document.getElementById('artwork-title').textContent = data.title;
    document.getElementById('artwork-artist').textContent = data.artist;
    document.getElementById('artwork-year').textContent = data.year;
    document.getElementById('artwork-medium').textContent = data.medium;
    document.getElementById('artwork-description').textContent = data.description;
    infoPanel.classList.remove('hidden');
}

function hideInfo() {
    infoPanel.classList.add('hidden');
}

// ============================================
// START
// ============================================

init();
