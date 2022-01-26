import {
	EventDispatcher,
	MOUSE,
	Quaternion,
	Spherical,
	TOUCH,
	Vector2,
	Vector3
} from 'three';

import { STATE } from './constants';
import { Keys, MouseButtons, Touches } from './interfaces';

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

class MyControls extends EventDispatcher {

	camera: THREE.PerspectiveCamera;
	domElement: HTMLCanvasElement;
	enabled: boolean;
	target: THREE.Vector3;
	minDistance: number;
	maxDistance: number;
	minZoom: number;
	maxZoom: number;
	minPolarAngle: number;
	maxPolarAngle: number;
	minAzimuthAngle: number;
	maxAzimuthAngle: number;
	enableDamping: boolean;
	dampingFactor: number;
	enableZoom: boolean;
	zoomSpeed: number;
	enableRotate: boolean;
	rotateSpeed: number;
	enablePan: boolean;
	panSpeed: number;
	screenSpacePanning: boolean;
	keyPanSpeed: number;
	autoRotate: boolean;
	autoRotateSpeed: number;
	keys: Keys;
	mouseButtons: MouseButtons;
	touches: Touches;
	target0: THREE.Vector3;
	position0: THREE.Vector3;
	zoom0: number;
	_domElementKeyEvents: HTMLCanvasElement | null;
	state: number;
	EPS: number;
	spherical: Spherical;
	sphericalDelta: Spherical;
	scale: number;
	panOffset: THREE.Vector3;
	zoomChanged: boolean;
	rotateStart: THREE.Vector2;
	rotateEnd: THREE.Vector2;
	rotateDelta: THREE.Vector2;
	panStart: THREE.Vector2;
	panEnd: THREE.Vector2;
	panDelta: THREE.Vector2;
	dollyStart: THREE.Vector2;
	dollyEnd: THREE.Vector2;
	dollyDelta: THREE.Vector2;
	pointers: PointerEvent[];
	pointerPositions: THREE.Vector2[];

	constructor(camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement) {

		super();


		if (domElement === undefined) console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.');

		this.camera = camera;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none'; // disable touch scroll

		// Set to false to disable this control
		this.enabled = true;

		// "target" sets the location of focus, where the object orbits around
		this.target = new Vector3();

		// How far you can dolly in and out ( PerspectiveCamera only )
		this.minDistance = 0;
		this.maxDistance = Infinity;

		// How far you can zoom in and out ( OrthographicCamera only )
		this.minZoom = 0;
		this.maxZoom = Infinity;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
		this.minAzimuthAngle = - Infinity; // radians
		this.maxAzimuthAngle = Infinity; // radians

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.enableDamping = false;
		this.dampingFactor = 0.05;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		this.enableZoom = true;
		this.zoomSpeed = 1.0;

		// Set to false to disable rotating
		this.enableRotate = true;
		this.rotateSpeed = 1.0;

		// Set to false to disable panning
		this.enablePan = true;
		this.panSpeed = 1.0;
		this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

		// Set to true to automatically rotate around the target
		// If auto-rotate is enabled, you must call controls.update() in your animation loop
		this.autoRotate = false;
		this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

		// The four arrow keys
		this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

		// Mouse buttons
		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

		// Touch fingers
		this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.camera.position.clone();
		this.zoom0 = this.camera.zoom;

		// the target DOM element for key events
		this._domElementKeyEvents = null;

		//
		// public methods
		//

		//
		// internals
		//

		this.state = STATE.NONE;

		this.EPS = 0.000001;

		// current position in spherical coordinates
		this.spherical = new Spherical();
		this.sphericalDelta = new Spherical();

		this.scale = 1;
		this.panOffset = new Vector3();
		this.zoomChanged = false;

		this.rotateStart = new Vector2();
		this.rotateEnd = new Vector2();
		this.rotateDelta = new Vector2();

		this.panStart = new Vector2();
		this.panEnd = new Vector2();
		this.panDelta = new Vector2();

		this.dollyStart = new Vector2();
		this.dollyEnd = new Vector2();
		this.dollyDelta = new Vector2();
		this.pointers = [];

		this.pointerPositions = [];

		//

		this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this));

		this.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
		this.domElement.addEventListener('pointercancel', this.onPointerCancel.bind(this));
		this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this), { passive: false });

		// force an update at start

		this.update();

	}

	getPolarAngle() {

		return this.spherical.phi;

	};

	getAzimuthalAngle() {

		return this.spherical.theta;

	};

	getDistance() {

		return this.camera.position.distanceTo(this.target);

	};

	listenToKeyEvents(domElement: HTMLCanvasElement) {

		domElement.addEventListener('keydown', this.onKeyDown.bind(this));
		this._domElementKeyEvents = domElement;

	};

	saveState() {

		this.target0.copy(this.target);
		this.position0.copy(this.camera.position);
		this.zoom0 = this.camera.zoom;

	};

	reset() {

		this.target.copy(this.target0);
		this.camera.position.copy(this.position0);
		this.camera.zoom = this.zoom0;

		this.camera.updateProjectionMatrix();
		this.dispatchEvent(_changeEvent);

		this.update();

		this.state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	update() {

		const offset = new Vector3();

		// so camera.up is the orbit axis
		const quat = new Quaternion().setFromUnitVectors(this.camera.up, new Vector3(0, 1, 0));
		const quatInverse = quat.clone().invert();

		const lastPosition = new Vector3();
		const lastQuaternion = new Quaternion();

		const twoPI = 2 * Math.PI;

		const position = this.camera.position;

		offset.copy(position).sub(this.target);

		// rotate offset to "y-axis-is-up" space
		offset.applyQuaternion(quat);

		// angle from z-axis around y-axis
		this.spherical.setFromVector3(offset);

		if (this.autoRotate && this.state === STATE.NONE) {

			this.rotateLeft(this.getAutoRotationAngle());

		}

		if (this.enableDamping) {

			this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
			this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;

		} else {

			this.spherical.theta += this.sphericalDelta.theta;
			this.spherical.phi += this.sphericalDelta.phi;

		}

		// restrict theta to be between desired limits

		let min = this.minAzimuthAngle;
		let max = this.maxAzimuthAngle;

		if (isFinite(min) && isFinite(max)) {

			if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;

			if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;

			if (min <= max) {

				this.spherical.theta = Math.max(min, Math.min(max, this.spherical.theta));

			} else {

				this.spherical.theta = (this.spherical.theta > (min + max) / 2) ?
					Math.max(min, this.spherical.theta) :
					Math.min(max, this.spherical.theta);

			}

		}

		// restrict phi to be between desired limits
		this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

		this.spherical.makeSafe();


		this.spherical.radius *= this.scale;

		// restrict radius to be between desired limits
		this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

		// move target to panned location

		if (this.enableDamping === true) {

			this.target.addScaledVector(this.panOffset, this.dampingFactor);

		} else {

			this.target.add(this.panOffset);

		}

		offset.setFromSpherical(this.spherical);

		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion(quatInverse);

		position.copy(this.target).add(offset);

		this.camera.lookAt(this.target);

		if (this.enableDamping === true) {

			this.sphericalDelta.theta *= (1 - this.dampingFactor);
			this.sphericalDelta.phi *= (1 - this.dampingFactor);

			this.panOffset.multiplyScalar(1 - this.dampingFactor);

		} else {

			this.sphericalDelta.set(0, 0, 0);

			this.panOffset.set(0, 0, 0);

		}

		this.scale = 1;

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if (this.zoomChanged ||
			lastPosition.distanceToSquared(this.camera.position) > this.EPS ||
			8 * (1 - lastQuaternion.dot(this.camera.quaternion)) > this.EPS) {

				this.dispatchEvent(_changeEvent);

			lastPosition.copy(this.camera.position);
			lastQuaternion.copy(this.camera.quaternion);
			this.zoomChanged = false;

			return true;

		}

		return false;

};

dispose() {

	this.domElement.removeEventListener('contextmenu', this.onContextMenu.bind(this));

	this.domElement.removeEventListener('pointerdown', this.onPointerDown.bind(this));
	this.domElement.removeEventListener('pointercancel', this.onPointerCancel.bind(this));
	this.domElement.removeEventListener('wheel', this.onMouseWheel.bind(this));

	this.domElement.removeEventListener('pointermove', this.onPointerMove.bind(this));
	this.domElement.removeEventListener('pointerup', this.onPointerUp.bind(this));


	if (this._domElementKeyEvents !== null) {

		this._domElementKeyEvents.removeEventListener('keydown', this.onKeyDown.bind(this));

	}

	//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

};
getAutoRotationAngle() {

	return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;

}

getZoomScale() {

	return Math.pow(0.95, this.zoomSpeed);

}

rotateLeft(angle: number) {

	this.sphericalDelta.theta -= angle;

}

rotateUp(angle: number) {

	this.sphericalDelta.phi -= angle;

}


panLeft(distance: number, objectMatrix: THREE.Matrix4) {
	const v = new Vector3();
	v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
	v.multiplyScalar(- distance);

	this.panOffset.add(v);
}

panUp(distance: number, objectMatrix: THREE.Matrix4) {
	const v = new Vector3();

	if (this.screenSpacePanning === true) {

		v.setFromMatrixColumn(objectMatrix, 1);

	} else {

		v.setFromMatrixColumn(objectMatrix, 0);
		v.crossVectors(this.camera.up, v);

	}

	v.multiplyScalar(distance);

	this.panOffset.add(v);

}

// deltaX and deltaY are in pixels; right and down are positive
pan(deltaX: number, deltaY: number) {

	const element = this.domElement;
	const offset = new Vector3();


	if (this.camera.isPerspectiveCamera) {

		// perspective
		const position = this.camera.position;
		offset.copy(position).sub(this.target);
		let targetDistance = offset.length();

		// half of the fov is center to top of screen
		targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);

		// we use only clientHeight here so aspect ratio does not distort speed
		this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.camera.matrix);
		this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.camera.matrix);

	} else {

		// camera neither orthographic nor perspective
		console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
		this.enablePan = false;
	}
}

dollyOut(dollyScale : number) {

	if (this.camera.isPerspectiveCamera) {

		this.scale /= dollyScale;

	} else {

		console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
		this.enableZoom = false;
	}

}

dollyIn(dollyScale : number) {

	if (this.camera.isPerspectiveCamera) {

		this.scale *= dollyScale;

	} else {

		console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
		this.enableZoom = false;

	}

}

//
// event callbacks - update the object state
//

handleMouseDownRotate(event : MouseEvent) {

	this.rotateStart.set(event.clientX, event.clientY);

}

handleMouseDownDolly(event : MouseEvent) {

	this.dollyStart.set(event.clientX, event.clientY);

}

handleMouseDownPan(event : MouseEvent) {

	this.panStart.set(event.clientX, event.clientY);

}

handleMouseMoveRotate(event : MouseEvent) {

	this.rotateEnd.set(event.clientX, event.clientY);

	this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

	const element = this.domElement;

	this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height

	this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);

	this.rotateStart.copy(this.rotateEnd);

	this.update();

}

handleMouseMoveDolly(event : MouseEvent) {

	this.dollyEnd.set(event.clientX, event.clientY);

	this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

	if (this.dollyDelta.y > 0) {

		this.dollyOut(this.getZoomScale());

	} else if (this.dollyDelta.y < 0) {

		this.dollyIn(this.getZoomScale());

	}

	this.dollyStart.copy(this.dollyEnd);

	this.update();

}

handleMouseMovePan(event : MouseEvent) {

	this.panEnd.set(event.clientX, event.clientY);

	this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);

	this.pan(this.panDelta.x, this.panDelta.y);

	this.panStart.copy(this.panEnd);

	this.update();

}

handleMouseUp(event : MouseEvent) {

	// no-op

}

handleMouseWheel(event : WheelEvent) {

	if (event.deltaY < 0) {

		this.dollyIn(this.getZoomScale());

	} else if (event.deltaY > 0) {

		this.dollyOut(this.getZoomScale());

	}

	this.update();

}

handleKeyDown(event : KeyboardEvent) {

	let needsUpdate = false;

	switch (event.code) {

		case this.keys.UP:
			this.pan(0, this.keyPanSpeed);
			needsUpdate = true;
			break;

		case this.keys.BOTTOM:
			this.pan(0, - this.keyPanSpeed);
			needsUpdate = true;
			break;

		case this.keys.LEFT:
			this.pan(this.keyPanSpeed, 0);
			needsUpdate = true;
			break;

		case this.keys.RIGHT:
			this.pan(- this.keyPanSpeed, 0);
			needsUpdate = true;
			break;

	}

	if (needsUpdate) {

		// prevent the browser from scrolling on cursor keys
		event.preventDefault();

		this.update();

	}


}

handleTouchStartRotate() {

	if (this.pointers.length === 1) {

		this.rotateStart.set(this.pointers[0].pageX, this.pointers[0].pageY);

	} else {

		const x = 0.5 * (this.pointers[0].pageX + this.pointers[1].pageX);
		const y = 0.5 * (this.pointers[0].pageY + this.pointers[1].pageY);

		this.rotateStart.set(x, y);

	}

}

handleTouchStartPan() {

	if (this.pointers.length === 1) {

		this.panStart.set(this.pointers[0].pageX, this.pointers[0].pageY);

	} else {

		const x = 0.5 * (this.pointers[0].pageX + this.pointers[1].pageX);
		const y = 0.5 * (this.pointers[0].pageY + this.pointers[1].pageY);

		this.panStart.set(x, y);

	}

}

handleTouchStartDolly() {

	const dx = this.pointers[0].pageX - this.pointers[1].pageX;
	const dy = this.pointers[0].pageY - this.pointers[1].pageY;

	const distance = Math.sqrt(dx * dx + dy * dy);

	this.dollyStart.set(0, distance);

}

handleTouchStartDollyPan() {

	if (this.enableZoom) this.handleTouchStartDolly();

	if (this.enablePan) this.handleTouchStartPan();

}

handleTouchStartDollyRotate() {

	if (this.enableZoom) this.handleTouchStartDolly();

	if (this.enableRotate) this.handleTouchStartRotate();

}

handleTouchMoveRotate(event : PointerEvent) {

	if (this.pointers.length == 1) {

		this.rotateEnd.set(event.pageX, event.pageY);

	} else {

		const position = this.getSecondPointerPosition(event);

		const x = 0.5 * (event.pageX + position.x);
		const y = 0.5 * (event.pageY + position.y);

		this.rotateEnd.set(x, y);

	}

	this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

	const element = this.domElement;

	this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height

	this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);

	this.rotateStart.copy(this.rotateEnd);

}

handleTouchMovePan(event : PointerEvent) {

	if (this.pointers.length === 1) {

		this.panEnd.set(event.pageX, event.pageY);

	} else {

		const position = this.getSecondPointerPosition(event);

		const x = 0.5 * (event.pageX + position.x);
		const y = 0.5 * (event.pageY + position.y);

		this.panEnd.set(x, y);

	}

	this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);

	this.pan(this.panDelta.x, this.panDelta.y);

	this.panStart.copy(this.panEnd);

}

handleTouchMoveDolly(event : PointerEvent) {

	const position = this.getSecondPointerPosition(event);

	const dx = event.pageX - position.x;
	const dy = event.pageY - position.y;

	const distance = Math.sqrt(dx * dx + dy * dy);

	this.dollyEnd.set(0, distance);

	this.dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed));

	this.dollyOut(this.dollyDelta.y);

	this.dollyStart.copy(this.dollyEnd);

}

handleTouchMoveDollyPan(event : PointerEvent) {

	if (this.enableZoom) this.handleTouchMoveDolly(event);

	if (this.enablePan) this.handleTouchMovePan(event);

}

handleTouchMoveDollyRotate(event : PointerEvent) {

	if (this.enableZoom) this.handleTouchMoveDolly(event);

	if (this.enableRotate) this.handleTouchMoveRotate(event);

}

handleTouchEnd(event : PointerEvent) {

	// no-op

}

//
// event handlers - FSM: listen for events and reset state
//

onPointerDown(event : PointerEvent) {

	if (this.enabled === false) return;
	if (this.pointers.length === 0) {
		this.domElement.setPointerCapture(event.pointerId);

		this.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
		this.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));

	}

	//

	this.addPointer(event);

	if (event.pointerType === 'touch') {

		this.onTouchStart(event);

	} else {

		this.onMouseDown(event);

	}

}

onPointerMove(event : PointerEvent) {

	if (this.enabled === false) return;

	if (event.pointerType === 'touch') {

		this.onTouchMove(event);

	} else {

		this.onMouseMove(event);

	}

}

onPointerUp(event : PointerEvent) {

	if (this.enabled === false) return;

	if (event.pointerType === 'touch') {

		this.onTouchEnd(event);

	} else {

		this.onMouseUp(event);

	}

	this.removePointer(event);

	//

	if (this.pointers.length === 0) {

		this.domElement.releasePointerCapture(event.pointerId);

		this.domElement.removeEventListener('pointermove', this.onPointerMove);
		this.domElement.removeEventListener('pointerup', this.onPointerUp);

	}

}

onPointerCancel(event : PointerEvent) {

	this.removePointer(event);

}

onMouseDown(event : MouseEvent) {

	let mouseAction;

	switch (event.button) {

		case 0:

			mouseAction = this.mouseButtons.LEFT;
			break;

		case 1:

			mouseAction = this.mouseButtons.MIDDLE;
			break;

		case 2:

			mouseAction = this.mouseButtons.RIGHT;
			break;

		default:

			mouseAction = - 1;

	}
	switch (mouseAction) {


		case MOUSE.DOLLY:

			if (this.enableZoom === false) return;

			this.handleMouseDownDolly(event);

			this.state = STATE.DOLLY;

			break;

		case MOUSE.ROTATE:

			if (event.ctrlKey || event.metaKey || event.shiftKey) {

				if (this.enablePan === false) return;

				this.handleMouseDownPan(event);

				this.state = STATE.PAN;

			} else {

				if (this.enableRotate === false) return;

				this.handleMouseDownRotate(event);

				this.state = STATE.ROTATE;

			}

			break;

		case MOUSE.PAN:

			if (event.ctrlKey || event.metaKey || event.shiftKey) {

				if (this.enableRotate === false) return;

				this.handleMouseDownRotate(event);

				this.state = STATE.ROTATE;

			} else {

				if (this.enablePan === false) return;

				this.handleMouseDownPan(event);

				this.state = STATE.PAN;

			}

			break;

		default:

			this.state = STATE.NONE;

	}

	if (this.state !== STATE.NONE) {

		this.dispatchEvent(_startEvent);

	}

}

onMouseMove(event : MouseEvent) {

	if (this.enabled === false) return;

	switch (this.state) {

		case STATE.ROTATE:

			if (this.enableRotate === false) return;

			this.handleMouseMoveRotate(event);

			break;

		case STATE.DOLLY:

			if (this.enableZoom === false) return;

			this.handleMouseMoveDolly(event);

			break;

		case STATE.PAN:

			if (this.enablePan === false) return;

			this.handleMouseMovePan(event);

			break;

	}

}

onMouseUp(event : MouseEvent) {

	this.handleMouseUp(event);

	this.dispatchEvent(_endEvent);

	this.state = STATE.NONE;

}

onMouseWheel(event : WheelEvent) {

	if (this.enabled === false || this.enableZoom === false || this.state !== STATE.NONE) return;

	event.preventDefault();

	this.dispatchEvent(_startEvent);

	this.handleMouseWheel(event);

	this.dispatchEvent(_endEvent);

}

onKeyDown(event : KeyboardEvent) {

	if (this.enabled === false || this.enablePan === false) return;

	this.handleKeyDown(event);

}

onTouchStart(event : PointerEvent) {

	this.trackPointer(event);

	switch (this.pointers.length) {

		case 1:

			switch (this.touches.ONE) {

				case TOUCH.ROTATE:

					if (this.enableRotate === false) return;

					this.handleTouchStartRotate();

					this.state = STATE.TOUCH_ROTATE;

					break;

				case TOUCH.PAN:

					if (this.enablePan === false) return;

					this.handleTouchStartPan();

					this.state = STATE.TOUCH_PAN;

					break;

				default:

					this.state = STATE.NONE;

			}

			break;

		case 2:

			switch (this.touches.TWO) {

				case TOUCH.DOLLY_PAN:

					if (this.enableZoom === false && this.enablePan === false) return;

					this.handleTouchStartDollyPan();

					this.state = STATE.TOUCH_DOLLY_PAN;

					break;

				case TOUCH.DOLLY_ROTATE:

					if (this.enableZoom === false && this.enableRotate === false) return;

					this.handleTouchStartDollyRotate();

					this.state = STATE.TOUCH_DOLLY_ROTATE;

					break;

				default:

					this.state = STATE.NONE;

			}

			break;

		default:

			this.state = STATE.NONE;

	}

	if (this.state !== STATE.NONE) {

		this.dispatchEvent(_startEvent);

	}

}

onTouchMove(event : PointerEvent) {

	this.trackPointer(event);

	switch (this.state) {

		case STATE.TOUCH_ROTATE:

			if (this.enableRotate === false) return;

			this.handleTouchMoveRotate(event);

			this.update();

			break;

		case STATE.TOUCH_PAN:

			if (this.enablePan === false) return;

			this.handleTouchMovePan(event);

			this.update();

			break;

		case STATE.TOUCH_DOLLY_PAN:

			if (this.enableZoom === false && this.enablePan === false) return;

			this.handleTouchMoveDollyPan(event);

			this.update();

			break;

		case STATE.TOUCH_DOLLY_ROTATE:

			if (this.enableZoom === false && this.enableRotate === false) return;

			this.handleTouchMoveDollyRotate(event);

			this.update();

			break;

		default:

			this.state = STATE.NONE;

	}

}

onTouchEnd(event : PointerEvent) {

	this.handleTouchEnd(event);

	this.dispatchEvent(_endEvent);

	this.state = STATE.NONE;

}

onContextMenu(event : UIEvent) {

	if (this.enabled === false) return;

	event.preventDefault();

}

addPointer(event : PointerEvent) {

	this.pointers.push(event);

}

removePointer(event : PointerEvent) {

	delete this.pointerPositions[event.pointerId];

	for (let i = 0; i < this.pointers.length; i++) {

		if (this.pointers[i].pointerId == event.pointerId) {

			this.pointers.splice(i, 1);
			return;

		}

	}

}

trackPointer(event : PointerEvent) {

	let position = this.pointerPositions[event.pointerId];

	if (position === undefined) {

		position = new Vector2();
		this.pointerPositions[event.pointerId] = position;

	}

	position.set(event.pageX, event.pageY);

}

getSecondPointerPosition(event : PointerEvent) {

	const pointer = (event.pointerId === this.pointers[0].pointerId) ? this.pointers[1] : this.pointers[0];

	return this.pointerPositions[pointer.pointerId];

}
}

export { MyControls };
