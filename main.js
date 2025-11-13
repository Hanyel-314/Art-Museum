import * as THREE from 'three';

// ============================================
// CONFIGURATION
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
            description: "An iconic post-impressionist masterpiece depicting a swirling night sky over a French village.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1200px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg"
        },
        {
            title: "The Great Wave",
            artist: "Katsushika Hokusai",
            year: "1831",
            medium: "Woodblock print",
            description: "A stunning Japanese woodblock print featuring an enormous wave threatening boats off Kanagawa.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1200px-Tsunami_by_hokusai_19th_century.jpg"
        },
        {
            title: "Girl with a Pearl Earring",
            artist: "Johannes Vermeer",
            year: "1665",
            medium: "Oil on canvas",
            description: "Often called the 'Mona Lisa of the North,' this Dutch masterpiece captures a girl with a captivating gaze.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg"
        }
    ],
    right: [
        {
            title: "The Scream",
            artist: "Edvard Munch",
            year: "1893",
            medium: "Oil and pastel",
            description: "An expressionist masterpiece depicting an agonized figure against a tumultuous orange sky.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg"
        },
        {
            title: "The Birth of Venus",
            artist: "Sandro Botticelli",
            year: "1485",
            medium: "Tempera on canvas",
            description: "A Renaissance masterpiece depicting Venus emerging from the sea as a fully grown woman.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1200px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg"
        },
        {
            title: "The Kiss",
            artist: "Gustav Klimt",
            year: "1908",
            medium: "Oil and gold leaf",
            description: "A symbol of Vienna Secession showing a couple embraced in elaborate golden robes.",
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
let doorMesh, corridorGroup;
let paintingGroups = { left: [], right: [] };
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
    console.log('🎨 Initializing Art Museum...');

    // Get DOM elements
    loadingScreen = document.getElementById('loading-screen');
    entranceTooltip = document.getElementById('entrance-tooltip');
    backButton = document.getElementById('back-button');
    artworkInfo = document.getElementById('artwork-info');
    wallHintLeft = document.getElementById('wall-hint-left');
    wallHintRight = document.getElementById('wall-hint-right');

    console.log('✅ DOM elements loaded');

    // Setup Three.js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.6, 5);

    // Renderer
    const canvas = document.getElementById('museum-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    console.log('✅ Three.js setup complete');

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create scenes
    console.log('🚪 Creating entrance...');
    createEntranceScene();

    console.log('🖼️ Creating corridor...');
    createCorridorScene();

    console.log('✅ Scenes created');

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    canvas.addEventListener('click', onMouseClick);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onMouseWheel, { passive: false });
    backButton.addEventListener('click', onBackButtonClick);

    console.log('✅ Events attached');

    // Start animation
    animate();
    console.log('✅ Animation started');

    // Hide loading screen
    setTimeout(() => {
        console.log('👋 Hiding loading screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            entranceTooltip.classList.remove('hidden');
            console.log('🎉 Museum ready! Click the door to enter.');
        }, 500);
    }, 1000);
}

// ============================================
// SCENE CREATION
// ============================================

function createEntranceScene() {
    // Simple ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Large clickable door
    const doorGeometry = new THREE.BoxGeometry(3, 4, 0.3);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.7
    });
    doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    doorMesh.position.set(0, 2, 0);
    doorMesh.userData.isDoor = true;
    scene.add(doorMesh);

    // Door frame highlight
    const edgesGeometry = new THREE.EdgesGeometry(doorGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0xFFD700,
        linewidth: 2
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    doorMesh.add(edges);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const frontLight = new THREE.PointLight(0xffffff, 1, 20);
    frontLight.position.set(0, 3, 5);
    scene.add(frontLight);

    console.log('✅ Door created and clickable');
}

function createCorridorScene() {
    corridorGroup = new THREE.Group();
    corridorGroup.visible = false;

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(10, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        roughness: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    corridorGroup.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(floorGeometry, new THREE.MeshStandardMaterial({ color: 0xe0e0e0 }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4;
    corridorGroup.add(ceiling);

    // Left wall
    const wallGeometry = new THREE.PlaneGeometry(30, 4);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xdedede,
        roughness: 0.9
    });

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-5, 2, 0);
    leftWall.userData.isWall = true;
    leftWall.userData.wallSide = 'left';
    corridorGroup.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(5, 2, 0);
    rightWall.userData.isWall = true;
    rightWall.userData.wallSide = 'right';
    corridorGroup.add(rightWall);

    // Create paintings
    createWallPaintings('left', corridorGroup);
    createWallPaintings('right', corridorGroup);

    // Lighting
    const corridorAmbient = new THREE.AmbientLight(0xffffff, 0.5);
    corridorGroup.add(corridorAmbient);

    // Ceiling lights
    for (let i = -10; i <= 10; i += 5) {
        const light = new THREE.PointLight(0xffffee, 1, 15);
        light.position.set(0, 3.5, i);
        corridorGroup.add(light);
    }

    scene.add(corridorGroup);
    console.log('✅ Corridor created');
}

function createWallPaintings(side, parentGroup) {
    const xPos = side === 'left' ? -4.95 : 4.95;
    const rotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const paintings = PAINTINGS_DATA[side];

    paintings.forEach((paintingData, index) => {
        const zPos = -8 + (index * 8);

        const frameGroup = new THREE.Group();
        frameGroup.position.set(xPos, 2, zPos);
        frameGroup.rotation.y = rotation;
        frameGroup.userData.isPainting = true;
        frameGroup.userData.paintingData = paintingData;
        frameGroup.userData.paintingSide = side;
        frameGroup.userData.paintingIndex = index;

        // Frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d2817,
            roughness: 0.6
        });

        // Frame borders
        const frameThickness = 0.1;
        const frameWidth = 2.5;
        const frameHeight = 2.5;

        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameWidth, 0.15, frameThickness),
            frameMaterial
        );
        topFrame.position.y = frameHeight / 2;
        frameGroup.add(topFrame);

        const bottomFrame = topFrame.clone();
        bottomFrame.position.y = -frameHeight / 2;
        frameGroup.add(bottomFrame);

        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, frameHeight, frameThickness),
            frameMaterial
        );
        leftFrame.position.x = -frameWidth / 2;
        frameGroup.add(leftFrame);

        const rightFrame = leftFrame.clone();
        rightFrame.position.x = frameWidth / 2;
        frameGroup.add(rightFrame);

        // Canvas
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            paintingData.imageUrl,
            (texture) => {
                const canvasMaterial = new THREE.MeshStandardMaterial({
                    map: texture
                });
                const canvas = new THREE.Mesh(
                    new THREE.PlaneGeometry(2.3, 2.3),
                    canvasMaterial
                );
                canvas.position.z = -0.02;
                frameGroup.add(canvas);
            },
            undefined,
            (error) => {
                console.warn('Failed to load texture:', paintingData.title);
                const fallback = new THREE.Mesh(
                    new THREE.PlaneGeometry(2.3, 2.3),
                    new THREE.MeshStandardMaterial({ color: 0x8b7355 })
                );
                fallback.position.z = -0.02;
                frameGroup.add(fallback);
            }
        );

        // Glass
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(2.3, 2.3),
            new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1,
                roughness: 0.1,
                metalness: 0.1
            })
        );
        glass.position.z = 0.01;
        frameGroup.add(glass);

        // Spotlight
        const spotlight = new THREE.SpotLight(0xffffee, 1.5, 8, Math.PI / 6);
        spotlight.position.set(side === 'left' ? -3 : 3, 3, zPos);
        spotlight.target = frameGroup;
        parentGroup.add(spotlight);

        parentGroup.add(frameGroup);
        paintingGroups[side].push(frameGroup);
    });

    console.log(`✅ Created ${paintings.length} paintings on ${side} wall`);
}

// ============================================
// SCENE TRANSITIONS
// ============================================

function enterCorridor() {
    if (isAnimating) return;
    isAnimating = true;
    console.log('🚶 Entering corridor...');

    // Hide door
    if (doorMesh) doorMesh.visible = false;

    // Show corridor
    corridorGroup.visible = true;

    // Animate camera
    animateCamera(
        camera.position.clone(),
        new THREE.Vector3(0, 1.6, 0),
        camera.rotation.clone(),
        new THREE.Euler(0, 0, 0),
        1000,
        () => {
            currentScene = SCENES.CORRIDOR;
            isAnimating = false;
            backButton.classList.remove('hidden');
            backButton.textContent = '← Back to Entrance';

            // Show wall hints
            wallHintLeft.classList.remove('hidden');
            wallHintRight.classList.remove('hidden');

            console.log('✅ In corridor. Click walls to view galleries.');
        }
    );
}

function viewWall(side) {
    if (isAnimating) return;
    isAnimating = true;
    console.log(`👀 Viewing ${side} wall...`);

    wallHintLeft.classList.add('hidden');
    wallHintRight.classList.add('hidden');

    const targetRotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const targetPosition = side === 'left'
        ? new THREE.Vector3(-3, 1.6, 0)
        : new THREE.Vector3(3, 1.6, 0);

    animateCamera(
        camera.position.clone(),
        targetPosition,
        camera.rotation.clone(),
        new THREE.Euler(0, targetRotation, 0),
        800,
        () => {
            currentScene = side === 'left' ? SCENES.WALL_LEFT : SCENES.WALL_RIGHT;
            isAnimating = false;
            backButton.textContent = '← Back to Corridor';
            console.log(`✅ Viewing ${side} wall. Click paintings for details.`);
        }
    );
}

function viewArtwork(paintingData) {
    if (isAnimating) return;
    isAnimating = true;
    console.log(`🖼️ Viewing: ${paintingData.title}`);

    // Create detailed artwork
    currentArtwork = createDetailedArtwork(paintingData);
    scene.add(currentArtwork);

    // Hide corridor
    corridorGroup.visible = false;

    // Move camera
    animateCamera(
        camera.position.clone(),
        new THREE.Vector3(0, 1.6, 5),
        camera.rotation.clone(),
        new THREE.Euler(0, 0, 0),
        800,
        () => {
            currentScene = SCENES.ARTWORK_DETAIL;
            isAnimating = false;
            artworkRotationY = 0;
            artworkRotationX = 0;

            showArtworkInfo(paintingData);
            backButton.textContent = '← Back to Gallery';
            renderer.domElement.style.cursor = 'grab';

            console.log('✅ Viewing artwork. Drag to rotate, scroll to zoom.');
        }
    );
}

function createDetailedArtwork(paintingData) {
    const artworkGroup = new THREE.Group();
    artworkGroup.position.set(0, 1.6, 0);

    const frameDepth = 0.2;
    const size = 3.5;

    // Frame material
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d1f1a,
        roughness: 0.7
    });

    // Frame pieces
    const frameThick = 0.2;

    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(size + 0.4, frameThick, frameDepth),
        frameMaterial
    );
    topFrame.position.y = size / 2 + frameThick / 2;
    artworkGroup.add(topFrame);

    const bottomFrame = topFrame.clone();
    bottomFrame.position.y = -(size / 2 + frameThick / 2);
    artworkGroup.add(bottomFrame);

    const leftFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameThick, size, frameDepth),
        frameMaterial
    );
    leftFrame.position.x = -(size / 2 + frameThick / 2);
    artworkGroup.add(leftFrame);

    const rightFrame = leftFrame.clone();
    rightFrame.position.x = size / 2 + frameThick / 2;
    artworkGroup.add(rightFrame);

    // Front canvas
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        paintingData.imageUrl,
        (texture) => {
            const canvas = new THREE.Mesh(
                new THREE.PlaneGeometry(size, size),
                new THREE.MeshStandardMaterial({ map: texture })
            );
            canvas.position.z = frameDepth / 2 + 0.01;
            artworkGroup.add(canvas);
        }
    );

    // Back of canvas
    const backMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4c5a9,
        roughness: 0.9
    });
    const back = new THREE.Mesh(
        new THREE.PlaneGeometry(size - 0.2, size - 0.2),
        backMaterial
    );
    back.position.z = -(frameDepth / 2 + 0.01);
    back.rotation.y = Math.PI;
    artworkGroup.add(back);

    // Support bars
    const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4e37 });

    const bar1 = new THREE.Mesh(
        new THREE.BoxGeometry(size - 0.3, 0.1, 0.05),
        supportMaterial
    );
    bar1.position.set(0, size / 3, -(frameDepth / 2 + 0.02));
    artworkGroup.add(bar1);

    const bar2 = bar1.clone();
    bar2.position.y = -size / 3;
    artworkGroup.add(bar2);

    // Glass
    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.12,
            roughness: 0.1
        })
    );
    glass.position.z = frameDepth / 2 + 0.02;
    artworkGroup.add(glass);

    // Lighting
    const keyLight = new THREE.SpotLight(0xffffff, 1.5, 30);
    keyLight.position.set(3, 4, 6);
    keyLight.target = artworkGroup;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.5, 20);
    rimLight.position.set(-4, 2, 4);
    scene.add(rimLight);

    artworkGroup.userData.lights = [keyLight, rimLight];

    return artworkGroup;
}

function returnToPreviousScene() {
    if (isAnimating) return;
    isAnimating = true;
    console.log('⬅️ Going back...');

    if (currentScene === SCENES.ARTWORK_DETAIL) {
        // Clean up artwork
        if (currentArtwork) {
            if (currentArtwork.userData.lights) {
                currentArtwork.userData.lights.forEach(light => scene.remove(light));
            }
            scene.remove(currentArtwork);
            currentArtwork = null;
        }

        hideArtworkInfo();
        corridorGroup.visible = true;
        renderer.domElement.style.cursor = 'default';

        // Return to wall
        const side = camera.position.x < 0 ? 'left' : 'right';
        const targetRotation = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
        const targetPosition = side === 'left'
            ? new THREE.Vector3(-3, 1.6, 0)
            : new THREE.Vector3(3, 1.6, 0);

        animateCamera(
            camera.position.clone(),
            targetPosition,
            camera.rotation.clone(),
            new THREE.Euler(0, targetRotation, 0),
            800,
            () => {
                currentScene = side === 'left' ? SCENES.WALL_LEFT : SCENES.WALL_RIGHT;
                isAnimating = false;
                backButton.textContent = '← Back to Corridor';
            }
        );
    } else if (currentScene === SCENES.WALL_LEFT || currentScene === SCENES.WALL_RIGHT) {
        // Return to corridor
        animateCamera(
            camera.position.clone(),
            new THREE.Vector3(0, 1.6, 0),
            camera.rotation.clone(),
            new THREE.Euler(0, 0, 0),
            800,
            () => {
                currentScene = SCENES.CORRIDOR;
                isAnimating = false;
                backButton.textContent = '← Back to Entrance';
                wallHintLeft.classList.remove('hidden');
                wallHintRight.classList.remove('hidden');
            }
        );
    } else if (currentScene === SCENES.CORRIDOR) {
        // Return to entrance
        corridorGroup.visible = false;
        if (doorMesh) doorMesh.visible = true;

        animateCamera(
            camera.position.clone(),
            new THREE.Vector3(0, 1.6, 5),
            camera.rotation.clone(),
            new THREE.Euler(0, 0, 0),
            1000,
            () => {
                currentScene = SCENES.ENTRANCE;
                isAnimating = false;
                backButton.classList.add('hidden');
                entranceTooltip.classList.remove('hidden');
                wallHintLeft.classList.add('hidden');
                wallHintRight.classList.add('hidden');
            }
        );
    }
}

// ============================================
// ANIMATION
// ============================================

function animateCamera(fromPos, toPos, fromRot, toRot, duration, onComplete) {
    const startTime = Date.now();
    const startPos = fromPos.clone();
    const startRot = fromRot.clone();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        camera.position.lerpVectors(startPos, toPos, eased);
        camera.rotation.x = THREE.MathUtils.lerp(startRot.x, toRot.x, eased);
        camera.rotation.y = THREE.MathUtils.lerp(startRot.y, toRot.y, eased);
        camera.rotation.z = THREE.MathUtils.lerp(startRot.z, toRot.z, eased);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (onComplete) onComplete();
        }
    }

    update();
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================
// UI
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

    // Handle artwork rotation
    if (currentScene === SCENES.ARTWORK_DETAIL && isDragging && currentArtwork) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        artworkRotationY += deltaX * 0.01;
        artworkRotationX += deltaY * 0.01;
        artworkRotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, artworkRotationX));

        currentArtwork.rotation.y = artworkRotationY;
        currentArtwork.rotation.x = artworkRotationX;

        previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    // Hover effects
    if (!isDragging && !isAnimating) {
        raycaster.setFromCamera(mouse, camera);
        let cursor = 'default';

        if (currentScene === SCENES.ENTRANCE) {
            const intersects = raycaster.intersectObject(doorMesh);
            if (intersects.length > 0) {
                cursor = 'pointer';
            }
        } else if (currentScene === SCENES.CORRIDOR) {
            const intersects = raycaster.intersectObjects(corridorGroup.children, true);
            for (let i of intersects) {
                if (i.object.userData.isWall) {
                    cursor = 'pointer';
                    break;
                }
            }
        } else if (currentScene === SCENES.WALL_LEFT || currentScene === SCENES.WALL_RIGHT) {
            const intersects = raycaster.intersectObjects(corridorGroup.children, true);
            for (let i of intersects) {
                let obj = i.object;
                while (obj.parent && !obj.userData.isPainting) {
                    obj = obj.parent;
                }
                if (obj.userData.isPainting) {
                    cursor = 'pointer';
                    break;
                }
            }
        }

        renderer.domElement.style.cursor = cursor;
    }
}

function onMouseClick(event) {
    if (isAnimating) {
        console.log('⏳ Animation in progress, please wait...');
        return;
    }

    raycaster.setFromCamera(mouse, camera);

    if (currentScene === SCENES.ENTRANCE) {
        const intersects = raycaster.intersectObject(doorMesh);
        if (intersects.length > 0) {
            console.log('🚪 Door clicked!');
            entranceTooltip.classList.add('hidden');
            enterCorridor();
        }
    } else if (currentScene === SCENES.CORRIDOR) {
        const intersects = raycaster.intersectObjects(corridorGroup.children, true);
        for (let i of intersects) {
            if (i.object.userData.isWall) {
                const side = i.object.userData.wallSide;
                console.log(`🖼️ ${side} wall clicked!`);
                viewWall(side);
                break;
            }
        }
    } else if (currentScene === SCENES.WALL_LEFT || currentScene === SCENES.WALL_RIGHT) {
        const intersects = raycaster.intersectObjects(corridorGroup.children, true);
        for (let i of intersects) {
            let obj = i.object;
            while (obj.parent && !obj.userData.isPainting) {
                obj = obj.parent;
            }
            if (obj.userData.isPainting) {
                viewArtwork(obj.userData.paintingData);
                break;
            }
        }
    }
}

function onMouseDown(event) {
    if (currentScene === SCENES.ARTWORK_DETAIL) {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        renderer.domElement.style.cursor = 'grabbing';
    }
}

function onMouseUp(event) {
    if (currentScene === SCENES.ARTWORK_DETAIL) {
        isDragging = false;
        renderer.domElement.style.cursor = 'grab';
    }
}

function onMouseWheel(event) {
    if (currentScene === SCENES.ARTWORK_DETAIL && currentArtwork) {
        event.preventDefault();
        const zoomSpeed = 0.002;
        const newZ = camera.position.z - event.deltaY * zoomSpeed;
        camera.position.z = Math.max(2, Math.min(8, newZ));
    }
}

function onBackButtonClick() {
    console.log('⬅️ Back button clicked');
    returnToPreviousScene();
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

    // Subtle door animation
    if (currentScene === SCENES.ENTRANCE && doorMesh) {
        doorMesh.rotation.y = Math.sin(Date.now() * 0.001) * 0.02;
    }

    renderer.render(scene, camera);
}

// ============================================
// START
// ============================================

init();
