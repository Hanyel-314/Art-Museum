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
let corridorObjects = [];
let leftWallPaintings = [];
let rightWallPaintings = [];
let detailArtwork = null;

// Mouse interaction
let raycaster, mouse;
let isDragging = false;
let previousMouse = { x: 0, y: 0 };

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

    // Renderer
    const canvas = document.getElementById('museum-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lights - bright for visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

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
}

// ============================================
// SCENE CREATION
// ============================================

function createEntranceScene() {
    console.log('Creating entrance...');

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshLambertMaterial({ color: 0x90EE90 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Door
    entranceDoor = new THREE.Group();

    const doorBody = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    );
    doorBody.position.y = 2;
    doorBody.userData.clickable = true;
    doorBody.userData.type = 'door';
    entranceDoor.add(doorBody);

    // Door outline
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(3, 4, 0.2));
    const edgesMat = new THREE.LineBasicMaterial({ color: 0xFFD700, linewidth: 2 });
    const outline = new THREE.LineSegments(edges, edgesMat);
    outline.position.y = 2;
    entranceDoor.add(outline);

    scene.add(entranceDoor);
    console.log('✅ Entrance created');
}

function createCorridorScene() {
    console.log('Creating corridor...');

    // Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 30),
        new THREE.MeshLambertMaterial({ color: 0xF5F5F5 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.visible = false;
    corridorObjects.push(floor);
    scene.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 30),
        new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4;
    ceiling.visible = false;
    corridorObjects.push(ceiling);
    scene.add(ceiling);

    // Left wall
    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 4),
        new THREE.MeshLambertMaterial({ color: 0xE8E8E8 })
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-5, 2, 0);
    leftWall.userData.clickable = true;
    leftWall.userData.type = 'wall';
    leftWall.userData.side = 'left';
    leftWall.visible = false;
    corridorObjects.push(leftWall);
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 4),
        new THREE.MeshLambertMaterial({ color: 0xE8E8E8 })
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(5, 2, 0);
    rightWall.userData.clickable = true;
    rightWall.userData.type = 'wall';
    rightWall.userData.side = 'right';
    rightWall.visible = false;
    corridorObjects.push(rightWall);
    scene.add(rightWall);

    // Create paintings
    createPaintings('left', -4.9, leftWallPaintings);
    createPaintings('right', 4.9, rightWallPaintings);

    console.log('✅ Corridor created');
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

        // Canvas
        const canvas = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.MeshLambertMaterial({ color: data.color })
        );
        frame.add(canvas);

        // Frame
        const frameThickness = 0.1;
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x3D2817 });

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

        // Light above painting
        const light = new THREE.PointLight(0xFFFFEE, 0.5, 5);
        light.position.copy(frame.position);
        light.position.y += 1;
        light.visible = false;
        corridorObjects.push(light);
        scene.add(light);

        storageArray.push(frame);
        corridorObjects.push(frame);
        scene.add(frame);
    });

    console.log(`✅ Created ${paintings.length} paintings on ${side}`);
}

// ============================================
// VIEW TRANSITIONS
// ============================================

function enterCorridor() {
    if (isAnimating) return;
    isAnimating = true;
    console.log('🚶 Entering corridor...');

    tooltip.classList.add('hidden');
    entranceDoor.visible = false;

    corridorObjects.forEach(obj => obj.visible = true);

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

    // Create detail view
    detailArtwork = new THREE.Group();
    detailArtwork.position.set(0, 1.6, 0);

    const size = 3;
    const depth = 0.2;

    // Front
    const front = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshLambertMaterial({ color: paintingData.color })
    );
    front.position.z = depth / 2;
    detailArtwork.add(front);

    // Back
    const back = new THREE.Mesh(
        new THREE.PlaneGeometry(size - 0.2, size - 0.2),
        new THREE.MeshLambertMaterial({ color: 0xD4C5A9 })
    );
    back.position.z = -depth / 2;
    back.rotation.y = Math.PI;
    detailArtwork.add(back);

    // Support bars on back
    const barMat = new THREE.MeshLambertMaterial({ color: 0x5D4E37 });
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(size - 0.3, 0.08, 0.03), barMat);
    bar1.position.set(0, size / 3, -depth / 2 - 0.02);
    detailArtwork.add(bar1);

    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(size - 0.3, 0.08, 0.03), barMat);
    bar2.position.set(0, -size / 3, -depth / 2 - 0.02);
    detailArtwork.add(bar2);

    // Frame
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x3D2817 });
    const frameThick = 0.15;

    const topF = new THREE.Mesh(new THREE.BoxGeometry(size + 0.3, frameThick, depth), frameMat);
    topF.position.y = size / 2 + frameThick / 2;
    detailArtwork.add(topF);

    const bottomF = new THREE.Mesh(new THREE.BoxGeometry(size + 0.3, frameThick, depth), frameMat);
    bottomF.position.y = -(size / 2 + frameThick / 2);
    detailArtwork.add(bottomF);

    const leftF = new THREE.Mesh(new THREE.BoxGeometry(frameThick, size, depth), frameMat);
    leftF.position.x = -(size / 2 + frameThick / 2);
    detailArtwork.add(leftF);

    const rightF = new THREE.Mesh(new THREE.BoxGeometry(frameThick, size, depth), frameMat);
    rightF.position.x = size / 2 + frameThick / 2;
    detailArtwork.add(rightF);

    scene.add(detailArtwork);
    selectedPainting = paintingData;

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
            console.log('✅ Detail view ready');
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

    // Subtle door sway
    if (currentView === 'ENTRANCE' && entranceDoor) {
        entranceDoor.rotation.y = Math.sin(Date.now() * 0.001) * 0.02;
    }

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

    // Hover cursor
    if (!isDragging && !isAnimating) {
        raycaster.setFromCamera(mouse, camera);
        let cursor = 'default';

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
                    break;
                }
            }
        }

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
