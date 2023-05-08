import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
//import { GUI } from 'dat.gui'
import { InteractionManager } from 'three.interactive';

// Set up the scene, camera, and renderer
// Create and add lights
// Load textures and materials
// Create and add objects (geometries and meshes)
// Set up controls and user interactions (such as mouse and keyboard events)
// Implement animation and rendering logic in the main loop


// !————————Setup
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Manager
const manager = new THREE.LoadingManager( loadTheModel );

// Containers
let landscapeMesh;


let container;
container = document.createElement( 'div' );
document.body.appendChild( container );

// Screen Setup
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Gravity

const gravityRay = new THREE.Raycaster();
const gravityDirection = new THREE.Vector3(0, -1, 0);
















// UI Raycaster etc

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [];



function onClick(event) {
  event.preventDefault();

  // Convert the mouse position to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(clickableObjects);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;

    // Calculate the position of the sphere in screen coordinates
    const screenPos = intersectedObject.position.clone().project(camera);
    screenPos.x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    screenPos.y = (1 - (screenPos.y * 0.5 + 0.5)) * window.innerHeight;

    // Show the tooltip with text above the sphere
    showTooltip(intersectedObject.name, screenPos.x, screenPos.y);
  }
}

function checkForHover() {
  
}

function showContent(object) {
  const content = document.querySelector(".content");
  content.style.display = "block";
  
  // Update the content text
  content.innerHTML = object.name;

  // Get the object's screen coordinates
  const screenPos = object.position.clone().project(camera);

  // Convert the normalized coordinates to the actual screen coordinates
  const x = (screenPos.x * window.innerWidth) / 2 + window.innerWidth / 2;
  const y = -(screenPos.y * window.innerHeight) / 2 + window.innerHeight / 2;

  // Position the content above the sphere
  content.style.left = x + "px";
  content.style.top = y + "px";
}

function showTooltip(text, x, y) {
  let tooltip = document.getElementById("tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
  tooltip.textContent = text;
  tooltip.style.display = "block";
}
















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

function placeObjectOnMesh(object, mesh, x, z) {
    // Set the object's initial position above the highest vertex of the landscape
    const highestY = getHighestVertexY(mesh);
    object.position.set(x, highestY + 50, z);

    // Update the raycaster's origin to match the object's position
    gravityRay.set(object.position, gravityDirection);

    // Perform raycasting to find intersections between the object and the mesh
    const intersects = gravityRay.intersectObject(mesh);

    // If there's an intersection, update the object's y position
    if (intersects.length > 0) {
        object.position.y = intersects[0].point.y + mesh.position.y;
    } else {
        console.error('No intersection found. Ensure the object is above the mesh.');
    }
}

// Separate the loading and initialization of the landscape


function loadTheModel(url) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader(manager);
    loader.load(
      url,
      (obj) => {
        resolve(obj);
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
    const landscape = await loadTheModel("models/obj/test2/test2.obj");
    landscape.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture;
        child.material.flatShading = false;

        child.geometry.deleteAttribute("normal");
        child.geometry = BufferGeometryUtils.mergeVertices(child.geometry);
        child.geometry.computeVertexNormals();
        child.castShadow = true; //default is false
        child.receiveShadow = true; //default
        landscapeMesh = child;
      }
    });

    //landscape.position.y = -15;
    scene.add(landscape);

    // Place the spheres on the landscape after it is added to the scene
    placeObjectOnMesh(sphere1, landscapeMesh, 3, 3);
    placeObjectOnMesh(sphere2, landscapeMesh, -3, -3);
  } catch (error) {
    console.error("Error loading landscape:", error);
  }
}

initLandscape();










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

document.addEventListener( 'mousemove', onDocumentMouseMove );





// !————————Objects, Mats

// Objects
const geometry = new THREE.TorusGeometry( .7, .2, 16, 100 );

// Materials

const material = new THREE.MeshBasicMaterial()
material.color = new THREE.Color(0xff0000)

// Mesh
const sphere = new THREE.Mesh(geometry,material)
sphere.castShadow = true; //default is false
sphere.receiveShadow = false; //default
sphere.scale.set(2,2,2)
scene.add(sphere)

// texture

const textureLoader = new THREE.TextureLoader( manager );
const texture = textureLoader.load( 'textures/test2b.JPG' );


// Spheres

const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
scene.add(sphere1);

const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshStandardMaterial({ color: 0x00ff00 }));
scene.add(sphere2);

sphere1.name = "Sphere 1";
sphere2.name = "Sphere 2";

clickableObjects.push(sphere1);
clickableObjects.push(sphere2);

canvas.addEventListener("click", onClick, false);

// !————————Lights

const pointLightSun = new THREE.PointLight( 0xffffcc, .5, 2000 );
pointLightSun.position.set( 10, 10, 10 );
pointLightSun.rotation.set( 0, Math.PI, 0 );

pointLightSun.castShadow = true; // default false

//Set up shadow properties for the light
pointLightSun.shadow.mapSize.width = 512; // default
pointLightSun.shadow.mapSize.height = 512; // default
pointLightSun.shadow.camera.near = 0.5; // default
pointLightSun.shadow.camera.far = 500; // default


scene.add( pointLightSun );

const sphereSize = 1;
const pointLightSunHelper = new THREE.PointLightHelper( pointLightSun, sphereSize );
scene.add( pointLightSunHelper );

const ambientLight = new THREE.AmbientLight( 0xcccccc );
ambientLight.intensity = 1.3;
scene.add( ambientLight );

let sunSpeed = .3;







// !————————Camera

/**
 * Camera
 */
// Base camera
//const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// New one
const camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 1, 2000 );
camera.position.z = 20;
camera.position.x = 0
camera.position.y = 0
scene.add(camera)





// !————————Control

let cameraMoveEnabled = true;

function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - windowHalfX ) / 2;
    mouseY = ( event.clientY - windowHalfY ) / 2;
}

// Key Listener
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    let keyCode = event.which;
    if (keyCode == 32) {
        cameraMoveEnabled = !cameraMoveEnabled;
    }
}





// Loading

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

function onError() {}








// !————————Fog


scene.fog = new THREE.Fog( 0xcccccc, 25, 100 );







// !————————Data

const datSunLightsFolder = gui.addFolder('SunLight')
datSunLightsFolder.add(pointLightSun.position, 'x', -100, 100)
datSunLightsFolder.add(pointLightSun.position, 'y', -30, 100)
datSunLightsFolder.add(pointLightSun.position, 'z', -100, 100)
datSunLightsFolder.add(pointLightSun, 'intensity', 0, 2)
datSunLightsFolder.open()

const datAmbientLightsFolder = gui.addFolder('AmbientLight')
datAmbientLightsFolder.add(ambientLight.position, 'x', -50, 50)
datAmbientLightsFolder.add(ambientLight.position, 'y', 0, 50)
datAmbientLightsFolder.add(ambientLight.position, 'z', 0, 50)
datAmbientLightsFolder.add(ambientLight, 'intensity', 0, 2)
datAmbientLightsFolder.open()

const datCameraFolder = gui.addFolder('Camera')
datCameraFolder.add(camera.position, 'x', -100, 100)
datCameraFolder.add(camera.position, 'y', 0, 100)
datCameraFolder.add(camera.position, 'z', 0, 50)
datCameraFolder.open()


// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true



// !————————Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))





// !————————Clock Animation

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    //pointLightSun.rotation.y = .5 * elapsedTime
     
    pointLightSun.position.x = 80*Math.cos(elapsedTime * sunSpeed) + 0;
    pointLightSun.position.y = 80*Math.sin(elapsedTime * sunSpeed ) + 0;
    
    sphere.rotation.y -= 0.005;

    // Update Orbital Controls
    //controls.update()
    
    showContent(selectedSphere);
    
    if (cameraMoveEnabled) {
        camera.position.x += ( mouseX - camera.position.x ) * .05;
        camera.position.y += ( - mouseY - camera.position.y ) * .05;
    }
    
    camera.lookAt( scene.position );

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()