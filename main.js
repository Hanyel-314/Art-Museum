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
        80,
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

    // Pillars - moved to entrance area only, away from corridor
    createPillar(-4.5, 0, -1);
    createPillar(4.5, 0, -1);

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
    console.log('Creating baroque corridor...');

    // Enclosed gallery space
    const corridorLength = 20; // Shorter, enclosed space
    const corridorWidth = 12; // Wider corridor

    // Glossy marble floor with reflective properties
    const floorGeo = new THREE.PlaneGeometry(corridorWidth, corridorLength);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0xF8F4E8, // Cream marble
        roughness: 0.1, // Very glossy
        metalness: 0.4,
        envMapIntensity: 1.0
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.visible = false;
    corridorGroup.push(floor);
    scene.add(floor);

    // Baroque painted ceiling
    const ceilingGeo = new THREE.PlaneGeometry(corridorWidth, corridorLength);
    const ceilingMat = new THREE.MeshStandardMaterial({
        color: 0xE8D4B8, // Warm fresco color
        roughness: 0.9,
        metalness: 0
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 6; // Higher ceiling
    ceiling.visible = false;
    corridorGroup.push(ceiling);
    scene.add(ceiling);

    // Add baroque ceiling fresco panels
    createCeilingFrescoes(corridorLength);

    // Crystal chandeliers along the corridor - adjusted for shorter space
    for (let i = -6; i <= 6; i += 6) {
        createChandelier(0, 5.5, i);
    }

    // Warm museum lighting from chandeliers
    const warmLightColor = 0xFFE8C0; // Warm golden light
    for (let i = -8; i <= 8; i += 4) {
        const chandLight = new THREE.PointLight(warmLightColor, 0.8, 15);
        chandLight.position.set(0, 5.2, i);
        chandLight.visible = false;
        chandLight.castShadow = true;
        corridorGroup.push(chandLight);
        scene.add(chandLight);
    }

    // Walls with ornate decorations
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0xE8DCC0, // Rich cream
        roughness: 0.8,
        metalness: 0.05
    });

    // Left wall
    const leftWallGeo = new THREE.PlaneGeometry(corridorLength, 6);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-corridorWidth / 2, 3, 0);
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
    rightWall.position.set(corridorWidth / 2, 3, 0);
    rightWall.receiveShadow = true;
    rightWall.userData.clickable = true;
    rightWall.userData.type = 'wall';
    rightWall.userData.side = 'right';
    rightWall.visible = false;
    corridorGroup.push(rightWall);
    scene.add(rightWall);

    // Add gold moldings along walls
    createGoldMoldings(corridorLength, corridorWidth);

    // Front wall at vanishing point
    const frontWallGeo = new THREE.PlaneGeometry(corridorWidth, 6);
    const frontWall = new THREE.Mesh(frontWallGeo, wallMat);
    frontWall.position.set(0, 3, corridorLength / 2);
    frontWall.receiveShadow = true;
    frontWall.visible = false;
    corridorGroup.push(frontWall);
    scene.add(frontWall);

    // Back wall
    const backWall = new THREE.Mesh(frontWallGeo, wallMat);
    backWall.rotation.y = Math.PI;
    backWall.position.set(0, 3, -corridorLength / 2);
    backWall.receiveShadow = true;
    backWall.visible = false;
    corridorGroup.push(backWall);
    scene.add(backWall);

    // Create continuous rows of paintings on both walls
    createBaroquePaintings('left', -(corridorWidth / 2) + 0.15, leftWallPaintings);
    createBaroquePaintings('right', (corridorWidth / 2) - 0.15, rightWallPaintings);

    // Sculpture at the vanishing point
    createCorridorSculpture();

    console.log('✅ Baroque corridor created with dramatic perspective');
}

function createCeilingFrescoes(corridorLength) {
    // Create baroque fresco panels on ceiling
    const frescoPanels = [
        { color: 0xD4A574, z: -6 }, // Golden/amber tones
        { color: 0xB8C4D8, z: 0 },  // Sky blue
        { color: 0xE8C4A8, z: 6 }   // Peachy tones
    ];

    frescoPanels.forEach(panel => {
        const panelGeo = new THREE.PlaneGeometry(8, 8);
        const panelMat = new THREE.MeshStandardMaterial({
            color: panel.color,
            roughness: 0.9,
            metalness: 0,
            emissive: panel.color,
            emissiveIntensity: 0.1
        });
        const fresco = new THREE.Mesh(panelGeo, panelMat);
        fresco.rotation.x = Math.PI / 2;
        fresco.position.set(0, 5.95, panel.z);
        fresco.visible = false;
        corridorGroup.push(fresco);
        scene.add(fresco);

        // Gold border around fresco panel
        const borderGeo = new THREE.TorusGeometry(4.2, 0.08, 8, 24);
        const borderMat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            roughness: 0.3,
            metalness: 0.9
        });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.rotation.x = Math.PI / 2;
        border.position.set(0, 5.9, panel.z);
        border.visible = false;
        corridorGroup.push(border);
        scene.add(border);
    });

    console.log('✅ Ceiling frescoes created');
}

function createChandelier(x, y, z) {
    const chandelierGroup = new THREE.Group();
    chandelierGroup.position.set(x, y, z);
    chandelierGroup.visible = false;

    // Gold base
    const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.2, 12);
    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.2,
        metalness: 0.9
    });
    const base = new THREE.Mesh(baseGeo, goldMat);
    chandelierGroup.add(base);

    // Crystal elements
    const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.9
    });

    // Hanging crystals in a circle
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.5;
        const crystalGeo = new THREE.ConeGeometry(0.05, 0.3, 6);
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.set(
            Math.cos(angle) * radius,
            -0.3,
            Math.sin(angle) * radius
        );
        crystal.rotation.x = Math.PI;
        chandelierGroup.add(crystal);
    }

    corridorGroup.push(chandelierGroup);
    scene.add(chandelierGroup);
}

function createGoldMoldings(corridorLength, corridorWidth) {
    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xD4AF37, // Rich gold
        roughness: 0.3,
        metalness: 0.8
    });

    // Horizontal gold moldings along walls
    for (let side = -1; side <= 1; side += 2) {
        // Top molding
        const topMoldingGeo = new THREE.BoxGeometry(0.1, 0.15, corridorLength);
        const topMolding = new THREE.Mesh(topMoldingGeo, goldMat);
        topMolding.position.set(side * (corridorWidth / 2), 5.5, 0);
        topMolding.visible = false;
        corridorGroup.push(topMolding);
        scene.add(topMolding);

        // Middle molding
        const midMolding = new THREE.Mesh(topMoldingGeo, goldMat);
        midMolding.position.set(side * (corridorWidth / 2), 3, 0);
        midMolding.visible = false;
        corridorGroup.push(midMolding);
        scene.add(midMolding);

        // Base molding
        const baseMolding = new THREE.Mesh(topMoldingGeo, goldMat);
        baseMolding.position.set(side * (corridorWidth / 2), 0.5, 0);
        baseMolding.visible = false;
        corridorGroup.push(baseMolding);
        scene.add(baseMolding);
    }

    console.log('✅ Gold moldings created');
}

function createBaroquePaintings(side, xPos, storageArray) {
    const rotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

    // Create many paintings along the corridor (10 paintings per wall)
    const paintingCount = 10;
    const startZ = -18;
    const spacing = 3.8;

    for (let i = 0; i < paintingCount; i++) {
        const zPos = startZ + (i * spacing);

        // Select artwork data (cycle through available artworks)
        const artworks = ARTWORKS[side];
        const artwork = artworks[i % artworks.length];

        const paintingGroup = new THREE.Group();
        paintingGroup.position.set(xPos, 3, zPos);
        paintingGroup.rotation.y = rotation;
        paintingGroup.visible = false;
        paintingGroup.userData.clickable = true;
        paintingGroup.userData.type = 'painting';
        paintingGroup.userData.data = artwork;
        paintingGroup.userData.side = side;

        // Larger canvas for baroque gallery
        const canvasSize = 1.8;
        const canvasGeo = new THREE.PlaneGeometry(canvasSize, canvasSize);
        const canvasMat = new THREE.MeshStandardMaterial({
            color: artwork.color,
            roughness: 0.7,
            metalness: 0
        });
        const canvas = new THREE.Mesh(canvasGeo, canvasMat);
        canvas.position.z = 0.03;
        paintingGroup.add(canvas);

        // Anti-reflection glass
        const glassGeo = new THREE.PlaneGeometry(canvasSize + 0.1, canvasSize + 0.1);
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.05,
            roughness: 0.02,
            metalness: 0.3
        });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.z = 0.08;
        paintingGroup.add(glass);

        // Ornate gold frame
        const frameColor = 0xD4AF37; // Gold
        const frameMat = new THREE.MeshStandardMaterial({
            color: frameColor,
            roughness: 0.3,
            metalness: 0.8
        });

        const frameThick = 0.15;
        const frameDepth = 0.12;

        // Frame pieces
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(canvasSize + 0.3, frameThick, frameDepth),
            frameMat
        );
        topFrame.position.y = (canvasSize / 2) + (frameThick / 2);
        paintingGroup.add(topFrame);

        const bottomFrame = new THREE.Mesh(
            new THREE.BoxGeometry(canvasSize + 0.3, frameThick, frameDepth),
            frameMat
        );
        bottomFrame.position.y = -(canvasSize / 2) - (frameThick / 2);
        paintingGroup.add(bottomFrame);

        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThick, canvasSize, frameDepth),
            frameMat
        );
        leftFrame.position.x = -(canvasSize / 2) - (frameThick / 2);
        paintingGroup.add(leftFrame);

        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThick, canvasSize, frameDepth),
            frameMat
        );
        rightFrame.position.x = (canvasSize / 2) + (frameThick / 2);
        paintingGroup.add(rightFrame);

        // Wall light above painting
        const wallLight = new THREE.SpotLight(0xFFE8C0, 0.5, 4, Math.PI / 8, 0.4);
        wallLight.position.copy(paintingGroup.position);
        wallLight.position.y += 1.3;
        wallLight.position.z += (side === 'left' ? -0.15 : 0.15);
        wallLight.target.position.copy(paintingGroup.position);
        wallLight.visible = false;
        // Disable shadow for leftmost painting on left wall (index 0)
        wallLight.castShadow = !(side === 'left' && i === 0);
        corridorGroup.push(wallLight);
        corridorGroup.push(wallLight.target);
        scene.add(wallLight);
        scene.add(wallLight.target);

        storageArray.push(paintingGroup);
        corridorGroup.push(paintingGroup);
        scene.add(paintingGroup);
    }

    console.log(`✅ Created ${paintingCount} baroque paintings on ${side} wall`);
}

function createCorridorSculpture() {
    // Create an elegant classical sculpture at the end of the corridor
    const sculptureGroup = new THREE.Group();
    sculptureGroup.position.set(0, 0, 8); // Closer to viewer, at end wall
    sculptureGroup.visible = false;

    // Pedestal base
    const pedestalGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.3, 16);
    const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0xD9CEB8,
        roughness: 0.6,
        metalness: 0.2
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.15;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    sculptureGroup.add(pedestal);

    // Pedestal column
    const columnGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16);
    const column = new THREE.Mesh(columnGeo, pedestalMat);
    column.position.y = 0.9;
    column.castShadow = true;
    column.receiveShadow = true;
    sculptureGroup.add(column);

    // Top platform
    const platformGeo = new THREE.CylinderGeometry(0.6, 0.5, 0.15, 16);
    const platform = new THREE.Mesh(platformGeo, pedestalMat);
    platform.position.y = 1.575;
    platform.castShadow = true;
    platform.receiveShadow = true;
    sculptureGroup.add(platform);

    // Sculpture - abstract form (combination of spheres and cylinders)
    const sculptureMat = new THREE.MeshStandardMaterial({
        color: 0xF5F5F0, // Marble white
        roughness: 0.3,
        metalness: 0.1
    });

    // Main body - tall cylinder
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.8, 12);
    const body = new THREE.Mesh(bodyGeo, sculptureMat);
    body.position.y = 2.05;
    body.castShadow = true;
    sculptureGroup.add(body);

    // Head - sphere
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, sculptureMat);
    head.position.y = 2.6;
    head.castShadow = true;
    sculptureGroup.add(head);

    // Left arm - cylinder at angle
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 10);
    const leftArm = new THREE.Mesh(armGeo, sculptureMat);
    leftArm.position.set(-0.25, 2.1, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    sculptureGroup.add(leftArm);

    // Right arm
    const rightArm = new THREE.Mesh(armGeo, sculptureMat);
    rightArm.position.set(0.25, 2.1, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    sculptureGroup.add(rightArm);

    // Spotlight on sculpture
    const sculptureLight = new THREE.SpotLight(0xFFF4E0, 1.0, 10, Math.PI / 6, 0.5);
    sculptureLight.position.set(0, 4.2, 4); // Adjusted for new sculpture position
    sculptureLight.target = sculptureGroup;
    sculptureLight.visible = false;
    sculptureLight.castShadow = true;
    corridorGroup.push(sculptureLight);
    scene.add(sculptureLight);

    corridorGroup.push(sculptureGroup);
    scene.add(sculptureGroup);

    console.log('✅ Sculpture created at corridor end');
}

function createWallPaintings(side, xPos, storageArray) {
    const artworks = ARTWORKS[side];
    const rotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

    artworks.forEach((artwork, i) => {
        const zPos = -12 + (i * 6); // Spacing: -12, -6, 0 (closer to camera, evenly distributed)

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
        scene.fog = new THREE.Fog(0xFAF8F3, 15, 25); // Adjusted for shorter space
        corridorGroup.forEach(obj => obj.visible = true);

        // Move camera to corridor position - looking down the corridor
        camera.position.set(0, 1.7, -8); // Closer starting position
        camera.rotation.set(0, 0, 0);
        camera.lookAt(0, 2, 5); // Look toward sculpture
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

    // Smooth camera movement: move to center without clipping through geometry
    const targetAngle = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const targetPos = new THREE.Vector3(0, 2.2, -6); // Center of paintings, elevated

    // First rotate camera, then move (avoids clipping)
    const midRotation = new THREE.Euler(
        camera.rotation.x,
        targetAngle * 0.5, // Halfway rotation
        camera.rotation.z
    );

    animateCamera(
        camera.position.clone(),
        targetPos,
        camera.rotation.clone(),
        new THREE.Euler(0, targetAngle, 0),
        1200, // Slower transition for smoothness
        () => {
            currentView = side === 'left' ? 'WALL_LEFT' : 'WALL_RIGHT';
            isAnimating = false;
            backBtn.textContent = '← Back to Corridor';
            backBtn.classList.remove('hidden'); // Show back button
            console.log(`✅ Viewing ${side} wall - all 3 paintings visible`);
        }
    );
}

function viewArtworkDetail(artworkData) {
    if (isAnimating) return;
    isAnimating = true;
    console.log(`🖼️ Viewing: ${artworkData.title}`);

    // Create white light transition effect (like entering museum)
    createPaintingWhiteLightTransition(artworkData);
}

function createPaintingWhiteLightTransition(artworkData) {
    // Create white overlay for transition effect
    const whiteFade = document.createElement('div');
    whiteFade.style.position = 'fixed';
    whiteFade.style.top = '0';
    whiteFade.style.left = '0';
    whiteFade.style.width = '100%';
    whiteFade.style.height = '100%';
    whiteFade.style.background = 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 100%)';
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
        // Hide corridor
        corridorGroup.forEach(obj => obj.visible = false);

        // Darken background
        scene.background = new THREE.Color(0x000000); // Completely black space
        scene.fog = new THREE.Fog(0x000000, 8, 15);

        // Create detailed 3D artwork - positioned on the LEFT side
        detailArtwork = new THREE.Group();
        detailArtwork.position.set(-2.5, 1.7, 0); // Move to left side

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

        // Professional 3-point lighting focused on left-side painting
        // Key light (main light from upper left)
        detailKeyLight = new THREE.SpotLight(0xFFFFFF, 1.2, 15, Math.PI / 6, 0.4);
        detailKeyLight.position.set(-6, 4, 6);
        detailKeyLight.target.position.set(-2.5, 1.7, 0); // Point to painting on left
        scene.add(detailKeyLight);
        scene.add(detailKeyLight.target);

        // Rim light (back-right highlight)
        detailRimLight = new THREE.PointLight(0xFFF4E0, 0.6, 12);
        detailRimLight.position.set(1, 2.5, -3);
        scene.add(detailRimLight);

        // Fill light (soft front fill)
        detailFillLight = new THREE.DirectionalLight(0xFFFFFF, 0.3);
        detailFillLight.position.set(0, 1, 5);
        scene.add(detailFillLight);

        // Set camera to viewing position
        camera.position.set(0, 1.7, 6);
        camera.rotation.set(0, 0, 0);
        camera.lookAt(-2.5, 1.7, 0); // Look at painting on left
    }, 800);

    // Fade from white
    setTimeout(() => {
        whiteFade.style.transition = 'opacity 1s ease-out';
        whiteFade.style.opacity = '0';
    }, 1000);

    // Complete transition
    setTimeout(() => {
        document.body.removeChild(whiteFade);
        currentView = 'DETAIL';
        isAnimating = false;
        backBtn.textContent = '← Back to Gallery';
        backBtn.classList.remove('hidden');
        showArtworkInfo(artworkData);
        renderer.domElement.style.cursor = 'grab';
        console.log('✅ Detail view ready - 360° rotation enabled');
    }, 2000);
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
        scene.fog = new THREE.Fog(0xFAF8F3, 15, 25); // Match corridor fog settings
        hideArtworkInfo();
        corridorGroup.forEach(obj => obj.visible = true);
        renderer.domElement.style.cursor = 'default';

        // Determine which wall we were viewing based on camera rotation
        const side = Math.abs(camera.rotation.y - Math.PI / 2) < 0.1 ? 'left' : 'right';
        const targetAngle = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
        const targetPos = new THREE.Vector3(0, 2.2, -6);

        isAnimating = true;
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
                backBtn.classList.remove('hidden'); // Show back button
            }
        );

    } else if (currentView === 'WALL_LEFT' || currentView === 'WALL_RIGHT') {
        // Return to corridor center - position to see both walls
        isAnimating = true;
        animateCamera(
            camera.position.clone(),
            new THREE.Vector3(0, 1.7, -8), // Adjusted for shorter corridor
            camera.rotation.clone(),
            new THREE.Euler(0, 0, 0),
            800,
            () => {
                currentView = 'CORRIDOR';
                isAnimating = false;
                backBtn.textContent = '← Exit Museum';
                wallHintLeft.classList.remove('hidden');
                wallHintRight.classList.remove('hidden');
                camera.lookAt(0, 2, 5); // Look toward sculpture at end
            }
        );

    }
    // Removed: Exit to entrance - user stays in museum
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
