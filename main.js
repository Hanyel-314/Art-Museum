import * as THREE from 'three';

// ============================================
// CONSTANTS AND CONFIGURATION
// ============================================

const SCENES = {
    ENTRANCE: 'entrance',
    CORRIDOR: 'corridor',
    WALL_LEFT: 'wall_left',
    WALL_RIGHT: 'wall_right',
    ARTWORK_DETAIL: 'artwork_detail'
};

const PAINTINGS_DATA = {
    left: [
        {
            title: "Starry Night",
            artist: "Vincent van Gogh",
            year: "1889",
            medium: "Oil on canvas",
            description: "An iconic post-impressionist masterpiece depicting a swirling night sky over a French village. The painting captures van Gogh's unique vision of the night sky from his asylum room window.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1200px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg"
        },
        {
            title: "The Great Wave off Kanagawa",
            artist: "Katsushika Hokusai",
            year: "1831",
            medium: "Woodblock print",
            description: "A stunning Japanese woodblock print featuring an enormous wave threatening boats off the coast of Kanagawa. Mount Fuji can be seen in the background, creating a powerful composition of nature's force.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1200px-Tsunami_by_hokusai_19th_century.jpg"
        },
        {
            title: "Girl with a Pearl Earring",
            artist: "Johannes Vermeer",
            year: "1665",
            medium: "Oil on canvas",
            description: "Often called the 'Mona Lisa of the North,' this Dutch Golden Age painting captures a girl in exotic dress wearing a large pearl earring, with a captivating gaze that has mesmerized viewers for centuries.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg"
        }
    ],
    right: [
        {
            title: "The Scream",
            artist: "Edvard Munch",
            year: "1893",
            medium: "Oil, tempera, pastel and crayon on cardboard",
            description: "An expressionist masterpiece depicting an agonized figure against a tumultuous orange sky. The painting represents universal anxiety and has become an iconic image of human emotion.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg"
        },
        {
            title: "The Birth of Venus",
            artist: "Sandro Botticelli",
            year: "1485",
            medium: "Tempera on canvas",
            description: "A Renaissance masterpiece depicting the goddess Venus emerging from the sea as a fully grown woman. The painting represents divine love and beauty with graceful flowing lines and mythological elegance.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1200px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg"
        },
        {
            title: "The Kiss",
            artist: "Gustav Klimt",
            year: "1908",
            medium: "Oil and gold leaf on canvas",
            description: "A symbol of Vienna Secession, this painting shows a couple embraced in elaborate robes decorated with intricate patterns. The use of gold leaf creates a shimmering, dreamlike quality.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/800px-Gustav_Klimt_016.jpg"
        }
    ]
};

// ============================================
// GLOBAL VARIABLES
// ============================================

let scene, camera, renderer;
let currentScene = SCENES.ENTRANCE;
let raycaster, mouse;
let doorGroup, corridorGroup, leftWallGroup, rightWallGroup;
let currentArtwork = null;
let isAnimating = false;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let artworkRotationY = 0;
let artworkRotationX = 0;

// UI Elements
let loadingScreen, entranceTooltip, backButton, artworkInfo;
let wallHintLeft, wallHintRight;

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Get DOM elements
    loadingScreen = document.getElementById('loading-screen');
    entranceTooltip = document.getElementById('entrance-tooltip');
    backButton = document.getElementById('back-button');
    artworkInfo = document.getElementById('artwork-info');
    wallHintLeft = document.getElementById('wall-hint-left');
    wallHintRight = document.getElementById('wall-hint-right');

    // Setup Three.js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.6, 8);

    // Renderer
    const canvas = document.getElementById('museum-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance"
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

    // Create scenes
    createEntranceScene();
    createCorridorScene();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    canvas.addEventListener('click', onMouseClick);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onMouseWheel);
    backButton.addEventListener('click', onBackButtonClick);

    // Start animation loop
    animate();

    // Hide loading screen
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            if (currentScene === SCENES.ENTRANCE) {
                entranceTooltip.classList.remove('hidden');
            }
        }, 500);
    }, 1500);
}

// ============================================
// SCENE CREATION
// ============================================

function createEntranceScene() {
    doorGroup = new THREE.Group();
    doorGroup.visible = true;

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.3,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    doorGroup.add(ground);

    // Door frame (stone arch)
    const frameGeometry = new THREE.BoxGeometry(5, 6, 0.5);
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.8
    });
    const doorFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    doorFrame.position.set(0, 3, 0);
    doorGroup.add(doorFrame);

    // Left door
    const doorGeometry = new THREE.BoxGeometry(2.2, 5, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d2817,
        roughness: 0.9,
        metalness: 0.1
    });

    const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial);
    leftDoor.position.set(-1.1, 2.5, 0.2);
    leftDoor.castShadow = true;
    leftDoor.userData.isDoor = true;
    doorGroup.add(leftDoor);

    // Right door
    const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial);
    rightDoor.position.set(1.1, 2.5, 0.2);
    rightDoor.castShadow = true;
    rightDoor.userData.isDoor = true;
    doorGroup.add(rightDoor);

    // Door handles
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.8
    });

    const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    leftHandle.position.set(-0.3, 2.5, 0.35);
    leftHandle.rotation.z = Math.PI / 2;
    doorGroup.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    rightHandle.position.set(0.3, 2.5, 0.35);
    rightHandle.rotation.z = Math.PI / 2;
    doorGroup.add(rightHandle);

    // Rim light on door
    const rimLight = new THREE.PointLight(0xffd700, 0.5, 10);
    rimLight.position.set(0, 3, 1);
    doorGroup.add(rimLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    doorGroup.add(ambientLight);

    // Main directional light
    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    doorGroup.add(dirLight);

    scene.add(doorGroup);
}

function createCorridorScene() {
    corridorGroup = new THREE.Group();
    corridorGroup.visible = false;

    // Floor - Polished white marble
    const floorGeometry = new THREE.PlaneGeometry(8, 25);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        roughness: 0.2,
        metalness: 0.3,
        envMapIntensity: 1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    corridorGroup.add(floor);

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(8, 25);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.7
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4;
    corridorGroup.add(ceiling);

    // Left Wall
    const leftWallGeometry = new THREE.PlaneGeometry(25, 4);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8dcc6,
        roughness: 0.8
    });
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-4, 2, 0);
    leftWall.receiveShadow = true;
    leftWall.userData.isWall = true;
    leftWall.userData.wallSide = 'left';
    corridorGroup.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(4, 2, 0);
    rightWall.receiveShadow = true;
    rightWall.userData.isWall = true;
    rightWall.userData.wallSide = 'right';
    corridorGroup.add(rightWall);

    // Create paintings on walls
    createWallPaintings('left', corridorGroup);
    createWallPaintings('right', corridorGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    corridorGroup.add(ambientLight);

    // Ceiling lights
    for (let i = -8; i <= 8; i += 4) {
        const ceilingLight = new THREE.RectAreaLight(0xffffee, 3, 2, 2);
        ceilingLight.position.set(0, 3.9, i);
        ceilingLight.rotation.x = -Math.PI / 2;
        corridorGroup.add(ceilingLight);
    }

    // Spotlight for paintings - left wall
    PAINTINGS_DATA.left.forEach((_, index) => {
        const zPos = -6 + (index * 6);
        const spotlight = new THREE.SpotLight(0xffffee, 2, 10, Math.PI / 6, 0.5);
        spotlight.position.set(-3, 3.5, zPos);
        spotlight.target.position.set(-4, 2, zPos);
        spotlight.castShadow = true;
        corridorGroup.add(spotlight);
        corridorGroup.add(spotlight.target);
    });

    // Spotlight for paintings - right wall
    PAINTINGS_DATA.right.forEach((_, index) => {
        const zPos = -6 + (index * 6);
        const spotlight = new THREE.SpotLight(0xffffee, 2, 10, Math.PI / 6, 0.5);
        spotlight.position.set(3, 3.5, zPos);
        spotlight.target.position.set(4, 2, zPos);
        spotlight.castShadow = true;
        corridorGroup.add(spotlight);
        corridorGroup.add(spotlight.target);
    });

    scene.add(corridorGroup);
}

function createWallPaintings(side, parentGroup) {
    const xPos = side === 'left' ? -3.95 : 3.95;
    const rotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const paintings = PAINTINGS_DATA[side];

    paintings.forEach((paintingData, index) => {
        const zPos = -6 + (index * 6);

        // Frame group
        const frameGroup = new THREE.Group();
        frameGroup.position.set(xPos, 2, zPos);
        frameGroup.rotation.y = rotation;
        frameGroup.userData.isPainting = true;
        frameGroup.userData.paintingData = paintingData;
        frameGroup.userData.paintingSide = side;
        frameGroup.userData.paintingIndex = index;

        // Wood frame
        const frameThickness = 0.08;
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d1f1a,
            roughness: 0.6,
            metalness: 0.1
        });

        // Frame borders
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.15, frameThickness),
            frameMaterial
        );
        topFrame.position.y = 1.15;
        frameGroup.add(topFrame);

        const bottomFrame = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.15, frameThickness),
            frameMaterial
        );
        bottomFrame.position.y = -1.15;
        frameGroup.add(bottomFrame);

        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 2, frameThickness),
            frameMaterial
        );
        leftFrame.position.x = -1.075;
        frameGroup.add(leftFrame);

        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 2, frameThickness),
            frameMaterial
        );
        rightFrame.position.x = 1.075;
        frameGroup.add(rightFrame);

        // Glass overlay
        const glassGeometry = new THREE.PlaneGeometry(2, 2);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            roughness: 0.1,
            metalness: 0.1,
            reflectivity: 0.5,
            clearcoat: 1,
            clearcoatRoughness: 0.1
        });
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.z = 0.01;
        frameGroup.add(glass);

        // Painting image
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            paintingData.imageUrl,
            (texture) => {
                const paintingMaterial = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.8
                });
                const paintingMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(2, 2),
                    paintingMaterial
                );
                paintingMesh.position.z = -0.02;
                frameGroup.add(paintingMesh);
            },
            undefined,
            (error) => {
                console.error('Error loading texture:', error);
                // Fallback color
                const fallbackMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8b7355
                });
                const paintingMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(2, 2),
                    fallbackMaterial
                );
                paintingMesh.position.z = -0.02;
                frameGroup.add(paintingMesh);
            }
        );

        // Plaque
        const plaqueGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.02);
        const plaqueMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.4,
            metalness: 0.6
        });
        const plaque = new THREE.Mesh(plaqueGeometry, plaqueMaterial);
        plaque.position.y = -1.4;
        plaque.position.z = 0.01;
        frameGroup.add(plaque);

        parentGroup.add(frameGroup);
    });
}

// ============================================
// SCENE TRANSITIONS
// ============================================

function transitionToScene(targetScene, data = {}) {
    if (isAnimating) return;
    isAnimating = true;

    // Hide tooltips
    entranceTooltip.classList.add('hidden');
    wallHintLeft.classList.add('hidden');
    wallHintRight.classList.add('hidden');

    switch (targetScene) {
        case SCENES.CORRIDOR:
            transitionToCorridor();
            break;
        case SCENES.WALL_LEFT:
            transitionToWall('left');
            break;
        case SCENES.WALL_RIGHT:
            transitionToWall('right');
            break;
        case SCENES.ARTWORK_DETAIL:
            transitionToArtworkDetail(data.paintingData, data.frameGroup);
            break;
        case SCENES.ENTRANCE:
            transitionToEntrance();
            break;
    }
}

function transitionToCorridor() {
    // Animate door opening
    const leftDoor = doorGroup.children.find(child =>
        child.position.x < 0 && child.userData.isDoor
    );
    const rightDoor = doorGroup.children.find(child =>
        child.position.x > 0 && child.userData.isDoor
    );

    animateValue(0, 1, 800, (progress) => {
        if (leftDoor) leftDoor.rotation.y = progress * Math.PI / 2;
        if (rightDoor) rightDoor.rotation.y = -progress * Math.PI / 2;
    });

    // Move camera into corridor
    animateCamera(
        camera.position,
        new THREE.Vector3(0, 1.6, 0),
        camera.rotation,
        new THREE.Euler(0, 0, 0),
        1000,
        () => {
            doorGroup.visible = false;
            corridorGroup.visible = true;
            currentScene = SCENES.CORRIDOR;
            isAnimating = false;
            backButton.classList.remove('hidden');
            backButton.textContent = '← Back to Entrance';

            // Show wall hints
            setTimeout(() => {
                wallHintLeft.classList.remove('hidden');
                wallHintRight.classList.remove('hidden');
            }, 500);
        }
    );
}

function transitionToWall(side) {
    const targetRotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const targetPosition = side === 'left'
        ? new THREE.Vector3(-2, 1.6, 0)
        : new THREE.Vector3(2, 1.6, 0);

    animateCamera(
        camera.position,
        targetPosition,
        camera.rotation,
        new THREE.Euler(0, targetRotation, 0),
        800,
        () => {
            currentScene = side === 'left' ? SCENES.WALL_LEFT : SCENES.WALL_RIGHT;
            isAnimating = false;
            backButton.textContent = '← Back to Corridor';
        }
    );
}

function transitionToArtworkDetail(paintingData, frameGroup) {
    // Store original frame position
    const originalPosition = frameGroup.position.clone();
    const originalRotation = frameGroup.rotation.clone();

    // Create isolated artwork view
    currentArtwork = createDetailedArtwork(paintingData);
    scene.add(currentArtwork);

    // Position camera for detail view
    const targetCameraPos = new THREE.Vector3(0, 1.6, 5);

    animateCamera(
        camera.position,
        targetCameraPos,
        camera.rotation,
        new THREE.Euler(0, 0, 0),
        800,
        () => {
            corridorGroup.visible = false;
            currentScene = SCENES.ARTWORK_DETAIL;
            isAnimating = false;
            artworkRotationY = 0;
            artworkRotationX = 0;

            // Show info panel
            showArtworkInfo(paintingData);
            backButton.textContent = '← Back to Gallery';

            // Enable drag cursor
            renderer.domElement.classList.add('grab');
        }
    );
}

function transitionToEntrance() {
    animateCamera(
        camera.position,
        new THREE.Vector3(0, 1.6, 8),
        camera.rotation,
        new THREE.Euler(0, 0, 0),
        1000,
        () => {
            corridorGroup.visible = false;
            doorGroup.visible = true;
            currentScene = SCENES.ENTRANCE;
            isAnimating = false;
            backButton.classList.add('hidden');
            entranceTooltip.classList.remove('hidden');
        }
    );
}

function createDetailedArtwork(paintingData) {
    const artworkGroup = new THREE.Group();
    artworkGroup.position.set(0, 1.6, 0);

    // Frame thickness for 3D viewing
    const frameDepth = 0.15;
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d1f1a,
        roughness: 0.6,
        metalness: 0.1
    });

    // Create 3D frame
    const frameThickness = 0.15;

    // Top
    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(3.3, frameThickness, frameDepth),
        frameMaterial
    );
    topFrame.position.y = 1.65;
    artworkGroup.add(topFrame);

    // Bottom
    const bottomFrame = new THREE.Mesh(
        new THREE.BoxGeometry(3.3, frameThickness, frameDepth),
        frameMaterial
    );
    bottomFrame.position.y = -1.65;
    artworkGroup.add(bottomFrame);

    // Left
    const leftFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, 3, frameDepth),
        frameMaterial
    );
    leftFrame.position.x = -1.575;
    artworkGroup.add(leftFrame);

    // Right
    const rightFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, 3, frameDepth),
        frameMaterial
    );
    rightFrame.position.x = 1.575;
    artworkGroup.add(rightFrame);

    // Front canvas
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        paintingData.imageUrl,
        (texture) => {
            const canvasMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8
            });
            const canvas = new THREE.Mesh(
                new THREE.PlaneGeometry(3, 3),
                canvasMaterial
            );
            canvas.position.z = frameDepth / 2 + 0.01;
            artworkGroup.add(canvas);
        }
    );

    // Back of canvas (linen texture)
    const backMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4c5a9,
        roughness: 0.9
    });
    const back = new THREE.Mesh(
        new THREE.PlaneGeometry(2.9, 2.9),
        backMaterial
    );
    back.position.z = -frameDepth / 2 - 0.01;
    back.rotation.y = Math.PI;
    artworkGroup.add(back);

    // Wooden support bars on back
    const supportMaterial = new THREE.MeshStandardMaterial({
        color: 0x5d4e37,
        roughness: 0.8
    });

    const supportBar1 = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.1, 0.05),
        supportMaterial
    );
    supportBar1.position.set(0, 0.8, -frameDepth / 2 - 0.02);
    artworkGroup.add(supportBar1);

    const supportBar2 = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.1, 0.05),
        supportMaterial
    );
    supportBar2.position.set(0, -0.8, -frameDepth / 2 - 0.02);
    artworkGroup.add(supportBar2);

    // Glass overlay
    const glassGeometry = new THREE.PlaneGeometry(3, 3);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        roughness: 0.1,
        metalness: 0.1,
        reflectivity: 0.6,
        clearcoat: 1,
        clearcoatRoughness: 0.1
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.z = frameDepth / 2 + 0.02;
    artworkGroup.add(glass);

    // Lighting for detail view
    const keyLight = new THREE.SpotLight(0xffffee, 2, 20, Math.PI / 6, 0.5);
    keyLight.position.set(2, 4, 6);
    keyLight.target = artworkGroup;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.5, 15);
    rimLight.position.set(-3, 2, 3);
    scene.add(rimLight);

    artworkGroup.userData.lights = [keyLight, rimLight];

    return artworkGroup;
}

// ============================================
// ANIMATION HELPERS
// ============================================

function animateCamera(fromPos, toPos, fromRot, toRot, duration, onComplete) {
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        camera.position.lerpVectors(fromPos, toPos, eased);
        camera.rotation.x = THREE.MathUtils.lerp(fromRot.x, toRot.x, eased);
        camera.rotation.y = THREE.MathUtils.lerp(fromRot.y, toRot.y, eased);
        camera.rotation.z = THREE.MathUtils.lerp(fromRot.z, toRot.z, eased);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (onComplete) onComplete();
        }
    }

    update();
}

function animateValue(from, to, duration, onUpdate, onComplete) {
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        const value = from + (to - from) * eased;

        if (onUpdate) onUpdate(value);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (onComplete) onComplete();
        }
    }

    update();
}

function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================
// UI FUNCTIONS
// ============================================

function showArtworkInfo(paintingData) {
    document.getElementById('artwork-title').textContent = paintingData.title;
    document.getElementById('artwork-artist').textContent = paintingData.artist;
    document.getElementById('artwork-year').textContent = paintingData.year;
    document.getElementById('artwork-medium').textContent = paintingData.medium;
    document.getElementById('artwork-description').textContent = paintingData.description;

    artworkInfo.classList.remove('hidden');
}

function hideArtworkInfo() {
    artworkInfo.classList.add('hidden');
}

// ============================================
// EVENT HANDLERS
// ============================================

function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Handle artwork rotation in detail view
    if (currentScene === SCENES.ARTWORK_DETAIL && isDragging && currentArtwork) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        artworkRotationY += deltaX * 0.01;
        artworkRotationX += deltaY * 0.01;

        // Limit vertical rotation
        artworkRotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, artworkRotationX));

        currentArtwork.rotation.y = artworkRotationY;
        currentArtwork.rotation.x = artworkRotationX;

        previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    // Hover effects
    if (!isDragging) {
        raycaster.setFromCamera(mouse, camera);

        if (currentScene === SCENES.ENTRANCE) {
            const intersects = raycaster.intersectObjects(doorGroup.children, true);
            if (intersects.length > 0 && intersects[0].object.userData.isDoor) {
                renderer.domElement.style.cursor = 'pointer';
            } else {
                renderer.domElement.style.cursor = 'default';
            }
        } else if (currentScene === SCENES.CORRIDOR) {
            const intersects = raycaster.intersectObjects(corridorGroup.children, true);
            if (intersects.length > 0 && intersects[0].object.userData.isWall) {
                renderer.domElement.style.cursor = 'pointer';
            } else {
                renderer.domElement.style.cursor = 'default';
            }
        } else if (currentScene === SCENES.WALL_LEFT || currentScene === SCENES.WALL_RIGHT) {
            const intersects = raycaster.intersectObjects(corridorGroup.children, true);
            let foundPainting = false;

            for (let intersect of intersects) {
                let obj = intersect.object;
                while (obj.parent && !obj.userData.isPainting) {
                    obj = obj.parent;
                }
                if (obj.userData.isPainting) {
                    renderer.domElement.style.cursor = 'pointer';
                    foundPainting = true;
                    break;
                }
            }

            if (!foundPainting) {
                renderer.domElement.style.cursor = 'default';
            }
        }
    }
}

function onMouseClick(event) {
    if (isAnimating) return;

    raycaster.setFromCamera(mouse, camera);

    if (currentScene === SCENES.ENTRANCE) {
        const intersects = raycaster.intersectObjects(doorGroup.children, true);
        if (intersects.length > 0 && intersects[0].object.userData.isDoor) {
            transitionToScene(SCENES.CORRIDOR);
        }
    } else if (currentScene === SCENES.CORRIDOR) {
        const intersects = raycaster.intersectObjects(corridorGroup.children, true);
        if (intersects.length > 0 && intersects[0].object.userData.isWall) {
            const wallSide = intersects[0].object.userData.wallSide;
            if (wallSide === 'left') {
                transitionToScene(SCENES.WALL_LEFT);
            } else if (wallSide === 'right') {
                transitionToScene(SCENES.WALL_RIGHT);
            }
        }
    } else if (currentScene === SCENES.WALL_LEFT || currentScene === SCENES.WALL_RIGHT) {
        const intersects = raycaster.intersectObjects(corridorGroup.children, true);

        for (let intersect of intersects) {
            let obj = intersect.object;
            while (obj.parent && !obj.userData.isPainting) {
                obj = obj.parent;
            }
            if (obj.userData.isPainting) {
                transitionToScene(SCENES.ARTWORK_DETAIL, {
                    paintingData: obj.userData.paintingData,
                    frameGroup: obj
                });
                break;
            }
        }
    }
}

function onMouseDown(event) {
    if (currentScene === SCENES.ARTWORK_DETAIL) {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        renderer.domElement.classList.remove('grab');
        renderer.domElement.classList.add('grabbing');
    }
}

function onMouseUp(event) {
    if (currentScene === SCENES.ARTWORK_DETAIL) {
        isDragging = false;
        renderer.domElement.classList.remove('grabbing');
        renderer.domElement.classList.add('grab');
    }
}

function onMouseWheel(event) {
    if (currentScene === SCENES.ARTWORK_DETAIL && currentArtwork) {
        event.preventDefault();

        const zoomSpeed = 0.001;
        const newZ = camera.position.z - event.deltaY * zoomSpeed;

        // Limit zoom range
        camera.position.z = Math.max(2, Math.min(8, newZ));
    }
}

function onBackButtonClick() {
    if (isAnimating) return;

    if (currentScene === SCENES.ARTWORK_DETAIL) {
        // Clean up artwork detail view
        if (currentArtwork) {
            // Remove lights
            if (currentArtwork.userData.lights) {
                currentArtwork.userData.lights.forEach(light => scene.remove(light));
            }
            scene.remove(currentArtwork);
            currentArtwork = null;
        }

        hideArtworkInfo();
        corridorGroup.visible = true;
        renderer.domElement.classList.remove('grab', 'grabbing');

        // Return to wall view
        const previousWall = camera.position.x < 0 ? 'left' : 'right';
        const targetScene = previousWall === 'left' ? SCENES.WALL_LEFT : SCENES.WALL_RIGHT;
        const targetRotation = previousWall === 'left' ? Math.PI / 2 : -Math.PI / 2;
        const targetPosition = previousWall === 'left'
            ? new THREE.Vector3(-2, 1.6, 0)
            : new THREE.Vector3(2, 1.6, 0);

        animateCamera(
            camera.position,
            targetPosition,
            camera.rotation,
            new THREE.Euler(0, targetRotation, 0),
            800,
            () => {
                currentScene = targetScene;
                isAnimating = false;
                backButton.textContent = '← Back to Corridor';
            }
        );
    } else if (currentScene === SCENES.WALL_LEFT || currentScene === SCENES.WALL_RIGHT) {
        // Return to corridor
        animateCamera(
            camera.position,
            new THREE.Vector3(0, 1.6, 0),
            camera.rotation,
            new THREE.Euler(0, 0, 0),
            800,
            () => {
                currentScene = SCENES.CORRIDOR;
                isAnimating = false;
                backButton.textContent = '← Back to Entrance';

                // Show wall hints again
                wallHintLeft.classList.remove('hidden');
                wallHintRight.classList.remove('hidden');
            }
        );
    } else if (currentScene === SCENES.CORRIDOR) {
        transitionToScene(SCENES.ENTRANCE);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// ============================================
// START APPLICATION
// ============================================

init();
