import * as THREE from 'three';

// ============================================
// INTERACTIVE ART MUSEUM - MASTER BUILD
// ============================================

console.log('🎨 Art Museum Initializing...');

// ============================================
// GLOBAL STATE
// ============================================

let scene, camera, renderer;
let currentView = 'ENTRANCE'; // ENTRANCE, CORRIDOR, WALL_LEFT, WALL_RIGHT, DETAIL
let isAnimating = false;
let selectedPainting = null;

// Scene Objects
let entranceDoor, leftDoorPanel, rightDoorPanel;
let corridorGroup = [];
let leftWallPaintings = [];
let rightWallPaintings = [];
let detailArtwork = null;
let hoveredPainting = null;

// Interaction
let raycaster, mouse;
let isDragging = false;
let previousMouse = { x: 0, y: 0 };

// Lighting
let detailKeyLight, detailRimLight, detailFillLight;

// UI Elements
const tooltip = document.getElementById('entrance-tooltip');
const backBtn = document.getElementById('back-button');
const infoPanel = document.getElementById('artwork-info');
const wallHintLeft = document.getElementById('wall-hint-left');
const wallHintRight = document.getElementById('wall-hint-right');

// ============================================
// ARTWORK DATA
// ============================================

const ARTWORKS = {
    left: [
        {
            title: "Starry Night",
            artist: "Vincent van Gogh",
            year: "1889",
            medium: "Oil on canvas",
            description: "A swirling, dreamlike vision of the night sky over a French village, expressing deep emotion through bold brushstrokes and vivid colors.",
            color: 0x2B4C7E
        },
        {
            title: "The Great Wave off Kanagawa",
            artist: "Katsushika Hokusai",
            year: "1831",
            medium: "Woodblock print",
            description: "An iconic Japanese ukiyo-e print depicting a towering wave threatening boats near Mount Fuji, symbolizing nature's power.",
            color: 0x1E5A8E
        },
        {
            title: "Girl with a Pearl Earring",
            artist: "Johannes Vermeer",
            year: "1665",
            medium: "Oil on canvas",
            description: "Often called the 'Mona Lisa of the North,' this intimate portrait captures a girl's enigmatic gaze and luminous pearl earring.",
            color: 0x8B7355
        }
    ],
    right: [
        {
            title: "The Scream",
            artist: "Edvard Munch",
            year: "1893",
            medium: "Oil, tempera, pastel",
            description: "An expressionist icon depicting overwhelming anxiety, with a distorted figure against a blood-red sky, representing universal human anguish.",
            color: 0xD94A3D
        },
        {
            title: "The Birth of Venus",
            artist: "Sandro Botticelli",
            year: "1485",
            medium: "Tempera on canvas",
            description: "A Renaissance masterpiece showing Venus emerging from the sea as a fully grown woman, embodying classical beauty and mythological grace.",
            color: 0xE8C4A8
        },
        {
            title: "The Kiss",
            artist: "Gustav Klimt",
            year: "1908",
            medium: "Oil and gold leaf",
            description: "A shimmering Art Nouveau work depicting lovers embraced in ornate golden robes, symbolizing passion, intimacy, and eternal love.",
            color: 0xD4AF37
        }
    ]
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('Initializing Three.js scene...');

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE8DCC8); // Warm exterior color
    scene.fog = new THREE.Fog(0xE8DCC8, 10, 50);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.set(0, 1.7, 8);
    camera.lookAt(0, 2.5, 0);

    // Renderer setup
    const canvas = document.getElementById('museum-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Raycaster for interactions
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lighting - warm outdoor lighting
    const ambientLight = new THREE.AmbientLight(0xFFF8E7, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFE4B5, 1.2);
    sunLight.position.set(10, 15, 10);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Additional fill light
    const fillLight = new THREE.DirectionalLight(0xB0C4DE, 0.4);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);

    console.log('✅ Scene, camera, renderer ready');

    // Build all scenes
    createEntranceScene();
    createCorridorScene();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    backBtn.addEventListener('click', goBack);

    console.log('✅ Event listeners attached');

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        tooltip.classList.remove('hidden');
    }, 500);

    // Start render loop
    animate();
    console.log('🎉 Museum ready!');
}

// ============================================
// SCENE CONSTRUCTION
// ============================================

function createEntranceScene() {
    console.log('Creating entrance scene...');

    // Stone ground with pattern
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0xC8B8A0,
        roughness: 0.8,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Museum facade - stone wall
    const facadeGeo = new THREE.BoxGeometry(12, 10, 0.8);
    const facadeMat = new THREE.MeshStandardMaterial({
        color: 0xD9CEB8,
        roughness: 0.9,
        metalness: 0
    });
    const facade = new THREE.Mesh(facadeGeo, facadeMat);
    facade.position.set(0, 5, -0.5);
    facade.receiveShadow = true;
    facade.castShadow = true;
    scene.add(facade);

    // Decorative cornice on top
    const corniceGeo = new THREE.BoxGeometry(13, 0.5, 1);
    const cornice = new THREE.Mesh(corniceGeo, facadeMat);
    cornice.position.set(0, 10.2, -0.5);
    scene.add(cornice);

    // Add "ART MUSEUM" text using geometry
    createMuseumSign();

    // Decorative relief panels
    for (let i = -1; i <= 1; i++) {
        if (i === 0) continue; // Skip center where door is
        const reliefGeo = new THREE.BoxGeometry(2, 2, 0.1);
        const reliefMat = new THREE.MeshStandardMaterial({
            color: 0xC8B8A0,
            roughness: 0.7,
            metalness: 0.1
        });
        const relief = new THREE.Mesh(reliefGeo, reliefMat);
        relief.position.set(i * 4, 7, -0.1);
        scene.add(relief);
    }

    // Pillars
    createPillar(-4.5, 0, 0);
    createPillar(4.5, 0, 0);

    // Museum door assembly
    entranceDoor = new THREE.Group();
    entranceDoor.position.set(0, 0, 0);

    // Door frame - ornate brass
    const frameGeo = new THREE.BoxGeometry(4.5, 5.5, 0.3);
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0xB8860B,
        roughness: 0.3,
        metalness: 0.7
    });
    const doorFrame = new THREE.Mesh(frameGeo, frameMat);
    doorFrame.position.set(0, 2.75, 0.05);
    entranceDoor.add(doorFrame);

    // Left door panel - pivot on LEFT edge for outward opening
    leftDoorPanel = new THREE.Group();
    leftDoorPanel.position.set(-2.15, 2.5, 0.1); // Position at left edge

    const leftDoorGeo = new THREE.BoxGeometry(2, 5, 0.15);
    const doorMat = new THREE.MeshStandardMaterial({
        color: 0x3E2723,
        roughness: 0.6,
        metalness: 0.1
    });
    const leftDoor = new THREE.Mesh(leftDoorGeo, doorMat);
    leftDoor.position.x = 1; // Door extends to the right from pivot
    leftDoor.castShadow = true;
    leftDoor.userData.clickable = true;
    leftDoor.userData.type = 'door';
    leftDoorPanel.add(leftDoor);

    // Left handle
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 12);
    const handleMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.2,
        metalness: 0.9
    });
    const leftHandle = new THREE.Mesh(handleGeo, handleMat);
    leftHandle.rotation.z = Math.PI / 2;
    leftHandle.position.set(1.6, 0, 0.12);
    leftDoorPanel.add(leftHandle);

    // Right door panel - pivot on RIGHT edge for outward opening
    rightDoorPanel = new THREE.Group();
    rightDoorPanel.position.set(2.15, 2.5, 0.1); // Position at right edge

    const rightDoor = new THREE.Mesh(leftDoorGeo, doorMat);
    rightDoor.position.x = -1; // Door extends to the left from pivot
    rightDoor.castShadow = true;
    rightDoor.userData.clickable = true;
    rightDoor.userData.type = 'door';
    rightDoorPanel.add(rightDoor);

    const rightHandle = new THREE.Mesh(handleGeo, handleMat);
    rightHandle.rotation.z = Math.PI / 2;
    rightHandle.position.set(-1.6, 0, 0.12);
    rightDoorPanel.add(rightHandle);

    entranceDoor.add(leftDoorPanel);
    entranceDoor.add(rightDoorPanel);
    scene.add(entranceDoor);

    console.log('✅ Entrance created');
}

function createMuseumSign() {
    // Create "ART MUSEUM" text using simple geometry
    const letterMat = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        roughness: 0.5,
        metalness: 0.3
    });

    // Simple box-based letters for "ART MUSEUM"
    const textGeo = new THREE.BoxGeometry(6, 0.4, 0.1);
    const textBg = new THREE.Mesh(textGeo, new THREE.MeshStandardMaterial({
        color: 0xA0907C,
        roughness: 0.7,
        metalness: 0.1
    }));
    textBg.position.set(0, 8.5, 0);
    scene.add(textBg);

    // Add simple letter shapes (A, R, T, M, U, S, E, U, M as boxes)
    const letters = [
        // A
        { x: -2.5, y: 8.5, w: 0.3, h: 0.25 },
        // R
        { x: -1.8, y: 8.5, w: 0.3, h: 0.25 },
        // T
        { x: -1.1, y: 8.5, w: 0.3, h: 0.25 },
        // Space
        // M
        { x: -0.2, y: 8.5, w: 0.4, h: 0.25 },
        // U
        { x: 0.5, y: 8.5, w: 0.3, h: 0.25 },
        // S
        { x: 1.1, y: 8.5, w: 0.3, h: 0.25 },
        // E
        { x: 1.7, y: 8.5, w: 0.3, h: 0.25 },
        // U
        { x: 2.3, y: 8.5, w: 0.3, h: 0.25 },
        // M
        { x: 2.9, y: 8.5, w: 0.4, h: 0.25 }
    ];

    letters.forEach(letter => {
        const letterGeo = new THREE.BoxGeometry(letter.w, letter.h, 0.08);
        const letterMesh = new THREE.Mesh(letterGeo, letterMat);
        letterMesh.position.set(letter.x, letter.y, 0.05);
        scene.add(letterMesh);
    });
}

function createPillar(x, y, z) {
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.5, 8, 16);
    const pillarMat = new THREE.MeshStandardMaterial({
        color: 0xD9CEB8,
        roughness: 0.8,
        metalness: 0.1
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(x, y + 4, z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    scene.add(pillar);

    // Capital
    const capGeo = new THREE.CylinderGeometry(0.6, 0.45, 0.4, 16);
    const cap = new THREE.Mesh(capGeo, pillarMat);
    cap.position.set(x, y + 8.2, z);
    scene.add(cap);
}

function createCorridorScene() {
    console.log('Creating corridor...');

    // Marble floor - long corridor
    const floorGeo = new THREE.PlaneGeometry(10, 25);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0xF5F5F0,
        roughness: 0.2,
        metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.visible = false;
    corridorGroup.push(floor);
    scene.add(floor);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(10, 25);
    const ceilingMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFF8,
        roughness: 0.9,
        metalness: 0
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4.5;
    ceiling.visible = false;
    corridorGroup.push(ceiling);
    scene.add(ceiling);

    // Recessed ceiling lights (warm museum lighting 3500-4200K)
    const warmLightColor = 0xFFF4E0;
    for (let i = -10; i <= 10; i += 5) {
        const ceilingLight = new THREE.SpotLight(warmLightColor, 0.6, 12, Math.PI / 6, 0.4);
        ceilingLight.position.set(0, 4.3, i);
        ceilingLight.target.position.set(0, 0, i);
        ceilingLight.visible = false;
        ceilingLight.castShadow = true;
        corridorGroup.push(ceilingLight);
        corridorGroup.push(ceilingLight.target);
        scene.add(ceilingLight);
        scene.add(ceilingLight.target);
    }

    // Walls - sandstone texture
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0xE8DCC8,
        roughness: 0.95,
        metalness: 0
    });

    // Left wall
    const leftWallGeo = new THREE.PlaneGeometry(25, 4.5);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-5, 2.25, 0);
    leftWall.receiveShadow = true;
    leftWall.userData.clickable = true;
    leftWall.userData.type = 'wall';
    leftWall.userData.side = 'left';
    leftWall.visible = false;
    corridorGroup.push(leftWall);
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(leftWallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(5, 2.25, 0);
    rightWall.receiveShadow = true;
    rightWall.userData.clickable = true;
    rightWall.userData.type = 'wall';
    rightWall.userData.side = 'right';
    rightWall.visible = false;
    corridorGroup.push(rightWall);
    scene.add(rightWall);

    // Front wall (end of corridor facing forward)
    const frontWallGeo = new THREE.PlaneGeometry(10, 4.5);
    const frontWall = new THREE.Mesh(frontWallGeo, wallMat);
    frontWall.position.set(0, 2.25, 12.5);
    frontWall.receiveShadow = true;
    frontWall.visible = false;
    corridorGroup.push(frontWall);
    scene.add(frontWall);

    // Back wall (behind camera)
    const backWall = new THREE.Mesh(frontWallGeo, wallMat);
    backWall.rotation.y = Math.PI;
    backWall.position.set(0, 2.25, -12.5);
    backWall.receiveShadow = true;
    backWall.visible = false;
    corridorGroup.push(backWall);
    scene.add(backWall);

    // Add decorative elements on front wall for depth
    const doorwayGeo = new THREE.BoxGeometry(3, 4, 0.3);
    const doorwayMat = new THREE.MeshStandardMaterial({
        color: 0xC8B8A0,
        roughness: 0.8,
        metalness: 0.1
    });
    const doorway = new THREE.Mesh(doorwayGeo, doorwayMat);
    doorway.position.set(0, 2, 12.4);
    doorway.visible = false;
    corridorGroup.push(doorway);
    scene.add(doorway);

    // Create paintings on both walls
    createWallPaintings('left', -4.85, leftWallPaintings);
    createWallPaintings('right', 4.85, rightWallPaintings);

    console.log('✅ Corridor created with depth');
}

function createWallPaintings(side, xPos, storageArray) {
    const artworks = ARTWORKS[side];
    const rotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

    artworks.forEach((artwork, i) => {
        const zPos = -8 + (i * 8); // Spacing: -8, 0, 8

        const paintingGroup = new THREE.Group();
        paintingGroup.position.set(xPos, 2.2, zPos);
        paintingGroup.rotation.y = rotation;
        paintingGroup.visible = false;
        paintingGroup.userData.clickable = true;
        paintingGroup.userData.type = 'painting';
        paintingGroup.userData.data = artwork;
        paintingGroup.userData.side = side;

        // Canvas with artwork color
        const canvasGeo = new THREE.PlaneGeometry(2.2, 2.2);
        const canvasMat = new THREE.MeshStandardMaterial({
            color: artwork.color,
            roughness: 0.7,
            metalness: 0
        });
        const canvas = new THREE.Mesh(canvasGeo, canvasMat);
        canvas.position.z = 0.03;
        paintingGroup.add(canvas);

        // Anti-reflection glass
        const glassGeo = new THREE.PlaneGeometry(2.3, 2.3);
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.08,
            roughness: 0.05,
            metalness: 0.2,
            envMapIntensity: 0.5
        });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.z = 0.08;
        paintingGroup.add(glass);

        // Dark walnut wood frame
        const frameColor = 0x3E2723;
        const frameMat = new THREE.MeshStandardMaterial({
            color: frameColor,
            roughness: 0.6,
            metalness: 0.1
        });

        const frameThick = 0.12;
        const frameDepth = 0.15;

        // Top frame
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, frameThick, frameDepth),
            frameMat
        );
        topFrame.position.y = 1.19;
        paintingGroup.add(topFrame);

        // Bottom frame
        const bottomFrame = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, frameThick, frameDepth),
            frameMat
        );
        bottomFrame.position.y = -1.19;
        paintingGroup.add(bottomFrame);

        // Left frame
        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThick, 2.26, frameDepth),
            frameMat
        );
        leftFrame.position.x = -1.19;
        paintingGroup.add(leftFrame);

        // Right frame
        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThick, 2.26, frameDepth),
            frameMat
        );
        rightFrame.position.x = 1.19;
        paintingGroup.add(rightFrame);

        // Brass plaque
        const plaqueGeo = new THREE.BoxGeometry(1.0, 0.15, 0.03);
        const plaqueMat = new THREE.MeshStandardMaterial({
            color: 0xB8860B,
            roughness: 0.3,
            metalness: 0.8
        });
        const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
        plaque.position.set(0, -1.45, 0.08);
        paintingGroup.add(plaque);

        // Dedicated wash light for this painting
        const washLight = new THREE.SpotLight(0xFFF4E0, 0.8, 6, Math.PI / 8, 0.5);
        washLight.position.copy(paintingGroup.position);
        washLight.position.y += 1.8;
        washLight.position.z += (side === 'left' ? -0.2 : 0.2);
        washLight.target.position.copy(paintingGroup.position);
        washLight.visible = false;
        washLight.castShadow = true;
        corridorGroup.push(washLight);
        corridorGroup.push(washLight.target);
        scene.add(washLight);
        scene.add(washLight.target);

        storageArray.push(paintingGroup);
        corridorGroup.push(paintingGroup);
        scene.add(paintingGroup);
    });

    console.log(`✅ Created ${artworks.length} paintings on ${side} wall`);
}

// ============================================
// VIEW TRANSITIONS
// ============================================

function enterMuseum() {
    if (isAnimating) return;
    isAnimating = true;
    console.log('🚶 Entering museum...');

    tooltip.classList.add('hidden');

    // Animate doors opening OUTWARD (向外打开)
    const duration = 1500;
    const startTime = Date.now();

    function animateDoorOpen() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(t);

        // Doors swing outward toward camera (positive Z rotation)
        leftDoorPanel.rotation.y = -eased * (Math.PI / 2.5); // Swing left outward
        rightDoorPanel.rotation.y = eased * (Math.PI / 2.5); // Swing right outward

        if (t < 1) {
            requestAnimationFrame(animateDoorOpen);
        } else {
            // Start white light transition
            createWhiteLightTransition();
        }
    }

    animateDoorOpen();
}

function createWhiteLightTransition() {
    // Create white overlay for heaven/portal effect
    const whiteFade = document.createElement('div');
    whiteFade.style.position = 'fixed';
    whiteFade.style.top = '0';
    whiteFade.style.left = '0';
    whiteFade.style.width = '100%';
    whiteFade.style.height = '100%';
    whiteFade.style.backgroundColor = 'white';
    whiteFade.style.opacity = '0';
    whiteFade.style.transition = 'opacity 0.8s ease-in';
    whiteFade.style.zIndex = '999';
    whiteFade.style.pointerEvents = 'none';
    document.body.appendChild(whiteFade);

    // Fade to white
    setTimeout(() => {
        whiteFade.style.opacity = '1';
    }, 50);

    // Transition scene during white out
    setTimeout(() => {
        entranceDoor.visible = false;
        scene.background = new THREE.Color(0xFAF8F3);
        scene.fog = new THREE.Fog(0xFAF8F3, 15, 30);
        corridorGroup.forEach(obj => obj.visible = true);

        // Move camera to corridor position
        camera.position.set(0, 1.7, -5); // Start from back of corridor
        camera.rotation.set(0, 0, 0);
        camera.lookAt(0, 1.7, 0);
    }, 800);

    // Fade from white
    setTimeout(() => {
        whiteFade.style.transition = 'opacity 1s ease-out';
        whiteFade.style.opacity = '0';
    }, 1000);

    // Complete transition
    setTimeout(() => {
        document.body.removeChild(whiteFade);
        currentView = 'CORRIDOR';
        isAnimating = false;
        backBtn.classList.remove('hidden');
        backBtn.textContent = '← Exit Museum';
        wallHintLeft.classList.remove('hidden');
        wallHintRight.classList.remove('hidden');
        console.log('✅ Inside corridor');
    }, 2000);
}

function viewWall(side) {
    if (isAnimating) return;
    isAnimating = true;
    console.log(`👁️ Viewing ${side} wall...`);

    wallHintLeft.classList.add('hidden');
    wallHintRight.classList.add('hidden');

    // Position camera to see all 3 paintings clearly
    // Camera should be in center of corridor, facing the wall
    const targetAngle = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const targetPos = side === 'left'
        ? new THREE.Vector3(-3.2, 1.7, 0) // Closer to left wall, centered vertically
        : new THREE.Vector3(3.2, 1.7, 0); // Closer to right wall, centered vertically

    animateCamera(
        camera.position.clone(),
        targetPos,
        camera.rotation.clone(),
        new THREE.Euler(0, targetAngle, 0),
        1000,
        () => {
            currentView = side === 'left' ? 'WALL_LEFT' : 'WALL_RIGHT';
            isAnimating = false;
            backBtn.textContent = '← Back to Corridor';
            console.log(`✅ Viewing ${side} wall - all 3 paintings visible`);
        }
    );
}

function viewArtworkDetail(artworkData) {
    if (isAnimating) return;
    isAnimating = true;
    console.log(`🖼️ Viewing: ${artworkData.title}`);

    // Hide corridor
    corridorGroup.forEach(obj => obj.visible = false);

    // Darken background
    scene.background = new THREE.Color(0x1C1C1C);
    scene.fog = new THREE.Fog(0x1C1C1C, 8, 15);

    // Create detailed 3D artwork
    detailArtwork = new THREE.Group();
    detailArtwork.position.set(0, 1.7, 0);

    const size = 3.5;
    const canvasDepth = 0.12;

    // Front canvas (painted surface)
    const frontGeo = new THREE.PlaneGeometry(size, size);
    const frontMat = new THREE.MeshStandardMaterial({
        color: artworkData.color,
        roughness: 0.75,
        metalness: 0
    });
    const front = new THREE.Mesh(frontGeo, frontMat);
    front.position.z = canvasDepth / 2;
    detailArtwork.add(front);

    // Canvas edges (visible when rotated)
    const edgeColor = 0xE8E0D0;
    const edgeMat = new THREE.MeshStandardMaterial({
        color: edgeColor,
        roughness: 0.9
    });

    const topEdge = new THREE.Mesh(
        new THREE.BoxGeometry(size, 0.02, canvasDepth),
        edgeMat
    );
    topEdge.position.y = size / 2;
    detailArtwork.add(topEdge);

    const bottomEdge = new THREE.Mesh(
        new THREE.BoxGeometry(size, 0.02, canvasDepth),
        edgeMat
    );
    bottomEdge.position.y = -size / 2;
    detailArtwork.add(bottomEdge);

    const leftEdge = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, size, canvasDepth),
        edgeMat
    );
    leftEdge.position.x = -size / 2;
    detailArtwork.add(leftEdge);

    const rightEdge = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, size, canvasDepth),
        edgeMat
    );
    rightEdge.position.x = size / 2;
    detailArtwork.add(rightEdge);

    // Back of canvas (linen texture)
    const backGeo = new THREE.PlaneGeometry(size - 0.15, size - 0.15);
    const backMat = new THREE.MeshStandardMaterial({
        color: 0xC8B896,
        roughness: 0.95
    });
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.z = -canvasDepth / 2;
    back.rotation.y = Math.PI;
    detailArtwork.add(back);

    // Wooden support bars (visible on back)
    const barMat = new THREE.MeshStandardMaterial({
        color: 0x5D4E37,
        roughness: 0.85
    });

    const bar1 = new THREE.Mesh(
        new THREE.BoxGeometry(size - 0.5, 0.12, 0.05),
        barMat
    );
    bar1.position.set(0, size / 3, -canvasDepth / 2 - 0.03);
    detailArtwork.add(bar1);

    const bar2 = new THREE.Mesh(
        new THREE.BoxGeometry(size - 0.5, 0.12, 0.05),
        barMat
    );
    bar2.position.set(0, -size / 3, -canvasDepth / 2 - 0.03);
    detailArtwork.add(bar2);

    const bar3 = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, size - 0.5, 0.05),
        barMat
    );
    bar3.position.set(0, 0, -canvasDepth / 2 - 0.03);
    detailArtwork.add(bar3);

    // Ornate frame
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0x3E2723,
        roughness: 0.5,
        metalness: 0.15
    });

    const frameThick = 0.2;
    const frameDepth = canvasDepth + 0.15;

    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(size + 0.5, frameThick, frameDepth),
        frameMat
    );
    topFrame.position.y = size / 2 + frameThick / 2;
    detailArtwork.add(topFrame);

    const bottomFrame = new THREE.Mesh(
        new THREE.BoxGeometry(size + 0.5, frameThick, frameDepth),
        frameMat
    );
    bottomFrame.position.y = -(size / 2 + frameThick / 2);
    detailArtwork.add(bottomFrame);

    const leftFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameThick, size, frameDepth),
        frameMat
    );
    leftFrame.position.x = -(size / 2 + frameThick / 2);
    detailArtwork.add(leftFrame);

    const rightFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameThick, size, frameDepth),
        frameMat
    );
    rightFrame.position.x = size / 2 + frameThick / 2;
    detailArtwork.add(rightFrame);

    // Protective glass with subtle reflection
    const glassGeo = new THREE.PlaneGeometry(size + 0.3, size + 0.3);
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.04,
        roughness: 0.02,
        metalness: 0.3
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.z = canvasDepth / 2 + 0.08;
    detailArtwork.add(glass);

    scene.add(detailArtwork);
    selectedPainting = artworkData;

    // Professional 3-point lighting
    // Key light (main light from upper left)
    detailKeyLight = new THREE.SpotLight(0xFFFFFF, 1.2, 15, Math.PI / 6, 0.4);
    detailKeyLight.position.set(-4, 4, 6);
    detailKeyLight.target.position.set(0, 1.7, 0);
    scene.add(detailKeyLight);
    scene.add(detailKeyLight.target);

    // Rim light (back-right highlight)
    detailRimLight = new THREE.PointLight(0xFFF4E0, 0.6, 12);
    detailRimLight.position.set(3, 2.5, -3);
    scene.add(detailRimLight);

    // Fill light (soft front fill)
    detailFillLight = new THREE.DirectionalLight(0xFFFFFF, 0.3);
    detailFillLight.position.set(2, 1, 5);
    scene.add(detailFillLight);

    // Animate camera to viewing position
    animateCamera(
        camera.position.clone(),
        new THREE.Vector3(0, 1.7, 6),
        camera.rotation.clone(),
        new THREE.Euler(0, 0, 0),
        1000,
        () => {
            currentView = 'DETAIL';
            isAnimating = false;
            backBtn.textContent = '← Back to Gallery';
            showArtworkInfo(artworkData);
            renderer.domElement.style.cursor = 'grab';
            console.log('✅ Detail view ready - 360° rotation enabled');
        }
    );
}

function goBack() {
    if (isAnimating) return;
    console.log('⬅️ Going back...');

    if (currentView === 'DETAIL') {
        // Clean up detail view
        if (detailArtwork) {
            scene.remove(detailArtwork);
            detailArtwork = null;
        }

        // Remove lighting
        if (detailKeyLight) scene.remove(detailKeyLight);
        if (detailRimLight) scene.remove(detailRimLight);
        if (detailFillLight) scene.remove(detailFillLight);
        if (detailKeyLight && detailKeyLight.target) scene.remove(detailKeyLight.target);
        detailKeyLight = detailRimLight = detailFillLight = null;

        // Restore corridor
        scene.background = new THREE.Color(0xFAF8F3);
        scene.fog = new THREE.Fog(0xFAF8F3, 15, 30);
        hideArtworkInfo();
        corridorGroup.forEach(obj => obj.visible = true);
        renderer.domElement.style.cursor = 'default';

        const side = camera.position.x < 0 ? 'left' : 'right';
        const targetAngle = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
        const targetPos = side === 'left'
            ? new THREE.Vector3(-3.2, 1.7, 0)
            : new THREE.Vector3(3.2, 1.7, 0);

        isAnimating = true;
        animateCamera(
            camera.position.clone(),
            targetPos,
            camera.rotation.clone(),
            new THREE.Euler(0, targetAngle, 0),
            800,
            () => {
                currentView = side === 'left' ? 'WALL_LEFT' : 'WALL_RIGHT';
                isAnimating = false;
                backBtn.textContent = '← Back to Corridor';
            }
        );

    } else if (currentView === 'WALL_LEFT' || currentView === 'WALL_RIGHT') {
        // Return to corridor center - position to see both walls
        isAnimating = true;
        animateCamera(
            camera.position.clone(),
            new THREE.Vector3(0, 1.7, -5), // Back of corridor looking forward
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
        // Exit to entrance
        isAnimating = true;
        corridorGroup.forEach(obj => obj.visible = false);
        entranceDoor.visible = true;

        // Reset doors
        leftDoorPanel.rotation.y = 0;
        rightDoorPanel.rotation.y = 0;

        scene.background = new THREE.Color(0xE8DCC8);
        scene.fog = new THREE.Fog(0xE8DCC8, 10, 50);

        animateCamera(
            camera.position.clone(),
            new THREE.Vector3(0, 1.7, 8),
            camera.rotation.clone(),
            new THREE.Euler(0, 0, 0),
            1200,
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
// CAMERA ANIMATION
// ============================================

function animateCamera(fromPos, toPos, fromRot, toRot, duration, callback) {
    const startTime = Date.now();
    const startPos = fromPos.clone();
    const startRot = fromRot.clone();

    function updateCamera() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(t);

        camera.position.lerpVectors(startPos, toPos, eased);
        camera.rotation.x = THREE.MathUtils.lerp(startRot.x, toRot.x, eased);
        camera.rotation.y = THREE.MathUtils.lerp(startRot.y, toRot.y, eased);
        camera.rotation.z = THREE.MathUtils.lerp(startRot.z, toRot.z, eased);

        if (t < 1) {
            requestAnimationFrame(updateCamera);
        } else {
            if (callback) callback();
        }
    }

    updateCamera();
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================
// RENDER LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);

    // Painting hover effect (scale up)
    if (hoveredPainting && (currentView === 'WALL_LEFT' || currentView === 'WALL_RIGHT')) {
        const targetScale = 1.05;
        hoveredPainting.scale.setScalar(
            THREE.MathUtils.lerp(hoveredPainting.scale.x, targetScale, 0.08)
        );
    }

    // Reset other paintings
    const allPaintings = [...leftWallPaintings, ...rightWallPaintings];
    allPaintings.forEach(painting => {
        if (painting !== hoveredPainting && painting.scale.x > 1.001) {
            painting.scale.setScalar(
                THREE.MathUtils.lerp(painting.scale.x, 1, 0.08)
            );
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

    // 360° rotation in detail view
    if (currentView === 'DETAIL' && isDragging && detailArtwork) {
        const deltaX = event.clientX - previousMouse.x;
        const deltaY = event.clientY - previousMouse.y;

        detailArtwork.rotation.y += deltaX * 0.008;
        detailArtwork.rotation.x += deltaY * 0.005;

        // Limit tilt
        detailArtwork.rotation.x = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, detailArtwork.rotation.x));

        previousMouse = { x: event.clientX, y: event.clientY };
    }

    // Hover detection
    if (!isDragging && !isAnimating) {
        raycaster.setFromCamera(mouse, camera);
        let cursor = 'default';
        let foundHover = null;

        if (currentView === 'ENTRANCE') {
            const hits = raycaster.intersectObject(entranceDoor, true);
            if (hits.length > 0) cursor = 'pointer';

        } else if (currentView === 'CORRIDOR') {
            const hits = raycaster.intersectObjects(scene.children, true);
            for (const hit of hits) {
                if (hit.object.userData.clickable && hit.object.userData.type === 'wall') {
                    cursor = 'pointer';
                    break;
                }
            }

        } else if (currentView === 'WALL_LEFT' || currentView === 'WALL_RIGHT') {
            const hits = raycaster.intersectObjects(scene.children, true);
            for (const hit of hits) {
                let obj = hit.object;
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
            enterMuseum();
        }

    } else if (currentView === 'CORRIDOR') {
        const hits = raycaster.intersectObjects(scene.children, true);
        for (const hit of hits) {
            if (hit.object.userData.clickable && hit.object.userData.type === 'wall') {
                console.log(`🖼️ ${hit.object.userData.side} wall clicked`);
                viewWall(hit.object.userData.side);
                break;
            }
        }

    } else if (currentView === 'WALL_LEFT' || currentView === 'WALL_RIGHT') {
        const hits = raycaster.intersectObjects(scene.children, true);
        for (const hit of hits) {
            let obj = hit.object;
            while (obj.parent && !obj.userData.clickable) obj = obj.parent;
            if (obj.userData.type === 'painting') {
                viewArtworkDetail(obj.userData.data);
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

function onMouseLeave(event) {
    if (currentView === 'DETAIL') {
        isDragging = false;
        renderer.domElement.style.cursor = 'grab';
    }
}

function onWheel(event) {
    if (currentView === 'DETAIL') {
        event.preventDefault();

        // Zoom: 2m to 9m range (up to 300% zoom)
        const delta = event.deltaY * 0.005;
        camera.position.z = Math.max(2, Math.min(9, camera.position.z + delta));
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

function showArtworkInfo(data) {
    document.getElementById('artwork-title').textContent = data.title;
    document.getElementById('artwork-artist').textContent = data.artist;
    document.getElementById('artwork-year').textContent = data.year;
    document.getElementById('artwork-medium').textContent = data.medium;
    document.getElementById('artwork-description').textContent = data.description;
    infoPanel.classList.remove('hidden');
}

function hideArtworkInfo() {
    infoPanel.classList.add('hidden');
}

// ============================================
// START APPLICATION
// ============================================

init();
