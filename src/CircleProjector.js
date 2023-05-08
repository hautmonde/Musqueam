import * as THREE from 'three';
import DecalGeometry from 'three/examples/jsm/geometries/DecalGeometry.js'


export default class CircleProjector {
  constructor(scene, camera, landscapeMesh, circleRadius = 1, circleSegments = 32, circleColor = 0xff0000) {
	this.scene = scene;
	this.camera = camera;
	this.landscapeMesh = landscapeMesh;
	this.circleRadius = circleRadius;

	// Create a flat circle geometry and a material
	const circleGeometry = new THREE.CircleBufferGeometry(circleRadius, circleSegments);
	const circleMaterial = new THREE.MeshBasicMaterial({ color: circleColor, transparent: true, depthTest: false });

	// Create a mesh from the geometry and material
	this.circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);

	// Create a raycaster
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();

	// Set up an event listener for mouse movement to update the circle's position
	this.bindMouseEvents();
  }

  bindMouseEvents() {
	window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(event) {
	event.preventDefault();
  
	// Convert mouse coordinates to normalized device coordinates
	this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
	// Update the picking ray with the camera and mouse position
	this.raycaster.setFromCamera(this.mouse, this.camera);
  
	// Calculate objects intersecting the picking ray
	const intersects = this.raycaster.intersectObject(this.landscapeMesh);
  
	if (intersects.length > 0) {
	  // Remove the previous decal if it exists
	  if (this.decalMesh) {
		this.scene.remove(this.decalMesh);
	  }
  
	  // Get the intersection point and normal
	  const intersectionPoint = intersects[0].point;
	  const intersectionNormal = intersects[0].face.normal;
  
	  // Create a decal geometry and mesh
	  const decalGeometry = new THREE.DecalGeometry(
		this.landscapeMesh.geometry,
		intersectionPoint,
		intersectionNormal,
		new THREE.Vector3(this.circleRadius * 2, this.circleRadius * 2, 1),
		new THREE.Vector3(0, 0, 1)
	  );
  
	  this.decalMesh = new THREE.Mesh(decalGeometry, this.circleMesh.material);
	  this.scene.add(this.decalMesh);
	}
  }
}