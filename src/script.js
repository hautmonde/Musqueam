import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//import { OrbitControls } from './CustomOrbitControls.js';
//import { MapControls } from './CustomOrbitControls.js';
import * as dat from 'dat.gui'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
//import { GUI } from 'dat.gui'
import { InteractionManager } from 'three.interactive';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import CircleProjector from './circleProjector';


// !————————1. Setup

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Containers
let container = document.createElement( 'div' );
document.body.appendChild( container );

// Screen Setup
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

// Managers

const manager = new THREE.LoadingManager();

// Gravity

const gravityRay = new THREE.Raycaster();
const gravityDirection = new THREE.Vector3(0, -1, 0);

// Time

let timeOfDay = .3;

// Fog

scene.fog = new THREE.Fog( 0xcccccc, 25, 100 );


// Resize window

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})








// !————————Camera

/**
 * Camera
 */
// Base camera
//const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// New one
const camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 1, 2000 );
camera.position.z = 15;
camera.position.x = 0
camera.position.y = 40
scene.add(camera)






// !————————Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))







// !———————— World Setup

// Create a separate canvas for the gradient texture
const gradientCanvas = document.createElement("canvas");
const gradientContext = gradientCanvas.getContext("2d");

// Define colors for different times of day
const dayColorTop = new THREE.Color(0x87ceeb); // Sky blue
const dayColorBottom = new THREE.Color(0xffffff); // White
const nightColorTop = new THREE.Color(0x0b3d91); // Dark blue
const nightColorBottom = new THREE.Color(0x1c1c1c); // Near black

// Function to update the gradient background based on time of day
function updateGradientBackground(angle, canvas, context) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);

  const topColor = nightColorTop.clone().lerp(dayColorTop, Math.sin(angle));
  const bottomColor = nightColorBottom.clone().lerp(dayColorBottom, Math.sin(angle));

  gradient.addColorStop(0, topColor.getStyle());
  gradient.addColorStop(1, bottomColor.getStyle());

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}














// !————————2. Lighting

// Create a directional light (sun)
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(0, 10, 0);
scene.add(sunLight);

// Create an ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

function updateSunPosition(){
  const elapsedTime = clock.getElapsedTime()
  
   // Rotate the sun
   const sunRadius = 100;
   const angle = timeOfDay * Math.PI * 2;
   sunLight.position.set(
     sunRadius * Math.cos(angle),
     sunRadius * Math.sin(angle),
     0
   );
   
   // Update the gradient background on the gradientCanvas
   updateGradientBackground(angle, gradientCanvas, gradientContext);
   
   // Apply the updated gradient background as a texture
   scene.background = new THREE.CanvasTexture(gradientCanvas);
   
   const fogIntensity = 0.5 + 0.5 * Math.sin(angle);
   scene.fog.color.setHSL(0.1, 0.25, fogIntensity);
   
    
    // Update time of day
    timeOfDay += 0.00001; // .001
    if (timeOfDay >= 1) {
      timeOfDay = 0;
    }
}



// const pointLightSun = new THREE.PointLight( 0xffffcc, .5, 2000 );
// pointLightSun.position.set( 10, 10, 10 );
// pointLightSun.rotation.set( 0, Math.PI, 0 );
// 
// pointLightSun.castShadow = true; // default false
// 
// //Set up shadow properties for the light
// pointLightSun.shadow.mapSize.width = 512; // default
// pointLightSun.shadow.mapSize.height = 512; // default
// pointLightSun.shadow.camera.near = 0.5; // default
// pointLightSun.shadow.camera.far = 500; // default
// 
// 
// scene.add( pointLightSun );
// 
// const sphereSize = 1;
// const pointLightSunHelper = new THREE.PointLightHelper( pointLightSun, sphereSize );
// scene.add( pointLightSunHelper );
// 
// const ambientLight = new THREE.AmbientLight( 0xcccccc );
// ambientLight.intensity = 1.3;
// scene.add( ambientLight );
// 
// let sunSpeed = .3;
























// !————————3. Load textures and mats

const textureLoader = new THREE.TextureLoader( manager );
const texture = textureLoader.load( 'textures/test2b.JPG' );

const testMaterial = new THREE.MeshBasicMaterial()
testMaterial.color = new THREE.Color(0xff0000)


const cursorCircleRadius = 1; 
const cursorCircleSegments = 32; 
const cursorCircleGeometry = new THREE.CircleBufferGeometry(cursorCircleRadius, cursorCircleSegments);
const cursorCircleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });






















// !————————4. Objects

let landscapeMesh;

// Cursor Circle



// Test Torus

const torusGeometry = new THREE.TorusGeometry( .7, .2, 16, 100 );

const torus = new THREE.Mesh(torusGeometry, testMaterial)
torus.castShadow = true; //default is false
torus.receiveShadow = false; //default
torus.scale.set(2,2,2)
torus.position.set(0,15,0)
scene.add(torus)


// Spheres

const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
scene.add(sphere1);

const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshStandardMaterial({ color: 0x00ff00 }));
scene.add(sphere2);

const sphere3 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshStandardMaterial({ color: 0x0000ff }));
scene.add(sphere3);

sphere1.name = "Sphere 1";
sphere2.name = "Sphere 2";
sphere3.name = "Sphere 3";

const spheresArray = [sphere1, sphere2, sphere3];

// clickableObjects.push(sphere1);
// clickableObjects.push(sphere2);
// clickableObjects.push(sphere3);




// Loading Functions

function loadTheModel(url) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader(manager);
    loader.load(
      url,
      (gltf) => {
        resolve(gltf.scene);
      },
      onProgress,
      (error) => {
        reject(error);
      }
    );
  });
}

// Function to initialize the landscape and place spheres
async function initLandscape() {
  try {
    const landscape = await loadTheModel("models/test4.glb");
    landscape.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture;
        child.material.flatShading = false;
        child.geometry.deleteAttribute("normal");
        // child.geometry = BufferGeometryUtils.mergeVertices(child.geometry);
        child.geometry.computeVertexNormals();
        child.castShadow = true; //default is false
        child.receiveShadow = true; //default
        //child.scale.set(1, 1, 1);
        landscapeMesh = child;
        // Adjust the position of the mesh
        //landscapeMesh.position.y = -15;
      }
    });

    //landscape.position.y = -15; 
    scene.add(landscape);
    
    
    // DEBUG: Show mesh of landscape
    // const wireframe = new THREE.WireframeGeometry(landscapeMesh.geometry);
    // const line = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ color: 0xff0000 }));
    // line.position.copy(landscapeMesh.position);
    // line.rotation.copy(landscapeMesh.rotation);
    // scene.add(line);
    
    // Place the spheres on the landscape after it is added to the scene
    placeObjectOnMesh(sphere1, landscapeMesh, 20, -10);
    placeObjectOnMesh(sphere2, landscapeMesh, 0, 0);
    placeObjectOnMesh(sphere3, landscapeMesh, -20, 10);
    
    createCursor();
  } catch (error) {
    console.error("Error loading landscape:", error);
  }
}


function placeObjectOnMesh(object, mesh, x, z) {
  object.position.set(x, 5, z);
  const raycasterSpheresOnMap = new THREE.Raycaster();
  raycasterSpheresOnMap.set(object.position.clone().add(new THREE.Vector3(0, 500, 0)), new THREE.Vector3(0, -1, 0));
  
  // Add a line representing the raycaster's ray to the scene
  //const rayHelper = createRayHelper(raycaster);
  //scene.add(rayHelper);

  const intersects = raycasterSpheresOnMap.intersectObject(mesh);
  if (intersects.length > 0) {
    object.position.y = intersects[0].point.y;
    mesh.add(object);
  } else {
    console.error("No intersection found for object:", object);
  }
}



initLandscape();





























// !————————5. Controls

// Controls
const controls = new OrbitControls(camera, canvas)
//const controls = new MapControls( camera, canvas );
controls.enableDamping = true
controls.dollyDistance = camera.position.distanceTo(controls.target);


function updateOrbitControlsTarget() {
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  const distance = 10; // The distance from the camera to the target point
  const target = camera.position.clone().add(cameraDirection.multiplyScalar(distance));
  controls.target.copy(target);
}


document.addEventListener( 'mousemove', onDocumentMouseMove );



// RAYCASTERS AND MOUSE

const raycasterFromCamera = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [];

document.addEventListener("mousemove", onMouseMove);


let cameraMoveEnabled = true;

function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - windowHalfX ) / 2;
    mouseY = ( event.clientY - windowHalfY ) / 2;
}

// Key Listener

document.addEventListener("keydown", onDocumentKeyDown, false);



// Handlers

function onDocumentKeyDown(event) {
    let keyCode = event.which;
    if (keyCode == 32) {
        cameraMoveEnabled = !cameraMoveEnabled;
    }
}

function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycasterFromCamera.setFromCamera(mouse, camera);

    const intersects = raycasterFromCamera.intersectObjects(scene.children, true);

    let hoveredObject;
    
    for (const intersect of intersects) {
        if (spheresArray.includes(intersect.object)) {
            hoveredObject = intersect.object;
            break;
        }
    } 

    if (hoveredObject) {
      console.log('hover');
        hoverState(hoveredObject);
    } else if (document.querySelector(".hover")) {
        document.querySelector(".hover").classList.remove("hover");
    }
}

function createCursor(){
const circleProjector = new CircleProjector(scene, camera, landscapeMesh );
}









// Events

function hoverState(object) {
//     const label1 = document.querySelector(".label1");
//     label1.style.display = "block";
//     const screenPos = object.position.clone().project(camera);
//     const x = (screenPos.x * window.innerWidth) / 2 + window.innerWidth / 2;
//     const y = -(screenPos.y * window.innerHeight) / 2 + window.innerHeight / 2;
// 
//     label1.style.left = label1.offsetWidth + x + "px";
//     label1.style.top = y + "px";

  const sphereNumber = parseInt(object.name.match(/\d+$/)[0], 10);  
  document.querySelector(".label" + sphereNumber ).classList.add("hover");
}




// function onClick(event) {
//   event.preventDefault();
// 
//   // Convert the mouse position to normalized device coordinates
//   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
// 
//   // Update the picking ray with the camera and mouse position
//   raycaster.setFromCamera(mouse, camera);
// 
//   // Calculate objects intersecting the picking ray
//   const intersects = raycaster.intersectObjects(clickableObjects);
// 
//   if (intersects.length > 0) {
//     const intersectedObject = intersects[0].object;
// 
//     // Calculate the position of the sphere in screen coordinates
//     const screenPos = intersectedObject.position.clone().project(camera);
//     screenPos.x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
//     screenPos.y = (1 - (screenPos.y * 0.5 + 0.5)) * window.innerHeight;
// 
//     // Show the tooltip with text above the sphere
//     showTooltip(intersectedObject.name, screenPos.x, screenPos.y);
//   }
// }
// 
// function checkForHover() {
//   
// }

// function showTooltip(text, x, y) {
//   let tooltip = document.getElementById("tooltip");
//   if (!tooltip) {
//     tooltip = document.createElement("div");
//     tooltip.id = "tooltip";
//     tooltip.className = "tooltip";
//     document.body.appendChild(tooltip);
//   }
//   tooltip.style.left = x + "px";
//   tooltip.style.top = y + "px";
//   tooltip.textContent = text;
//   tooltip.style.display = "block";
// }

















// !————————6. Handlers & Logic


function updateLabelPositions(spheres) {
  const numElements = 3;
  const labels = [];

  // Populate spheres and labels arrays
  for (let i = 1; i <= numElements; i++) {
    labels.push(document.querySelector(".label" + i));
  }
  
  //const spheres = [sphere1, sphere2, sphere3];

  
  // Update labels' positions
  for (let i = 0; i < spheres.length; i++) {
    
    if (!spheres[i]) {
      //console.error('Sphere at index', i, 'is undefined');
      continue;
    }

    
    labels[i].style.display = "block";

    const screenPos = spheres[i].position.clone().project(camera);

    const x = (screenPos.x * window.innerWidth) / 2 + window.innerWidth / 2;
    const y = -(screenPos.y * window.innerHeight) / 2 + window.innerHeight / 2;

    labels[i].style.left = (x - labels[i].offsetWidth / 2) + "px";
    labels[i].style.top = (y - labels[i].offsetHeight) + "px";
  }
}










// !————————7. Utility Classes

// New function to get the highest vertex y-value of the landscape
function getHighestVertexY(mesh) {
    let highestY = -Infinity;
    const vertices = mesh.geometry.attributes.position.array;

    for (let i = 1; i < vertices.length; i += 3) {
        if (vertices[i] > highestY) {
            highestY = vertices[i];
        }
    }
    return highestY;
}

function createRayHelper(raycaster) {
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const geometry = new THREE.BufferGeometry().setFromPoints([
    raycaster.ray.origin,
    raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(1000)),
  ]);
  return new THREE.Line(geometry, material);
}

// Loading Functions

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

function onError() {}



























































// !————————Clock Animation

const clock = new THREE.Clock()

const tick = () =>
{

    updateSunPosition();
     
    
    //pointLightSun.position.x = 80*Math.cos(elapsedTime * sunSpeed) + 0;
    //pointLightSun.position.y = 80*Math.sin(elapsedTime * sunSpeed ) + 0;
    
    //sphere.rotation.y -= 0.005;
    
    // Update the OrbitControls target based on the camera's position
    updateOrbitControlsTarget();

    // Update Orbital Controls
    controls.update()
    
    updateLabelPositions(spheresArray);
    
    if (cameraMoveEnabled) {
        // camera.position.x += ( mouseX - camera.position.x ) * .05;
        // camera.position.y += ( - mouseY - camera.position.y ) * .05;
    }
    
    //camera.lookAt( scene.position );

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()



// !———————— Debug

// const datSunLightsFolder = gui.addFolder('SunLight')
// datSunLightsFolder.add(pointLightSun.position, 'x', -100, 100)
// datSunLightsFolder.add(pointLightSun.position, 'y', -30, 100)
// datSunLightsFolder.add(pointLightSun.position, 'z', -100, 100)
// datSunLightsFolder.add(pointLightSun, 'intensity', 0, 2)
// datSunLightsFolder.open()
// 
// const datAmbientLightsFolder = gui.addFolder('AmbientLight')
// datAmbientLightsFolder.add(ambientLight.position, 'x', -50, 50)
// datAmbientLightsFolder.add(ambientLight.position, 'y', 0, 50)
// datAmbientLightsFolder.add(ambientLight.position, 'z', 0, 50)
// datAmbientLightsFolder.add(ambientLight, 'intensity', 0, 2)
// datAmbientLightsFolder.open()

const datCameraFolder = gui.addFolder('Camera')
datCameraFolder.add(camera.position, 'x', -100, 100)
datCameraFolder.add(camera.position, 'y', 0, 100)
datCameraFolder.add(camera.position, 'z', 0, 50)
datCameraFolder.open()
