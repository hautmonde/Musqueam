import * as THREE from 'three';

export default class CircleProjector {
  constructor(scene, camera, landscapeMesh, circleRadius = 1, circleSegments = 32, circleColor = 0xff0000) {
	this.scene = scene;
	this.camera = camera;
	this.landscapeMesh = landscapeMesh;

	// Create a canvas and a 2D rendering context for drawing the circle
	this.canvas = document.createElement('canvas');
	this.canvas.width = 1024;
	this.canvas.height = 1024;
	this.ctx = this.canvas.getContext('2d');

	// Draw the initial circle onto the canvas
	this.drawCircle(this.canvas.width / 2, this.canvas.height / 2, circleRadius * this.canvas.width, `#${circleColor.toString(16)}`);


	// Create a texture from the canvas and use it as a map for the landscape's material
	const texture = new THREE.CanvasTexture(this.canvas);
	this.landscapeMesh.material.map = texture;
	this.landscapeMesh.material.needsUpdate = true;

	// Create a raycaster
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();

	// Set up an event listener for mouse movement to update the circle's position
	this.bindMouseEvents();
  }

  drawCircle(x, y, radius, color) {
	this.ctx.beginPath();
	this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
	this.ctx.fillStyle = `#${color.toString(16)}`;
	this.ctx.fill();
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
	  // Get the intersection point's UV coordinates
	  const uv = intersects[0].uv;

	  // Clear the canvas
	  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	  // Calculate the new circle position on the canvas
	  const x = uv.x * this.canvas.width;
	  const y = (1 - uv.y) * this.canvas.height;

	  // Draw the circle at the new position
	  this.drawCircle(x, y, this.circleRadius * this.canvas.width, this.circleColor);

	  // Update the texture
	  this.landscapeMesh.material.map.needsUpdate = true;
	}
  }
}






