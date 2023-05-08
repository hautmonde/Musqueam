import * as THREE from 'three';

export default class CircleProjector {
  constructor(scene, camera, landscapeMesh, circleRadius = 1, circleSegments = 32, circleColor = 0xff0000) {
	this.scene = scene;
	this.camera = camera;
	this.landscapeMesh = landscapeMesh;

	// Create a flat circle geometry and a material
	const circleGeometry = new THREE.CircleBufferGeometry(circleRadius, circleSegments);
	const circleMaterial = new THREE.MeshBasicMaterial({ color: circleColor });

	// Create a mesh from the geometry and material, then add it to the scene
	this.circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
	this.circleMesh.rotation.x = -Math.PI / 2; // Rotate the circle so it's parallel to the landscape
	this.scene.add(this.circleMesh);

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
	  // Set circle position to the first intersection point
	  this.circleMesh.position.copy(intersects[0].point);
	}
  }
}